# CLAUDE.md: App de carga y descarga de camiones

App web de Santa Fe Aceites para registrar la carga y descarga de camiones en planta.

**La especificación manda:** [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md). Leela antes de cada etapa. La sección 13 tiene decisiones posteriores que corrigen secciones anteriores: ante una contradicción, vale la sección 13.

@AGENTS.md

## Forma de trabajo

- Se trabaja por etapas, en el orden de la sección 10 de la especificación. Al terminar cada una:
  - resumir lo hecho y cómo probarlo;
  - hacer un commit;
  - **esperar la confirmación del usuario** antes de seguir.
- **No agregar funciones que no estén en la especificación** sin consultar primero.
- Las credenciales van solo en `.env`, que está excluido de git. Nunca se escriben en el código, en documentación ni en commits. Las variables necesarias están en `docs/OPERACION.md`.

## Stack

- Next.js 16 (App Router), React 19 y TypeScript `strict`.
- Tailwind CSS 4.
- Prisma 7 sobre PostgreSQL (Neon), con `@prisma/adapter-pg`.
  - El esquema está en `prisma/schema.prisma`.
  - La conexión del CLI está en `prisma.config.ts` y usa `DIRECT_URL`.
  - La conexión de la app está en `src/shared/lib/db.ts` y usa `DATABASE_URL`, con pooler.
  - El cliente se genera en `src/generated/prisma`, que no se versiona.
- **`cacheComponents` está desactivado** a propósito: todas las pantallas dependen de la sesión y de datos en vivo, así que se renderizan en cada pedido. En Next 16, `middleware` se llama `proxy` (`src/proxy.ts`).
- Zod para validar, con los mismos esquemas en formularios y servidor.
- Vitest para las pruebas.
- Despliegue en Vercel (Etapa 7).

## Estructura

```
src/app/                  rutas y páginas (finas: delegan en los módulos)
src/modules/descargas/    módulo de descargas y cargas (lógica, acciones, componentes)
src/shared/auth/          perfiles y sesión: los permisos se resuelven solo acá
src/shared/auditoria/     registro en AuditLog
src/shared/catalogos/     bombas, tanques, productos, proveedores y operarios
src/shared/config/        claves de la tabla Config
src/shared/ui/            componentes compartidos
src/shared/lib/           utilidades (db, fechas, números)
prisma/                   esquema, migraciones, seed y catálogos iniciales
```

Los módulos nuevos se agregan con migraciones **aditivas**, sin modificar las tablas existentes.

## Reglas clave del negocio

- **Descarga = camión** (una por hoja de ruta). **TramoBombeo = período continuo de bombeo.** `tipo` puede ser DESCARGA o CARGA. En una CARGA, el tanque es el de origen y el proveedor es el cliente.
- **Horas de bomba:**
  - salen solo de los tramos **cerrados** (fin − inicio);
  - un tramo abierto se muestra "en curso" y nunca se calcula con la hora actual;
  - caso de prueba obligatorio: 16:00 a 19:30 del día 1 más 06:00 a 09:15 del día 2 da **6,75 h** (y no 17 h);
  - en reportes por día, un tramo que cruza la medianoche se reparte en la medianoche de Argentina.
- **Flujo:**
  - Iniciar: EN_CURSO, con el primer tramo abierto.
  - Pausar: cierra el tramo con hora de fin manual. Pasa a PAUSADA.
  - Reanudar: abre un tramo nuevo con bomba, operario y hora de inicio manual. Pasa a EN_CURSO.
  - Finalizar: cierra el tramo con hora de fin manual y pide los kilos. Pasa a FINALIZADA.
  - **Una descarga finalizada no se reabre.**
