import type { NextConfig } from "next";

// Sin cacheComponents: todas las pantallas dependen de la sesión y de datos en
// vivo, así que se renderizan en cada pedido (modo dinámico clásico).
const nextConfig: NextConfig = {
  // Encabezados de seguridad básicos para todas las respuestas.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
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
