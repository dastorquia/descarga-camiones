# Carga y descarga de camiones

App web de Santa Fe Aceites para registrar la carga y descarga de camiones en planta. La especificación está en [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md).

## Puesta en marcha

1. Instalá Node.js 24 o posterior.
2. Corré `npm install`.
3. Copiá `.env.example` como `.env` y completá:
   - `DATABASE_URL`: la cadena de Neon con pooler (contiene `-pooler`);
   - `DIRECT_URL`: la cadena de Neon sin pooler;
   - `SESSION_SECRET`: un texto aleatorio largo.
4. Corré `npm run db:migrate` para crear las tablas.
5. Corré `npm run db:seed` para cargar el PIN inicial, los umbrales y los catálogos.
6. Corré `npm run dev` y abrí http://localhost:3000.

## Comandos útiles

- `npm test`: pruebas automáticas.
- `npm run typecheck`: verificación de tipos.
- `npm run db:studio`: ver y editar los datos de la base en el navegador.
