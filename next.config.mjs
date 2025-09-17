/** @type {import('next').NextConfig} */
const nextConfig = {
  // Smaller responses and leaner headers
  poweredByHeader: false,
  compress: true,

  images: {
    domains: ['images.pexels.com'],
    // Explicit formats for optimal delivery
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images longer at the CDN layer
    minimumCacheTTL: 60 * 60 * 24, // 1 day
    // remotePatterns: [{ protocol: 'https', hostname: 'images.pexels.com' }],
  },

  

  

  compiler: {
    // Trim console.* in production bundles
    removeConsole: { exclude: ['error', 'warn'] },
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      // Allow embedding trusted iframes (e.g., Google Maps embed)
      "frame-src 'self' https://www.google.com https://maps.google.com",
      // For broader compatibility with older CSP implementations
      "child-src 'self' https://www.google.com https://maps.google.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://images.pexels.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
