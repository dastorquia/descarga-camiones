-- Vistas para análisis externo (Python, Power BI, Excel), sección 7 de la especificación.
-- Solo lectura. Horas ya calculadas a partir de tramos CERRADOS (un tramo abierto da NULL).
-- Las fechas se guardan en UTC; las columnas *_ar están en hora de Argentina.
-- Ver docs/VISTAS_SQL.md.

-- Un registro por tramo de bombeo.
CREATE VIEW v_tramos_horas AS
SELECT
  t.id                                                            AS tramo_id,
  d.id                                                            AS descarga_id,
  d."hojaDeRuta"                                                  AS hoja_de_ruta,
  d.tipo::text                                                    AS tipo,
  d.estado::text                                                  AS estado_descarga,
  b.codigo                                                        AS bomba,
  b.descripcion                                                   AS sector,
  o.nombre                                                        AS operario,
  t.inicio                                                        AS inicio_utc,
  t.fin                                                           AS fin_utc,
  (t.inicio AT TIME ZONE 'UTC') AT TIME ZONE 'America/Argentina/Buenos_Aires' AS inicio_ar,
  (t.fin AT TIME ZONE 'UTC') AT TIME ZONE 'America/Argentina/Buenos_Aires'    AS fin_ar,
  ROUND((EXTRACT(EPOCH FROM (t.fin - t.inicio)) / 3600)::numeric, 4) AS horas,
  t.toneladas                                                     AS toneladas_asignacion_manual
FROM "TramoBombeo" t
JOIN "Descarga" d ON d.id = t."descargaId"
JOIN "Bomba" b    ON b.id = t."bombaId"
JOIN "Operario" o ON o.id = t."operarioId";

-- Un registro por descarga (o carga), con tiempos y rendimiento.
CREATE VIEW v_descargas_resumen AS
WITH tramos AS (
  SELECT
    t."descargaId",
    MIN(t.inicio)                                                       AS inicio,
    CASE WHEN BOOL_AND(t.fin IS NOT NULL) THEN MAX(t.fin) END           AS fin,
    SUM(EXTRACT(EPOCH FROM (t.fin - t.inicio)))                         AS segundos_bombeo,
    COUNT(*)                                                            AS cantidad_tramos,
    COUNT(DISTINCT t."bombaId")                                         AS cantidad_bombas,
    STRING_AGG(DISTINCT b.codigo, ', ')                                 AS bombas
  FROM "TramoBombeo" t
  JOIN "Bomba" b ON b.id = t."bombaId"
  GROUP BY t."descargaId"
),
primero AS (
  SELECT DISTINCT ON (t."descargaId") t."descargaId", o.nombre AS operario_inicio
  FROM "TramoBombeo" t
  JOIN "Operario" o ON o.id = t."operarioId"
  ORDER BY t."descargaId", t.inicio
)
SELECT
  d.id                                                                  AS descarga_id,
  d."hojaDeRuta"                                                        AS hoja_de_ruta,
  d.tipo::text                                                          AS tipo,
  d.estado::text                                                        AS estado,
  d.patente,
  p.nombre                                                              AS producto,
  pr.nombre                                                             AS proveedor_o_cliente,
  tk.codigo                                                             AS tanque,
  pi.operario_inicio,
  tr.bombas,
  tr.cantidad_bombas,
  tr.cantidad_tramos,
  (tr.inicio AT TIME ZONE 'UTC') AT TIME ZONE 'America/Argentina/Buenos_Aires' AS inicio_ar,
  (tr.fin AT TIME ZONE 'UTC') AT TIME ZONE 'America/Argentina/Buenos_Aires'    AS fin_ar,
  ROUND((COALESCE(tr.segundos_bombeo, 0) / 3600)::numeric, 4)          AS horas_bombeo,
  ROUND((EXTRACT(EPOCH FROM (tr.fin - tr.inicio)) / 3600)::numeric, 4)  AS horas_totales,
  ROUND(((EXTRACT(EPOCH FROM (tr.fin - tr.inicio)) - tr.segundos_bombeo) / 3600)::numeric, 4) AS horas_pausa,
  d.toneladas,
  CASE WHEN d.toneladas IS NOT NULL AND tr.segundos_bombeo > 0
       THEN ROUND(d.toneladas / (tr.segundos_bombeo / 3600)::numeric, 3) END AS rendimiento_t_h,
  d.observaciones
FROM "Descarga" d
JOIN "Producto" p   ON p.id = d."productoId"
JOIN "Proveedor" pr ON pr.id = d."proveedorId"
JOIN "Tanque" tk    ON tk.id = d."tanqueId"
LEFT JOIN tramos tr  ON tr."descargaId" = d.id
LEFT JOIN primero pi ON pi."descargaId" = d.id;
