/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // add your own strategies to the existing ones
  // Your other PWA options goes here
});


const nextConfig = {
  // Your regular Next.js config options go here
};

export default withPWA(nextConfig);
