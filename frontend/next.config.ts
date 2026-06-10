import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
    Hostinger Shared Hosting-এ ডেপ্লয় করতে চাইলে নিচের লাইনটি আনকমেন্ট করুন। 
    এর ফলে 'npm run build' দিলে একটি 'out' ফোল্ডার তৈরি হবে যা আপনি আপলোড করতে পারবেন।
  */
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
