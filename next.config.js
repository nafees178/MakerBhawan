/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = [
  {
    // Prevent MIME-type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Prevent clickjacking by disallowing iframes
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Explicitly off: the legacy XSS auditor is gone from current browsers
    // and, where it still exists, has been used to create holes, not close them
    key: 'X-XSS-Protection',
    value: '0',
  },
  {
    // Control referrer information sent with requests
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Disable unnecessary browser features
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    // Force HTTPS for 2 years (including subdomains)
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Content Security Policy — controls what resources can load
    // 'unsafe-inline' stays because Next's inline bootstrap scripts carry no
    // nonce; removing it means nonce-based CSP through proxy.ts. 'unsafe-eval'
    // is only for the dev server's hot reload, so production does not get it.
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  images: { unoptimized: true },

  // `next dev` otherwise writes AGENTS.md and CLAUDE.md into the repo.
  agentRules: false,

  // Member photos are uploaded through a server action; the 1 MB default is
  // smaller than a phone photo. saveMember enforces its own 4 MB cap.
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },

  // Hide the X-Powered-By: Next.js header (information disclosure)
  poweredByHeader: false,

  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
