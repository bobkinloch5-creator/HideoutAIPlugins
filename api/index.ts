// Vercel serverless function entry point
// @ts-ignore - CJS module doesn't have type declarations
import { app, setupServer } from '../dist/index.cjs';

export default async function handler(req: any, res: any) {
    try {
        // Ensure server is initialized (routes registered)
        await setupServer();
    } catch (e: any) {
        console.error("Server initialization failed:", e);
        return res.status(500).json({
            error: "Server initialization failed",
            details: e.message
        });
    }

    // Pass request to Express app
    return app(req, res);
}
