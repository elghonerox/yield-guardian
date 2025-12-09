/**
 * Next.js Middleware for Security Headers
 * Implements CSP, CSRF protection, and other security best practices
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Generate nonce for CSP
function generateNonce(): string {
    return Buffer.from(crypto.randomUUID()).toString('base64');
}

export function middleware(request: NextRequest) {
    const nonce = generateNonce();
    const response = NextResponse.next();

    // Content Security Policy (CSP)
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'} https://vercel.live;
  `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Content-Security-Policy', cspHeader);

    // Additional Security Headers
    response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
    response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block'); // Legacy XSS protection
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // HSTS (HTTP Strict Transport Security) - only in production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    // CSRF Token Generation
    // Set CSRF token cookie if not present
    if (!request.cookies.get('csrf-token')) {
        const csrfToken = crypto.randomUUID();
        response.cookies.set('csrf-token', csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
    }

    // Store nonce for CSP
    response.headers.set('x-nonce', nonce);

    return response;
}

// CSRF Validation for state-changing requests
export function validateCSRF(request: NextRequest): boolean {
    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return true;
    }

    const csrfTokenCookie = request.cookies.get('csrf-token')?.value;
    const csrfTokenHeader = request.headers.get('x-csrf-token');

    if (!csrfTokenCookie || !csrfTokenHeader) {
        return false;
    }

    return csrfTokenCookie === csrfTokenHeader;
}

// Apply middleware to all routes except static files
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
