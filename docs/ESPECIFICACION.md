# Especificación: App de registro de carga y descarga de camiones

Santa Fe Aceites S.R.L. · Versión 1.0 · 28 de octubre de 2026

## 1. Objetivo

Capturar, estandarizar y luego analizar los datos de carga y descarga de camiones en planta. La prioridad es el **registro correcto de las horas de funcionamiento de cada bomba**, incluso cuando una descarga se pausa a la noche y se retoma al día siguiente.

La app debe ser muy fácil de usar: los usuarios tienen conocimientos básicos de PC. Se usa desde celular (operarios) y desde computadora (supervisión), y todo queda guardado en una base de datos pensada para análisis posterior.

## 2. Stack

- Next.js (App Router), React y TypeScript en modo estricto.
- Prisma ORM sobre PostgreSQL (Neon en producción).
- Tailwind CSS.
- Validación con Zod, compartida entre formularios y servidor.
- Despliegue en Vercel. Variables: `DATABASE_URL` y `DIRECT_URL` (Neon).
- Interfaz íntegramente en español de Argentina.

## 3. Perfiles y acceso

La app abre en una **pantalla de verificación con solo dos botones grandes: Colaborador y Supervisor.**

- **Colaborador:** entra sin clave. Puede crear descargas, iniciar, pausar, reanudar y finalizar tramos, y ver el tablero. Puede editar descargas que no estén finalizadas. No puede editar descargas finalizadas.
- **Supervisor:** entra con PIN. Puede todo lo anterior, más: editar o corregir cualquier registro (incluso finalizado), reabrir una descarga finalizada, asignar toneladas a un tramo, administrar catálogos (bombas, tanques, productos, proveedores, operarios), cambiar el PIN y ver todos los reportes.

**Detalles del PIN:**

- PIN inicial: `1234`. Se carga en el seed y se guarda **cifrado (hash con bcrypt o scrypt)** en una tabla de configuración. Nunca en texto plano.
- Se valida **en el servidor**. La sesión se guarda en una cookie httpOnly firmada, y el perfil nunca se decide solo desde el navegador.
- Menú del Supervisor “Cambiar PIN”: pide el PIN actual y el nuevo (de 4 a 8 dígitos).
- Mientras el PIN siga siendo el inicial, mostrar un aviso visible: “Estás usando el PIN por defecto. Cambialo desde el menú”. No es obligatorio cambiarlo.
- Límite de intentos fallidos: tras 5 intentos, bloqueo de 5 minutos.
- La sesión de Supervisor vence tras un período de inactividad (sugerido: 30 minutos).
- El operario **no** se elige en la verificación. Se elige en un desplegable dentro de los formularios (ver tramos).

## 4. Modelo de datos (Prisma)

Concepto clave: la **Descarga** representa al camión (una por hoja de ruta) y los **Tramos de bombeo** representan cada período continuo de bombeo. Las horas de bomba salen únicamente de los tramos, de modo que una pausa nocturna nunca suma horas.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum EstadoDescarga {
  EN_CURSO
  PAUSADA
  FINALIZADA
}

enum TipoOperacion {
  DESCARGA
  CARGA
}

model Descarga {
  id            Int            @id @default(autoincrement())
  hojaDeRuta    String         @unique
  tipo          TipoOperacion  @default(DESCARGA)
  patente       String?
  productoId    Int
  proveedorId   Int
  tanqueId      Int
  estado        EstadoDescarga @default(EN_CURSO)
  toneladas     Decimal?       @db.Decimal(10, 3)
  observaciones String?
  creadaEn      DateTime       @default(now())
  actualizadaEn DateTime       @updatedAt

  producto  Producto      @relation(fields: [productoId], references: [id])
  proveedor Proveedor     @relation(fields: [proveedorId], references: [id])
  tanque    Tanque        @relation(fields: [tanqueId], references: [id])
  tramos    TramoBombeo[]

  @@index([estado])
  @@index([creadaEn])
}

model TramoBombeo {
  id         Int       @id @default(autoincrement())
  descargaId Int
  bombaId    Int
  operarioId Int
  inicio     DateTime
  fin        DateTime?
  // Solo lo completa el Supervisor, en el caso excepcional de dos bombas.
  toneladas  Decimal?  @db.Decimal(10, 3)

  descarga Descarga @relation(fields: [descargaId], references: [id], onDelete: Cascade)
  bomba    Bomba    @relation(fields: [bombaId], references: [id])
  operario Operario @relation(fields: [operarioId], references: [id])

  @@index([bombaId, inicio])
  @@index([descargaId])
}

