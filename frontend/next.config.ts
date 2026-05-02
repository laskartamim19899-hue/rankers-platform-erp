import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
    Hostinger Shared Hosting-এ ডেপ্লয় করতে চাইলে নিচের লাইনটি আনকমেন্ট করুন। 
    এর ফলে 'npm run build' দিলে একটি 'out' ফোল্ডার তৈরি হবে যা আপনি আপলোড করতে পারবেন।
  */
  // output: 'export', 
  
  images: {
    unoptimized: true, // হোস্টিংগারে ইমেজ ঠিকঠাক দেখানোর জন্য এটি প্রয়োজন হতে পারে
  },
  typescript: {
    ignoreBuildErrors: true, // টাইপস্ক্রিপ্ট এরর থাকলেও বিল্ড কমপ্লিট হবে
  }
};

export default nextConfig;
