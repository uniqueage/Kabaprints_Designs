import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images are served straight from /public or from the Supabase public bucket,
  // so the built-in optimizer stays off.
  images: { unoptimized: true },

  // Hosts allowed to make dev-server requests (used by the cloud preview).
  // Production is unaffected.
  allowedDevOrigins: ["pv-499b33993b90-917662ef-ebc6-40b3-a459-3c8b40a99b7b.style.dev"],

  experimental: {
    serverActions: {
      // The admin dashboard uploads product/portfolio/hero images through
      // server actions; the 1 MB default is too small for real photos.
      // (Vercel caps request bodies at ~4.5 MB.)
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
