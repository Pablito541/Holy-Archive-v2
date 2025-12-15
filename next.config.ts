const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  typescript: {
    // Warnung: Dies erlaubt den Build auch bei TypeScript-Fehlern
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
