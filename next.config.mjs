
import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = withPWAInit({
  dest: "public",
  disable: isDev,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config options here
};

export default withPWA(nextConfig);
