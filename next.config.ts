import type { NextConfig } from "next";

// Sin cacheComponents: todas las pantallas dependen de la sesión y de datos en
// vivo, así que se renderizan en cada pedido (modo dinámico clásico).
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