- **Validaciones:**
  - la hoja de ruta es única, solo letras y números, y se guarda en mayúsculas;
  - la patente es camión/acoplado (AB123CD/AC456EF, hasta 15), con la barra agregada sola al escribir;
  - una bomba en mantenimiento (tabla `MantenimientoBomba`, abierto = `hasta` null) no se puede elegir para iniciar ni reanudar;
  - el fin debe ser posterior al inicio;
  - no se aceptan horas futuras (5 minutos de tolerancia);
  - un tramo nuevo empieza después del fin del anterior de la misma descarga;
  - una bomba no puede tener tramos solapados ni dos tramos abiertos;
  - una descarga no puede tener dos tramos abiertos;
  - solo se eligen catálogos **activos**;
  - no se puede finalizar sin kilos;
  - el tanque ocupado **no** se valida.
- **Cantidades (en KILOS desde el 29/10/2026):**
  - en la base: `Decimal(10,3)` en toneladas (columna `toneladas`), nunca `Float`; en pantalla, formularios, reportes y vistas: kilos enteros ("28.000 kg"), rendimiento en kg/h;
  - conversiones en `src/modules/descargas/dominio/toneladas.ts` (`interpretarKilos`, `formatearKilos`, `aKilosDesdeBase`);
  - se cargan solo al finalizar, sin valor por defecto; antes se muestra "—" (nunca 0);
  - fuera del rango configurable (3.000 a 40.000 kg) se muestra una advertencia que no bloquea;
  - por tramo, solo las asigna el Supervisor: la suma debe ser menor o igual al total y se rotula "asignación manual".
- **Perfiles:**
  - Colaborador: entra sin clave. Puede crear, pausar, reanudar y finalizar, y editar datos y tramos mientras la descarga no esté finalizada.
  - Supervisor: entra con PIN y puede todo lo anterior. Además edita cualquier registro (incluso finalizado), asigna toneladas por tramo, administra catálogos, umbrales y PIN, y ve los reportes.
- **PIN:**
  - inicial `1234`, guardado como hash bcrypt en `Config` y validado en el servidor;
  - la sesión va en una cookie httpOnly firmada con `SESSION_SECRET` (`src/shared/auth/token.ts`);
  - tras 5 intentos fallidos desde un dispositivo, o 20 desde una misma IP (la planta puede compartir IP), bloqueo de 5 minutos; se guarda en la tabla `IntentoPin`;
  - la sesión de Supervisor vence tras 30 minutos de inactividad; la de Colaborador, tras 30 días. El proxy renueva la sesión con cada pedido;
  - mientras siga siendo el PIN por defecto, se muestra un aviso.
- **Actualización automática de tableros:** el del Supervisor pide `/api/supervisor/tablero` cada 20 s con el encabezado `x-actualizacion-automatica: 1`; el proxy **no** renueva la sesión con esos pedidos, así la inactividad de 30 min se respeta. Todo pedido automático nuevo tiene que mandar ese encabezado. El tablero del Colaborador usa `router.refresh()` solo para el perfil Colaborador.
- **Autorización:** los permisos están solo en `src/shared/auth/perfiles.ts`. El proxy hace un control previo, pero cada página y cada Server Action vuelve a verificar con `exigirPermiso`.
- **Catálogos:** se desactivan, nunca se borran.
- **Auditoría:** toda edición o desactivación va a `AuditLog`, con perfil, valor anterior y nuevo, y fecha.
- **Alerta:** un tramo abierto por más de 12 horas (valor configurable) se marca en rojo en el tablero del Supervisor.

## Convenciones

- **Interfaz en español de Argentina** (voseo: "Elegí", "Cargá"), para personas con conocimientos básicos de PC:
  - pensada primero para celular;
  - botones grandes y pocos campos por pantalla;
  - sin jerga técnica.
- **Fechas:**
  - se guardan en **UTC** y se muestran en `America/Argentina/Buenos_Aires`;
  - en los formularios, día y hora son campos separados, y el día de fin viene por defecto igual al de inicio.
