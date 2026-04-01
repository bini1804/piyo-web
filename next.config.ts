import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      // RDS banner_images 가 가리키는 AWS S3 (앱·백엔드와 동일 버킷)
      { protocol: "https", hostname: "*.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      // 가상 호스팅 스타일: {bucket}.s3.{region}.amazonaws.com
      { protocol: "https", hostname: "*.s3.dualstack.ap-northeast-2.amazonaws.com" },
    ],
  },
};

export default nextConfig;
