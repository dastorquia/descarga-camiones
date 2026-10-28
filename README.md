# Carga y descarga de camiones

App web de Santa Fe Aceites para registrar la carga y descarga de camiones en planta. Se usa desde el celular (Colaborador) y desde la computadora (Supervisor), y se puede instalar en el celular como una app.

- **Especificación:** [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md).
- **Despliegue, actualizaciones y backups:** [docs/OPERACION.md](docs/OPERACION.md).
- **Vistas SQL para análisis:** [docs/VISTAS_SQL.md](docs/VISTAS_SQL.md).

## Puesta en marcha en tu computadora

1. Instalá Node.js 22 o posterior.
2. Corré `npm install`.
3. Copiá `.env.example` como `.env` y completá:
   - `DATABASE_URL`: la cadena de Neon con pooler (contiene `-pooler`);
   - `DIRECT_URL`: la cadena de Neon sin pooler;
   - `SESSION_SECRET`: un texto aleatorio largo.
4. Corré `npm run db:deploy` para crear las tablas.
5. Corré `npm run db:seed` para cargar el PIN inicial, los umbrales y los catálogos.
6. Corré `npm run dev` y abrí http://localhost:3000.

## Comandos útiles

- `npm test`: pruebas de las reglas de negocio.
- `npm run test:integracion`: pruebas contra la base. No dejan datos.
- `npm run typecheck`: verificación de tipos.
- `npm run lint`: revisión de estilo.
- `npm run db:studio`: ver y editar los datos de la base en el navegador.

## Instalar en el celular

Abrí la dirección de la app en el celular y agregala a la pantalla de inicio:

- **Android (Chrome):** menú ⋮ → "Instalar app" o "Agregar a la pantalla principal".
- **iPhone (Safari):** botón Compartir → "Agregar a inicio".
