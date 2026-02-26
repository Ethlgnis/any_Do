/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  // Add any specific configurations you had in Vite here if necessary (e.g., aliases, environment variables)
};

export default nextConfig;