- **Números:** coma decimal en horas (6,75 h); kilos enteros con punto de miles (28.000 kg).
- **Código:** nombres de dominio en español (descarga, tramo, bomba). Las reglas de negocio viven en el servidor y se prueban con funciones puras en Vitest.
  - Reglas puras: `src/modules/descargas/dominio/` (horas, toneladas, reglas). Acciones: `src/modules/descargas/acciones.ts`.
  - Fechas de Argentina: `src/shared/lib/fechas.ts` (`desdeDiaHora`, `aDiaHora`, `formatearFechaHora`).
  - Formularios cliente: usar `useFormulario` (`src/shared/ui/useFormulario.ts`), que no vacía los campos si hay error.
  - Cantidades: se guardan como texto en toneladas ("28.450") hasta Prisma; nunca `Number` para guardar. Para sumar, pasar a kilos enteros con `aKilosDesdeBase`.
  - La advertencia de kilos fuera de rango se confirma reenviando el mismo valor (`confirmado` = valor advertido).
  - Un archivo `"use server"` solo exporta acciones async: las ayudas compartidas van en `src/modules/descargas/servidor.ts`.
  - Edición (`edicion-acciones.ts`): al editar un tramo no cambia si está abierto o cerrado; las reglas están en `dominio/edicion.ts`. Los kilos por tramo se suman como enteros (`aKilosDesdeBase`).
  - Catálogos: duplicados se comparan sin distinguir mayúsculas (`existeOtro`). Se desactivan, nunca se borran.
- **Pantallas de la Etapa 5:** `/supervisor/administracion` (catálogos, umbrales, PIN), `/colaborador/descargas/[id]/editar` (incluye quitar y agregar tramos) y `/colaborador/historial` (ambos perfiles; filtros en la dirección), y `/supervisor/auditoria` (registro de cambios; `?descargaId=` para una descarga).
  - Los registros de auditoría de tramos guardan `descargaId` en antes/después, para poder filtrar por descarga aunque el tramo se haya quitado. `describirCambios` (`src/shared/auditoria/describir.ts`) los traduce a texto.
- **Reportes (Etapa 6):** `/supervisor/reportes` y `/api/supervisor/reportes` (`?formato=xlsx` o `?formato=csv&tabla=<id>`).
  - Cálculos puros en `src/modules/descargas/dominio/reportes.ts`; cada reporte es una `Tabla` genérica (`reportes/tabla.ts`) que sirve para pantalla, CSV y Excel (`exceljs`).
  - Descargas a Excel/CSV: `respuestaExportacion` (`reportes/respuesta.ts`) con botones `BotonExcel`/`BotonCsv` (`src/shared/ui/Exportar.tsx`). Se usa en Reportes, `/colaborador/historial/exportar` (mismos filtros, todas las páginas) y `/supervisor/autonomo/exportar`.
  - Vistas SQL (en kilos) en la migración `20261029100000_vistas_en_kilos`, documentadas en `docs/VISTAS_SQL.md`. Si cambia una tabla que usan, actualizar las vistas en una migración nueva.
- **PWA y despliegue (Etapa 7):** manifiesto en `src/app/manifest.ts`, íconos en `public/`. Vercel en `gru1` (`vercel.json`); `npm run vercel-build` aplica migraciones solo en producción. Operación y backups: `docs/OPERACION.md`.
- **Pruebas de integración:** `npm run test:integracion` (contra la base real, en transacciones que se deshacen; crean sus propias bombas para no chocar con datos reales).
- **Base de producción:** desde el despliegue, la base de Neon `main` es producción. Las migraciones se aplican solas al publicar en Vercel. **No correr migraciones, seeds ni datos de prueba contra producción:** usar una rama de Neon de desarrollo en el `.env` local.
- **Servidor de desarrollo:** si una acción recién creada falla con "undefined" en el servidor, reiniciar `npm run dev` (Turbopack a veces conserva una versión vieja).
- **Antes de cada commit:** correr `npm run typecheck`, `npm run lint` y `npm test`.

## Comandos

- `npm run dev`: servidor de desarrollo.
- `npm test`: pruebas.
- `npm run typecheck`: verificación de tipos.
- `npm run lint`: revisión de estilo.
- `npm run db:migrate`: crea o aplica migraciones en desarrollo.
- `npm run db:seed`: carga el PIN, los umbrales y los catálogos. Es idempotente.
- `npm run db:studio`: explorador visual de la base.
