# Security Implementation Guide

This document outlines all security measures implemented in the Hitpoint Terminal application.

## Security Features Implemented

### 1. Rate Limiting
- **Location**: `lib/ratelimit.ts`
- **Implementation**: Uses Upstash Redis for distributed rate limiting
- **Limits**: 10 requests per 10 seconds per IP address
- **Development Mode**: Automatically disabled when Redis credentials are not set
- **Production Setup**: Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables

### 2. Input Validation
- **Location**: `lib/validation.ts`
- **Library**: Zod for runtime type checking
- **Coverage**:
  - WebSocket data validation (BTC ticker)
  - REST API responses (Binance, CoinGecko, Bybit, Alternative.me)
  - All external data sources validated before use

### 3. Security Headers
- **Location**: `next.config.ts`
- **Headers Implemented**:
  - `X-Frame-Options: DENY` - Prevents clickjacking
  - `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
  - `X-XSS-Protection: 1; mode=block` - Legacy XSS protection
  - `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
  - `Permissions-Policy` - Disables unnecessary browser features
  - `Strict-Transport-Security` - Forces HTTPS (31536000 seconds = 1 year)
  - **Content Security Policy (CSP)**:
    - `default-src 'self'` - Only load resources from same origin
    - `script-src 'self'` - No inline scripts or unsafe-eval
    - `style-src 'self' https://fonts.googleapis.com` - Controlled style sources
    - `font-src 'self' https://fonts.gstatic.com` - Font sources
    - `img-src 'self' data: [trusted-domains]` - Image sources
    - `connect-src` - Whitelisted API endpoints only
    - `frame-src` - Only trusted iframe sources

### 4. iframe Security
- **Location**: `components/LiquidationBubbles.tsx`
- **Configuration**: `sandbox="allow-scripts allow-popups"`
- **Removed**: Dangerous `allow-same-origin` permission
- **Effect**: Embedded content cannot access parent origin or execute privileged operations

### 5. Environment-Aware Logging
- **Location**: `lib/logger.ts`
- **Development**: Full error details logged to console
- **Production**: Generic error messages only, preventing sensitive data exposure
- **Usage**: Replace all `console.log/error/warn` with `logger.log/error/warn`

### 6. API Route Security
- **Files**: `app/api/coingecko/markets/route.ts`, `app/api/coingecko/global/route.ts`
- **Features**:
  - Rate limiting per IP
  - Input validation of external API responses
  - Content-Type validation
  - Proper error handling with fallback data
  - Rate limit headers in responses

## Production Deployment Checklist

### Required Environment Variables
```bash
# Upstash Redis (Required for rate limiting in production)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Node Environment
NODE_ENV=production
```

### Setup Steps

1. **Get Upstash Redis Credentials** (Free tier available)
   - Sign up at https://upstash.com
   - Create a new Redis database
   - Copy REST URL and token

2. **Set Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Verify Security Headers**
   - Deploy to staging
   - Use https://securityheaders.com to scan your deployment
   - Verify all headers are present

4. **Test Rate Limiting**
   - Send 11+ requests within 10 seconds to any API endpoint
   - Should receive 429 (Too Many Requests) response

5. **Verify CSP**
   - Open browser console on deployed site
   - Check for CSP violation warnings
   - Adjust CSP if legitimate resources are blocked

## Security Monitoring

### What to Monitor
1. **Rate Limit Violations**: Track 429 responses
2. **Validation Failures**: Monitor logs for validation errors
3. **CSP Violations**: Set up CSP reporting endpoint
4. **API Errors**: Track external API failures

### Recommended Tools
- **Sentry** - Error tracking and monitoring
- **Upstash Analytics** - Rate limit monitoring
- **Vercel Analytics** - Request monitoring

## Known Limitations

1. **Rate Limiting in Development**: Disabled when Redis credentials are not set
2. **CSP for TradingView/CoinGlass**: Relaxed to allow embedded widgets
3. **Client-Side Validation**: Additional to server-side, not a replacement

## Security Best Practices Followed

- ✅ No hardcoded secrets
- ✅ Environment variables for sensitive data
- ✅ Input validation on all external data
- ✅ Proper error handling without leaking details
- ✅ Rate limiting on all API endpoints
- ✅ Strict CSP without unsafe-inline/unsafe-eval
- ✅ HTTPS enforcement via HSTS
- ✅ Secure iframe sandboxing
- ✅ Defense in depth approach

## Reporting Security Issues

If you discover a security vulnerability, please email: [your-security-email]

DO NOT open a public GitHub issue for security vulnerabilities.

## Audit History

- **2025-12-04**: Initial security implementation
  - Rate limiting added
  - Input validation with Zod
  - CSP headers hardened
  - iframe sandboxing improved
  - Environment-aware logging
  - All dependencies audited (0 vulnerabilities)

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