model Bomba {
  id          Int           @id @default(autoincrement())
  codigo      String        @unique
  descripcion String?
  activa      Boolean       @default(true)
  tramos      TramoBombeo[]
}

model Tanque {
  id        Int        @id @default(autoincrement())
  codigo    String     @unique // formato TK-001, TK-012, TK-101
  activo    Boolean    @default(true)
  descargas Descarga[]
}

model Producto {
  id        Int        @id @default(autoincrement())
  nombre    String     @unique
  activo    Boolean    @default(true)
  descargas Descarga[]
}

model Proveedor {
  id        Int        @id @default(autoincrement())
  nombre    String     @unique
  activo    Boolean    @default(true)
  descargas Descarga[]
}

model Operario {
  id     Int           @id @default(autoincrement())
  nombre String        @unique
  activo Boolean       @default(true)
  tramos TramoBombeo[]
}

model Config {
  clave String @id
  valor String // por ejemplo: pinSupervisorHash, pinPorDefecto, umbrales
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  fecha     DateTime @default(now())
  perfil    String // COLABORADOR | SUPERVISOR
  entidad   String
  entidadId Int
  accion    String // CREAR | EDITAR | REABRIR | DESACTIVAR ...
  antes     Json?
  despues   Json?
}
```

**Notas del modelo:**

- Los catálogos se **desactivan, no se borran**, para conservar el historial.
- Fechas y horas se guardan en **UTC**. En pantalla se muestran en hora de Argentina (`America/Argentina/Buenos_Aires`). En los formularios, día y hora son campos separados, y el **día de fin viene por defecto igual al día de inicio**.
- Las toneladas son `Decimal` con 3 decimales (precisión de kilo). Nunca usar `Float`.
- El **operario se guarda por tramo**. En la descarga se muestra el operario del primer tramo como “operario de inicio”.
- `tipo` (DESCARGA o CARGA) permite usar la misma app para descargas y para cargas. Por defecto es DESCARGA. El modelo Descarga representa cualquiera de las dos operaciones; en una CARGA, el tanque es el de origen y el proveedor es el cliente.

## 5. Reglas de negocio

**Flujo de una descarga**

1. **Iniciar descarga:** crea la Descarga (EN\_CURSO) y su primer tramo abierto. Datos: tipo de operación (descarga o carga), hoja de ruta, patente, producto, proveedor, tanque, bomba, operario, día y hora de inicio, observaciones.
2. **Pausar:** cierra el tramo abierto con una **hora de fin cargada manualmente**. El campo sugiere la hora actual, pero la persona puede corregirla. La descarga pasa a PAUSADA.
3. **Reanudar:** abre un tramo nuevo, eligiendo bomba y operario. La descarga pasa a EN\_CURSO.
4. **Finalizar:** cierra el tramo abierto con hora de fin manual y **pide las toneladas totales**. La descarga pasa a FINALIZADA.

**Toneladas**

- Solo se conocen al finalizar el camión. Mientras esté EN\_CURSO o PAUSADA, `toneladas` queda vacío y la app muestra “—” (nunca 0).
- Obligatorias al finalizar, mayores a 0, hasta 3 decimales. El campo acepta **coma decimal** (por ejemplo, 28,450) y muestra siempre la unidad “t”.
- Un camión típico ronda las 28,00 t. Usar ese valor como ejemplo del campo. Mostrar una **advertencia no bloqueante** si el valor está fuera del rango configurable 3 a 40 t, para detectar errores de tipeo (por ejemplo, 2800 o 2,8). La persona puede confirmar y seguir.
- **Caso excepcional (dos bombas en tramos):** el Supervisor puede asignar toneladas a un tramo. Regla: la suma de toneladas asignadas a los tramos no puede superar el total de la descarga. Al asignar el primer tramo, la app propone el resto para el último. Estos valores se marcan como **“asignación manual”** y se distinguen en los reportes.

**Horas de bomba**

- Horas de un tramo = fin menos inicio. Horas de bomba = suma de tramos **cerrados**.
- Un tramo abierto nunca se calcula con la hora actual para estadísticas. Se muestra como “en curso”.
- **Caso de prueba obligatorio:** tramo 1 de 16:00 a 19:30 del día 1, y tramo 2 de 06:00 a 09:15 del día 2. Horas de bomba = 3,50 + 3,25 = **6,75 h** (y no 17 h).

**Validaciones**

- La hoja de ruta es única.
- El fin debe ser posterior al inicio.
- Los tramos de una misma bomba no pueden solaparse, y una bomba no puede tener dos tramos abiertos a la vez.
- Una descarga no puede tener dos tramos abiertos a la vez.
- Un mismo tanque puede recibir varias descargas a la vez: no se valida ni se advierte por tanque ocupado.
- Solo se pueden elegir bombas, tanques, productos, proveedores y operarios **activos**.
- No se puede finalizar sin toneladas.

**Alertas**

- Un tramo abierto por más de X horas (por defecto 12, configurable) se marca en rojo en el tablero del Supervisor. Sirve para detectar olvidos antes de que contaminen las horas de bomba.

**Auditoría**

- Toda edición, reapertura o desactivación queda en `AuditLog` con perfil, valor anterior y nuevo, y fecha y hora.

## 6. Pantallas

1. **Verificación:** dos botones grandes, Colaborador y Supervisor. El Supervisor ingresa el PIN con un teclado numérico.
2. **Inicio del Colaborador (celular primero):** lista de descargas En curso y Pausadas, y botón grande “Nueva descarga”.
3. **Formulario de nueva descarga:** primero se elige el tipo (descarga o carga) con dos botones grandes; luego desplegables para producto, proveedor (o cliente, en una carga), tanque (destino en una descarga, origen en una carga), bomba y operario. Campos de fecha y hora de inicio (por defecto, ahora), hoja de ruta, patente y observaciones.
4. **Detalle de descarga:** datos generales, lista de tramos (bomba, operario, inicio, fin, horas) y botones según el estado: Pausar, Reanudar, Finalizar. Cada botón abre una ventana simple que pide hora de fin y operario, o toneladas, según corresponda.
5. **Tablero del Supervisor (computadora):** columnas Pendientes (pausadas), En curso y Finalizadas hoy. Estado de bombas (libre u ocupada, y por qué descarga) y de tanques. Actualización automática cada 15 a 30 segundos. Alertas de tramos abiertos.
6. **Historial:** búsqueda y filtros por fecha, producto, proveedor, bomba, tanque y estado. El Supervisor puede editar desde acá.
7. **Administración (Supervisor):** altas, ediciones y desactivación de bombas, tanques, productos, proveedores y operarios. Cambio de PIN y de umbrales (rango de toneladas, horas de alerta).
8. **Reportes (Supervisor):** ver sección siguiente.

## 7. Reportes y análisis

- Horas de funcionamiento por bomba, por día y por mes.
- Rendimiento (t/h) = toneladas de la descarga ÷ horas de bombeo de la descarga, por descarga y por bomba. Exacto cuando hubo una sola bomba.
- Toneladas por bomba: exacto si la descarga usó una sola bomba. Con dos bombas, solo se incluye si el Supervisor asignó toneladas a todos los tramos, y se rotula “asignación manual”. Si no, la descarga se excluye de este indicador.
- Toneladas por producto, proveedor (o cliente) y tanque. Todos los reportes se pueden filtrar por tipo de operación (descarga o carga), y el rendimiento t/h se analiza por separado en cada tipo.
- Tiempo total de la descarga frente a tiempo efectivo de bombeo (diferencia = pausas).
- Exportación a CSV y Excel, respetando los filtros aplicados.
- Crear **vistas SQL** (por ejemplo, `v_tramos_horas` y `v_descargas_resumen`) con horas ya calculadas, para analizar luego con Python, Power BI u otra herramienta.

## 8. Requisitos no funcionales

- Diseño responsive con enfoque móvil: botones grandes, pocos campos por pantalla, textos claros y sin jerga técnica.
- PWA instalable en el celular.
- Validación con Zod en cliente y servidor. Las reglas de negocio viven en el servidor.
- Migraciones de Prisma versionadas y un seed con el PIN inicial y catálogos mínimos. Los datos de ejemplo deben estar claramente identificados como ejemplo.
- Pruebas automáticas de las reglas de negocio, en especial el cálculo de horas de bomba con pausas y los solapamientos.
- Backups periódicos y restauración a un punto anterior en Neon.
- Código organizado por módulos (ver sección siguiente).

## 9. Extensibilidad futura

La app debe poder crecer con módulos nuevos, por ejemplo **movimientos de mercadería** o **registro de mangueras en planta**, sin rehacer lo existente. Por eso:

- Organizar el código por módulos (por ejemplo, `src/modules/descargas`), con una carpeta común para autenticación, auditoría y componentes compartidos.
- Los catálogos (productos, tanques, proveedores, operarios, bombas) y la auditoría son compartidos y reutilizables.
- Los perfiles se resuelven en un solo lugar, de modo que agregar permisos a un módulo nuevo sea simple.
- Los módulos nuevos se agregan con migraciones aditivas de Prisma, sin modificar las tablas actuales.

Por ahora **no se desarrolla ningún módulo adicional**. Solo se deja la estructura lista.

## 10. Plan de trabajo por etapas

1. Base del proyecto: Next.js, Tailwind, Prisma, conexión con Neon, esquema, migración y seed.
2. Verificación de perfiles y PIN del Supervisor (con cambio de PIN).
3. Flujo del Colaborador: nueva descarga, pausar, reanudar y finalizar, con todas las validaciones y pruebas del cálculo de horas.
4. Tablero del Supervisor con actualización automática y alertas.
5. Administración de catálogos, edición de registros y auditoría.
6. Reportes, vistas SQL y exportación.
7. PWA, pruebas finales y despliegue en Vercel.

Al terminar cada etapa, Claude Code debe resumir lo hecho y esperar confirmación antes de seguir.

## 11. Cómo usar este documento con Claude Code

**Preparación**

1. Crear un proyecto en Neon y copiar las cadenas de conexión (`DATABASE_URL` y `DIRECT_URL`).
2. Crear una carpeta para el proyecto y guardar este documento como `docs/ESPECIFICACION.md`.
3. Abrir Claude Code dentro de esa carpeta.

**Primer mensaje para Claude Code**

```text
Voy a construir una app de registro de carga y descarga de camiones para una planta industrial. Leé completo el archivo docs/ESPECIFICACION.md: es la especificación de referencia.

