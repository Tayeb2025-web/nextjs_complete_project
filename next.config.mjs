/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ywvgpulfbp0nzwzn.public.blob.vercel-storage.com",
        port: "",
        pathname: "/courses/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;