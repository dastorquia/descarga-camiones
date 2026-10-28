import type { MetadataRoute } from "next";

// Manifiesto de la PWA (sección 8): permite instalar la app en el celular.
// No hace falta funcionar sin conexión: los datos siempre se leen del servidor.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Carga y descarga de camiones",
    short_name: "Camiones",
    description: "Registro de carga y descarga de camiones en planta · Santa Fe Aceites",
    lang: "es-AR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1d4ed8",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
