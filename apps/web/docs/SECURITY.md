# Yield Guardian - Security Implementation

Let's be real—security in DeFi isn't optional. Here's how I approached securing the Yield Guardian frontend and API to ensure we aren't just one XSS attack away from losing funds.

## 1. Content Security Policy (CSP)

I implemented a strict Content Security Policy using Next.js middleware because just trusting the browser isn't enough.

### The Setup (`middleware.ts`)

Instead of a permissive policy, I went with a strict whitelist approach:
- **`default-src 'self'`**: Only load things from our own origin by default.
- **`script-src`**: Used nonces for inline scripts (required by Next.js) and blocked `unsafe-eval` in production.
- **`frame-ancestors 'none'`**: This kills clickjacking dead. No one can iframe our dashboard.

**Why middleware?**
Putting this in `middleware.ts` means it runs on the edge before the page even renders, adding headers to every response automatically.

## 2. CSRF Protection

Since the dashboard can trigger agent actions (like starting/stopping rebalancing), Cross-Site Request Forgery (CSRF) was a major concern.

### My Approach
I built a double-submit cookie pattern:
1. **Server-side**: Generates a random token and sets it as an `httpOnly` cookie.
2. **Client-side**: A React hook (`useCSRFToken`) creates a matching header (`x-csrf-token`) for state-changing requests.
3. **Middleware**: Verifies the header matches the cookie before allowing the request to hit the API.

This is implemented in `src/lib/csrf.ts` and validated in `middleware.ts`. It's a bit of extra work for the fetch wrapper, but it locks down the API effectively.

## 3. Headers & Transport Security

Beyond CSP, I added standard hardening headers to `src/lib/security.ts`:

- **HSTS**: `Strict-Transport-Security` is set to 1 year in production. HTTPS or nothing.
- **X-content-Type-Options**: `nosniff` prevents the browser from guessing MIME types (a classic attack vector).
- **Referrer-Policy**: `strict-origin-when-cross-origin` keeps query params private when linking out.
- **Permissions-Policy**: Explicitly disabled access to camera, mic, and geolocation. The dashboard doesn't need them, so why leave them open?

## 4. Input Validation (The First Line of Defense)

While not strictly "frontend" security, the API relies on Zod schemas for everything. I'm not trusting any JSON sent from the client without validating it first.

- **Type Safety**: TypeScript integration means I get compile-time errors if the schemas drift from the code.
- **Sanitization**: Inputs are stripped of dangerous characters before they hit business logic.

## 5. Testing & Verification

I manually verified these using `curl` and browser dev tools:
- Tried embedding the site in an iframe -> **Blocked**.
- Tried injecting scripts -> **Blocked by CSP**.
- Tried making API calls without the CSRF header -> **Rejected (403)**.

## Future Improvements

If I had more time, I'd add:
- **Rate Limiting on the Frontend**: Currently, the backend handles it (300 req/min), but client-side feedback would be better UX.
- **Subresource Integrity (SRI)**: Hashing external scripts to ensure they haven't been tampered with.
- **Audit Logs in UI**: Showing the user exactly what actions were taken and when.

---
*Built with paranoia during the IQAI Hackathon.*
