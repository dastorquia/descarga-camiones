# Vistas SQL para análisis

La base tiene dos vistas de solo lectura con las horas ya calculadas, para analizar los datos con Python, Power BI, Excel u otra herramienta. Se crean con la migración `prisma/migrations/20261028200000_vistas_reportes`.

## Reglas de cálculo

- **Horas:** salen solo de tramos **cerrados**. Un tramo abierto (en curso) tiene `horas` vacío.
- **Fechas:** la base guarda todo en UTC.
  - Las columnas `*_ar` están en hora de Argentina.
  - Las columnas `*_utc` están en UTC.
- **Toneladas:** número con 3 decimales; el separador decimal depende de la herramienta.

## `v_tramos_horas`: un registro por tramo de bombeo

| Columna | Qué es |
|---|---|
| `tramo_id`, `descarga_id` | Identificadores internos. |
| `hoja_de_ruta` | Hoja de ruta del camión. |
| `tipo` | `DESCARGA` o `CARGA`. |
| `estado_descarga` | `EN_CURSO`, `PAUSADA` o `FINALIZADA`. |
| `bomba`, `sector` | Código de la bomba y su sector, por ejemplo "Descarga 1". |
| `operario` | Operario del tramo. |
| `inicio_utc`, `fin_utc` | Inicio y fin en UTC. |
| `inicio_ar`, `fin_ar` | Inicio y fin en hora de Argentina. |
| `horas` | Fin menos inicio, en horas. Vacío si el tramo sigue abierto. |
| `toneladas_asignacion_manual` | Toneladas que el Supervisor asignó al tramo (solo descargas con varias bombas). |

## `v_descargas_resumen`: un registro por descarga o carga

| Columna | Qué es |
|---|---|
| `descarga_id`, `hoja_de_ruta`, `tipo`, `estado`, `patente` | Datos generales. |
| `producto`, `proveedor_o_cliente`, `tanque` | En una carga, el proveedor es el cliente y el tanque es el de origen. |
| `operario_inicio` | Operario del primer tramo. |
| `bombas`, `cantidad_bombas`, `cantidad_tramos` | Bombas usadas y cantidad de tramos. |
| `inicio_ar` | Inicio del primer tramo. |
| `fin_ar` | Fin del último tramo. Vacío si hay un tramo abierto. |
| `horas_bombeo` | Suma de los tramos cerrados: las horas de bomba. |
| `horas_totales` | Del primer inicio al último fin. |
| `horas_pausa` | `horas_totales` − `horas_bombeo`. |
| `toneladas` | Total del camión. Vacío hasta finalizar. |
| `rendimiento_t_h` | `toneladas` ÷ `horas_bombeo`. |
| `observaciones` | Texto libre. |

## Diferencias con la pantalla de Reportes

Los reportes de la app agregan dos cálculos que estas vistas no hacen:

- **Horas por día:** un tramo que cruza la medianoche se reparte entre los días. En las vistas, cada tramo es una sola fila; para repartir por día hay que cortarlo en la medianoche de `inicio_ar`.
- **Toneladas por bomba con varias bombas:** se usan los tramos con `toneladas_asignacion_manual`.

## Cómo conectarse

Usá la cadena de conexión **sin pooler** de Neon (`DIRECT_URL`) desde la herramienta de análisis.

Para que nadie pueda modificar datos desde afuera de la app, es recomendable crear en Neon un usuario de **solo lectura** y usar ese, no el usuario dueño de la base. Se crea desde la consola de Neon, en Roles.
