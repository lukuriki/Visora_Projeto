/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default nextConfig;