Antes de escribir código:
1. Resumime en pocas líneas lo que entendiste.
2. Marcame cualquier ambigüedad o contradicción que encuentres.
3. Proponeme el plan de la Etapa 1.

Reglas de trabajo:
- Stack: Next.js (App Router), React, TypeScript estricto, Prisma sobre PostgreSQL (Neon) y Tailwind.
- Trabajá por etapas, en el orden de la sección 10. Al terminar cada una, resumí lo hecho y esperá mi confirmación.
- El cálculo de horas de bomba y las validaciones tienen que estar cubiertos con pruebas automáticas, incluido el caso de las 6,75 h de la sección 5.
- La interfaz va en español de Argentina, pensada para personas con conocimientos básicos de PC y para uso en celular.
- Creá un archivo CLAUDE.md con las convenciones del proyecto y las reglas clave de la especificación.
- No agregues funciones que no estén en la especificación sin consultarme.
```

## 12. Decisiones confirmadas

- **Carga y descarga:** el modelo incluye `tipo` (DESCARGA o CARGA). Confirmado: se usa para ambas operaciones, descarga y carga.
- **Patente:** se incluyó como campo opcional (estaba en la versión anterior de la app). Confirmado: se mantiene.
- **Umbrales:** rango de toneladas (3 a 40 t) y horas para la alerta de tramo abierto (12 h) son valores iniciales y se pueden ajustar desde Administración.
- **Tanque ocupado:** no se valida ni se advierte: varios camiones pueden descargar al mismo tanque a la vez.

## 13. Decisiones confirmadas el 28/10/2026

Estas decisiones precisan o corrigen las secciones anteriores. Ante una contradicción, vale lo que dice esta sección.

- **Edición por el Colaborador:** mientras la descarga no esté FINALIZADA, puede editar todos los datos generales y también los tramos (bomba, operario, inicio y fin).
- **Operario:** hay un solo operario por tramo y se elige al abrirlo. Las ventanas de Pausar y Finalizar **no** piden operario: piden solo la hora de fin, y Finalizar pide también las toneladas. Esto corrige la sección 6.4.
- **Reanudar:** pide bomba, operario y **hora de inicio manual**. El campo sugiere la hora actual.
- **No se reabre una descarga finalizada.** Esto corrige las secciones 3 y 5. Para corregir errores, solo el Supervisor puede editar una descarga finalizada, y la edición queda en la auditoría.
- **Toneladas por tramo:** la suma puede ser menor que el total, pero nunca mayor. Esas toneladas asignadas también se usan para el rendimiento t/h por bomba.
- **Horas por día:** un tramo que cruza la medianoche se reparte entre los días según la medianoche de Argentina.
- **Validaciones de horario:**
  - un tramo nuevo de una descarga debe empezar después del fin del tramo anterior;
  - no se aceptan horas futuras, con 5 minutos de tolerancia.
- **Bloqueo del PIN:** los intentos fallidos se cuentan por dispositivo (cookie) y por IP, y se guardan en la base.
- **Hoja de ruta:** solo letras y números, sin espacios ni caracteres especiales. Se guarda en mayúsculas. El campo no deja tipear otros caracteres.
- **Patente obligatoria** (corrige las secciones 4 y 12): solo letras y números, en mayúsculas. La columna sigue admitiendo vacío en la base, pero la app la exige.
- **Bomba en desplegables y listas:** "D1-BCI010". Al elegirla se muestra en negrita "Descarga 1 · Bomba BCI010".
- **Finalizar una descarga pausada:** se permite; pide solo las toneladas.
- **Quitar y agregar tramos** (pedido el 28/10/2026, mismos permisos que la edición):
  - Quitar: para tramos cargados por error. Pide confirmación y la descarga tiene que quedar con al menos un tramo. Si se quita el tramo en curso, la descarga queda pausada. Si después queda una sola bomba, se borran las toneladas asignadas por tramo. Todo queda en la auditoría como "Eliminación", con los datos del tramo.
  - Agregar: solo tramos ya terminados (con inicio y fin), con las mismas reglas de horarios y bombas. Para seguir bombeando se usa "Reanudar".
- **Registro de cambios** (pedido el 28/10/2026, solo Supervisor): pantalla que muestra la auditoría con nombres y fechas legibles, filtros por tipo de dato, acción y fechas, y el historial de cambios de cada descarga desde su detalle.
- **Reportes (Etapa 6):**
  - Filtros: período (por defecto, el mes en curso) y tipo de operación.
  - Horas de bomba: se reparten por día en la medianoche de Argentina y se recortan al período.
  - Toneladas y rendimiento: solo descargas finalizadas, atribuidas al día en que terminaron.
  - Toneladas por bomba con varias bombas: cuentan los tramos con toneladas asignadas, aunque no estén todos asignados, y se marcan "asignación manual".
  - Exportación: Excel con todos los reportes (una hoja por reporte) y CSV por reporte (separador ";" y coma decimal, para Excel en español).
  - Vistas SQL `v_tramos_horas` y `v_descargas_resumen`, documentadas en `docs/VISTAS_SQL.md`.
- **Cambios del 29/10/2026 (después del primer despliegue):**
  - **Kilos en lugar de toneladas** en toda la app (formularios, pantallas, reportes, exportaciones y vistas SQL). Se cargan kilos enteros, por ejemplo 28000. En la base se sigue guardando `Decimal(10,3)` en toneladas, que es la misma precisión. El rendimiento es en kg/h. El rango de advertencia se configura en kilos (por defecto 3.000 a 40.000 kg).
  - **Sin valor por defecto al finalizar:** el campo de kilos arranca vacío, con "28000" solo como ejemplo en gris.
  - **Patente camión/acoplado:** por ejemplo AB123CD/AC456EF, hasta 15 caracteres. La barra se agrega sola al completar la patente del camión. El acoplado es opcional.
  - **Inicio del Colaborador en formato de tabla:** tablas de en curso y pausadas, de bombas y de finalizadas de hoy.
  - **Bombas en mantenimiento:** el Colaborador y el Supervisor pueden poner y sacar una bomba de mantenimiento, con un motivo opcional. No se puede poner en mantenimiento una bomba en uso. Mientras está en mantenimiento no se puede elegir para iniciar ni reanudar. Se guarda en la tabla `MantenimientoBomba`, con fechas, y queda en la auditoría. Los tableros la muestran "En mantenimiento".
  - **Tablero del Supervisor:** el panel de tanques se reemplaza por dos gráficos de barras del mes en curso: kilos por bomba (descarga y carga) y horas de uso por bomba. Se reinician cada mes.
- **Cambios del 29/10/2026 (segunda tanda):**
  - **Inicio del Colaborador:** vuelve a tarjetas (Pendientes, En curso y Finalizadas hoy). Abajo, la sección "En mantenimiento" muestra solo las bombas en mantenimiento, con botón para terminarlo y un formulario para poner otra bomba libre en mantenimiento.
  - **Tablero del Supervisor:** las descargas se muestran en tablas ("En curso y pausadas" y "Finalizadas hoy"). Los gráficos del mes muestran toneladas.
  - **Catálogos (migración de datos):** tanques TK-025, TK-026, TK-027, TK-706, TK-707, PLT-801 y PLT-802. Los códigos de tanque admiten otros prefijos (PLT); los TK se escriben con 3 dígitos. Descarga 4 con las bombas BEL019 y BCN201. Operarios genéricos "Colaborador 1" a "Colaborador 6": los dos nombres reales se reemplazaron, también en el historial. Proveedores genéricos "Proveedor 1" a "Proveedor 10": los anteriores se desactivaron y se conservan en el historial.
- **Cambios del 29/10/2026 (tercera tanda):**
  - Sector "Otro" con las bombas BEL101 y BEL102. Textos de los gráficos: "Descargas finalizadas en el mes. Se reinicia el primer día de cada mes." y "Tramos finalizados en el mes. Se reinicia el primer día de cada mes."
  - **Movimiento interno** (pendiente de programar): botón "+ Nuevo movimiento" en el Colaborador. Un solo formulario que se carga al terminar, con tanque de origen, tanque de destino, cantidad en kilos, patente camión/acoplado, día y hora de inicio, día y hora de fin (el día de fin viene igual al de inicio), bomba de carga, bomba de descarga y colaborador. Mientras dura, las bombas no aparecen ocupadas. Sus horas se suman a las horas de uso de cada bomba (gráfico y reportes). El Supervisor lo ve en una tabla.
  - **Mantenimiento autónomo** (pendiente de programar): en Administración → Bombas, un tilde "requiere mantenimiento autónomo". Botón en el Colaborador para registrar una de las 4 tareas (Inspección del cuerpo de la bomba, Inspección del skid de la bomba, Limpieza, Ajuste de prensaestopas) en una de esas bombas, con colaborador, día y hora. El Supervisor ve, por bomba, la última vez que se hizo cada tarea y quién, y el historial completo filtrable. Sin frecuencias ni alertas por ahora.
  - Las dos funcionalidades van en tablas nuevas (migraciones aditivas) y quedan en la auditoría.
- **Inicio del Colaborador = tablero por sector** (reemplazado el 29/10/2026): una tarjeta por sector (Descarga 1, 2 y 3) con sus camiones, la bomba en uso y hace cuánto bombea (solo para mostrar, nunca para estadísticas). Cada sector tiene "+ Agregar", que ofrece sus bombas. Debajo, las "Finalizadas hoy". Se actualiza solo cada 30 segundos.
- **Sector de bomba:** se guarda en la descripción de la bomba ("Descarga 1", "Descarga 2" o "Descarga 3"). En pantalla se muestra abreviado (D1, D2 o D3) en letra chica.
- **Sesión:** la cookie se firma con la variable `SESSION_SECRET`, que va en `.env` además de `DATABASE_URL` y `DIRECT_URL`.
- **Prisma 7:** la conexión se configura en `prisma.config.ts` y en el cliente de la app, no en `schema.prisma`. Los modelos son los de la sección 4.
- **Integridad en la base:** restricciones de PostgreSQL, agregadas en una migración aditiva, impiden:
  - tramos solapados de una misma bomba;
  - tramos solapados de una misma descarga;
  - dos tramos abiertos a la vez en la misma bomba o en la misma descarga;
  - que el fin de un tramo no sea posterior a su inicio.
- **Catálogos iniciales (seed):**
  - **Productos:** Borra, Borra de neutralización, Borrín, Aceite, UCO, Aceite de pollo, Oleína, Interfase, Residuo orgánico.
  - **Proveedores:** AGD T6, AGD Deheza, Cofco Timbues, Cargill PGSM, Cargill VGG, Falavigna.
  - **Operarios:** Adrián Aguirre, Iván Balmaceda.
  - **Tanques:** TK-001 a TK-012 y TK-101 a TK-119.
  - **Bombas:** BCI010, BEL003 y BEL010 (Descarga 1); BEL012 y BEL021 (Descarga 2); BEL004 y BEL013 (Descarga 3).
