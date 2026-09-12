import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Dev-mode HMR/RSC requests get blocked as cross-origin when the app is
  // opened via 127.0.0.1 instead of localhost, which can leave a
  // Suspense boundary (e.g. /trace's useSearchParams() form) stuck on its
  // fallback forever since its client chunk never finishes loading.
  allowedDevOrigins: ['localhost', '127.0.0.1'],
};

export default nextConfig;
