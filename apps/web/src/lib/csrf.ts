/**
 * CSRF Token Hook
 * Provides CSRF token for authenticated requests
 */
'use client';

import { useEffect, useState } from 'react';

export function useCSRFToken(): string | null {
    const [csrfToken, setCSRFToken] = useState<string | null>(null);

    useEffect(() => {
        // Get CSRF token from cookie
        const getCookie = (name: string): string | null => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                return parts.pop()?.split(';').shift() || null;
            }
            return null;
        };

        const token = getCookie('csrf-token');
        setCSRFToken(token);
    }, []);

    return csrfToken;
}

/**
 * Fetch wrapper with CSRF token
 */
export async function fetchWithCSRF(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1];

    const headers = new Headers(options.headers);

    if (csrfToken && options.method && !['GET', 'HEAD'].includes(options.method)) {
        headers.set('x-csrf-token', csrfToken);
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies
    });
}
