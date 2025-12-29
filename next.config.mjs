/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // add your own strategies to the cache
  // register: true,
  // scope: '/app',
  // sw: 'service-worker.js',
});


const nextConfig = {
  // your next config here
};

export default withPWA(nextConfig);
