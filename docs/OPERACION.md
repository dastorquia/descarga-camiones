# Operación: despliegue, actualizaciones y backups

## Dónde corre cada cosa

- **App:** Vercel, en la región São Paulo (`gru1`, configurada en `vercel.json`).
- **Base de datos:** Neon, en São Paulo (`sa-east-1`).

## Variables de entorno en Vercel

En Vercel, entrá a **Project → Settings → Environment Variables** y cargá estas tres variables para el entorno **Production**:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Cadena de Neon **con** pooler (el host contiene `-pooler`), con `sslmode=verify-full`. |
| `DIRECT_URL` | Cadena de Neon **sin** pooler, con `sslmode=verify-full`. |
| `SESSION_SECRET` | Texto aleatorio de 48 caracteres o más. Usá uno **distinto** del de tu computadora. |

Para generar un `SESSION_SECRET` nuevo, corré en la terminal:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Si cambiás el `SESSION_SECRET`, se cierran todas las sesiones abiertas: Colaboradores y Supervisor vuelven a la pantalla de entrada.

## Cómo se publica una versión nueva

1. Se sube el código: `git push` si el proyecto está conectado a GitHub, o `npx vercel --prod` desde esta carpeta.
2. Vercel corre `npm run vercel-build`:
   - en **producción**, aplica las migraciones pendientes (`prisma migrate deploy`) y compila;
   - en las **vistas previas** no toca la base: solo compila.
3. Si el build falla, Vercel sigue sirviendo la versión anterior. No se pierde nada.

## Primera puesta en producción

1. Aplicar las migraciones (el primer despliegue lo hace solo).
2. Cargar el seed una sola vez, desde esta carpeta, con el `.env` apuntando a la base de producción:

   ```bash
   npm run db:seed
   ```

   Si los datos ya están cargados, no duplica nada.
3. Entrar como Supervisor con el PIN `1234` y **cambiarlo enseguida** desde Administración → Cambiar PIN.

## Backups y restauración (Neon)

Neon guarda el historial de cambios de la base y permite volver a un momento anterior: **Restore** (o "Instant restore") en la consola de Neon. La cantidad de tiempo hacia atrás depende del plan; en el plan gratuito es corta. Revisalo en **Project → Settings → Storage / History retention** y elegí el plan según cuántos días hacia atrás quieras poder volver.

Para volver a un momento anterior:

1. En Neon, abrí el proyecto y entrá a **Branches → main → Restore**.
2. Elegí la fecha y hora a la que querés volver.
3. Neon guarda una copia del estado actual antes de restaurar, así que el paso se puede deshacer.

Además, conviene hacer cada semana un respaldo propio, fuera de Neon. Con las herramientas de PostgreSQL instaladas, se hace con este comando:

```bash
pg_dump "<DIRECT_URL>" --format=custom --file=respaldo-AAAA-MM-DD.dump
```

Guardá el archivo en un lugar seguro de la empresa. **No lo subas a git:** contiene todos los datos.

## Pruebas

Antes de publicar, conviene correr las cuatro verificaciones:

- `npm test`: reglas de negocio, sin base de datos.
- `npm run test:integracion`: restricciones de la base y vistas SQL, contra la base real. Corre dentro de transacciones que se deshacen, así que no deja datos.
- `npm run typecheck`
- `npm run lint`

## Análisis de datos

Las vistas SQL para Power BI, Python o Excel están explicadas en [VISTAS_SQL.md](VISTAS_SQL.md).
