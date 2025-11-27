import passport from "passport";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { pool } from "./db";
import { scrypt } from "crypto";

const scryptAsync = promisify(scrypt);

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
            pool,
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

    passport.serializeUser((user, done) => done(null, (user as User).id));
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    // Endpoint to sync external (Discord) login with server session
    app.post("/api/login/external", async (req, res) => {
        try {
            const { username, email, externalId } = req.body;

            if (!externalId) {
                return res.status(400).json({ message: "External ID required" });
            }

            let user = await storage.getUser(externalId);

            if (!user) {
                // Create new user for Discord login
                const hashedPassword = await hashPassword(`ext_${Date.now()}_${Math.random()}`);

                try {
                    user = await storage.createUser({
                        id: externalId,
                        username: username || `user_${externalId.substring(0, 8)}`,
                        email: email,
                        password: hashedPassword,
                    });
                } catch (e) {
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
                req.session.save((err) => {
                    if (err) {
                        console.error("Session save error:", err);
                        return res.status(500).json({ message: "Session save failed" });
                    }
                    res.json(user);
                });
            });
        } catch (error) {
            console.error("External login error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}

export function isAuthenticated(req: any, res: any, next: any) {
    if (req.isAuthenticated()) {
        if (!req.user.claims) {
            req.user.claims = { sub: req.user.id };
        }
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}
