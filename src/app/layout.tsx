import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carga y descarga de camiones",
  description: "Registro de carga y descarga de camiones en planta · Santa Fe Aceites",
  applicationName: "Camiones",
  // iPhone: al agregarla a la pantalla de inicio se abre como app, con su ícono.
  appleWebApp: { capable: true, title: "Camiones", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
