import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://www.gstatic.com https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com",
      "connect-src 'self' https://tanmay-portfolio-chatbot.tanmayraut.workers.dev https://vitals.vercel-insights.com https://prod.spline.design https://www.gstatic.com https://unpkg.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  env: {
    // Cloudflare Worker URL for the AI chatbot.
    // Set after `wrangler deploy` outputs the URL.
    // Override locally with: NEXT_PUBLIC_CHAT_API_URL=http://localhost:8787 npm run dev
    NEXT_PUBLIC_CHAT_API_URL:
      process.env.NEXT_PUBLIC_CHAT_API_URL ||
      "https://tanmay-portfolio-chatbot.tanmayraut.workers.dev",
  },
};

export default nextConfig;
