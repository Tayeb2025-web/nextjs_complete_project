/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Saved carts and existing links can still contain these former PNG URLs.
    const courseImages = [
      "1790662751854-998698358",
      "1790663303185-800084325",
      "1790663867243-527220811",
      "1790664478983-958283752",
      "1790664891002-475577955",
      "1790666506027-283309194",
      "1790666887592-451365860",
      "1790667441768-101525681",
      "1790668168310-610850449",
      "1790668796677-336918453",
      "1790669687842-270688005",
    ];

    return [
      { source: "/images/logo.png", destination: "/images/logo.webp" },
      ...courseImages.map((name) => ({
        source: `/images/courses/${name}.png`,
        destination: `/images/courses/${name}.webp`,
      })),
    ];
  },
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
