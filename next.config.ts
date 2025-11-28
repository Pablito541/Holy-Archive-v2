const nextConfig = {
  eslint: {
    // Warnung: Dies erlaubt den Build auch bei ESLint-Fehlern
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warnung: Dies erlaubt den Build auch bei TypeScript-Fehlern
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
