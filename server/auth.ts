import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string | null) {
    if (!stored) return false;
    const [hashed, salt] = stored.split(".");
    const hashedSuppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const hashedStoredBuf = Buffer.from(hashed, "hex");
    return timingSafeEqual(hashedSuppliedBuf, hashedStoredBuf);
}

async function hashPassword(password: string) {
    const salt = Math.random().toString(36).substring(2, 15);
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "super_secret_key",
        resave: false,
        saveUninitialized: false,
        store: new (connectPg(session))({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true,
        }),
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
    };

    if (process.env.NODE_ENV === "production") {
        app.set("trust proxy", 1);
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                let user;
                if (username.includes("@")) {
                    user = await storage.getUserByEmail(username);
                }
                if (!user) {
                    user = await storage.getUserByUsername(username);
                }

                if (!user || !(await comparePasswords(password, user.password))) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        }),
    );

    passport.serializeUser((user, done) => done(null, (user as User).id));
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/register", async (req, res, next) => {
        try {
            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const hashedPassword = await hashPassword(req.body.password);
            const user = await storage.createUser({
                ...req.body,
                password: hashedPassword,
            });

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.status(200).json(req.user);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    // Endpoint to sync external (Supabase/Discord) login with server session
    app.post("/api/login/external", async (req, res) => {
        try {
            const { username, email, externalId } = req.body;

            if (!externalId) {
                return res.status(400).json({ message: "External ID required" });
            }

            // Check if user exists by external ID (which we store as ID for Discord users)
            // OR by username if it's a legacy user
            let user = await storage.getUser(externalId);

            if (!user) {
                // Create new user for this external login
                // We use a dummy password since they auth via Supabase
                const hashedPassword = await hashPassword(`ext_${Date.now()}_${Math.random()}`);

                try {
                    user = await storage.createUser({
                        id: externalId, // Use the Supabase/Discord ID as the primary key
                        username: username || `user_${externalId.substring(0, 8)}`,
                        email: email,
                        password: hashedPassword,
                    });
                } catch (e) {
                    // If creation fails (e.g. username taken), try fetching by username
                    user = await storage.getUserByUsername(username);
                    if (!user) throw e;
                }
            }

            // Log them in to the express session
            req.login(user, (err) => {
                if (err) {
                    console.error("Session login error:", err);
                    return res.status(500).json({ message: "Login failed" });
                }
                res.json(user);
            });
        } catch (error) {
            console.error("External login error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}

export function isAuthenticated(req: any, res: any, next: any) {
    if (req.isAuthenticated()) {
        // Normalize req.user.claims.sub for existing routes that expect Replit structure
        if (!req.user.claims) {
            req.user.claims = { sub: req.user.id };
        }
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}
