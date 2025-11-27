import { type VercelRequest, type VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_REDIRECT = process.env.NEXT_PUBLIC_APP_REDIRECT || '/';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

function serializeCookie(name: string, value: string, options: any = {}) {
    const opts = {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days by default
        ...options,
    };

    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    if (opts.maxAge != null) cookie += `; Max-Age=${opts.maxAge}`;
    if (opts.domain) cookie += `; Domain=${opts.domain}`;
    if (opts.path) cookie += `; Path=${opts.path}`;
    if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`;
    if (opts.secure) cookie += '; Secure';
    if (opts.httpOnly) cookie += '; HttpOnly';
    return cookie;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { query, method, body } = req;
        const code = query.code || (method === 'POST' && body && body.code);

        if (!code) {
            return res.status(400).send('Missing "code" in callback request');
        }

        // Exchange code for tokens using Supabase's token endpoint.
        const tokenUrl = `${SUPABASE_URL}/auth/v1/token?grant_type=authorization_code`;
        const params = new URLSearchParams();
        params.append('code', String(code));
        // If you passed redirect_uri during authorize, include the same redirect_uri here.
        // params.append('redirect_uri', 'https://hideout-ai-plugin.vercel.app/api/discord/callback');

        const resp = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: params.toString(),
        });

        if (!resp.ok) {
            const text = await resp.text();
            console.error('Token exchange failed', resp.status, text);
            return res.status(502).send('Failed to exchange code for session');
        }

        const json = await resp.json();

        if (!json.access_token || !json.refresh_token) {
            console.error('Unexpected token response', json);
            return res.status(502).send('Invalid token response from Supabase');
        }

        const cookiePayload = {
            access_token: json.access_token,
            refresh_token: json.refresh_token,
            expires_at: Date.now() + (json.expires_in ? json.expires_in * 1000 : 60 * 60 * 1000),
        };

        const serialized = Buffer.from(JSON.stringify(cookiePayload)).toString('base64url');

        const cookie = serializeCookie('sb_session', serialized, {
            maxAge: cookiePayload.expires_at ? Math.floor((cookiePayload.expires_at - Date.now()) / 1000) : undefined,
            path: '/',
            sameSite: 'lax',
            httpOnly: true,
            secure: true,
        });

        res.setHeader('Set-Cookie', cookie);
        res.writeHead(302, { Location: APP_REDIRECT });
        res.end();
    } catch (err) {
        console.error('Callback handler error', err);
        return res.status(500).send('Internal Server Error');
    }
}
