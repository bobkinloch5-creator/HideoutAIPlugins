import { type VercelRequest, type VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
        env: {
            node_env: process.env.NODE_ENV,
            vercel: process.env.VERCEL
        }
    });
}
