/**
 * Security Configuration for Next.js
 * Defines CSP and other security policies
 */

export const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY'
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
    }
];

// CSP Directives
export const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-eval'", // Required for Next.js dev
        "'unsafe-inline'", // Required for Next.js
        'https://vercel.live',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'connect-src': [
        "'self'",
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        'https://vercel.live',
    ],
};

// Generate CSP header string
export function generateCSP(): string {
    const csp = Object.entries(cspDirectives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');

    if (process.env.NODE_ENV === 'production') {
        return csp + '; upgrade-insecure-requests';
    }

    return csp;
}

// Cookie Security Settings
export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
};
