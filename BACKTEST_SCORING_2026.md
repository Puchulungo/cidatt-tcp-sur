# Backtest del motor de scoring del Perfilador — ventas reales 2026

**Fecha del análisis:** 2026-08-08
**Fuente de ventas reales:** `INCAPESA - Venta VN.xlsx` (visor de informes, periodo 01/01/2026–08/08/2026)
**Objetivo:** medir qué tan bien el motor de scoring del Perfilador (Score final / Urgencia / Afinidad) hubiera anticipado las compras reales de camiones/tractocamiones que hizo la empresa en lo que va de 2026.

---

## 1. Metodología

- Se filtró el Excel de ventas a **Estado Oferta = "Venta Consumada"** (293 filas; se excluyeron "Venta en Curso" por no ser compras cerradas, y 2 filas de marcas fuera del Perfilador — Hyster, CAMC).
- Se clasificó cada venta como **Camión** o **Tractocamión (Remolcador)** cruzando el `ModeloCdg`/`ModeloDn` contra `Bandas_PBV_por_modelo.xlsx` (que trae el código de propuesta exacto para los modelos de International) y reglas por palabra clave para el resto de marcas (ver sección 4 — supuestos). 291 de las 293 ventas quedaron clasificadas.
- Para cada venta, se buscó al cliente (por RUC) en `data/perfilador/*.json` y se corrió el **mismo motor de scoring que usa `perfilador.html`** (Eje 0 elegibilidad, Eje 1 Urgencia, Eje 2 Afinidad), usando la flota del cliente **antes** de la compra (se excluyó explícitamente la unidad recién vendida de la flota usada para el cálculo, para evitar contaminar el resultado con la respuesta).
- **Verificación de que no hay trampa (data leakage):** de las 293 placas vendidas en 2026, solo 5 ya aparecían en el snapshot `cidatt a marz 2026.xlsx` que alimenta el Perfilador — o sea, el 98% de las ventas analizadas son gen uinamente "fuera de muestra" (el sistema no las había visto).
- Se calculó también un **baseline nacional**: para cada combinación marca+clase que aparece en las ventas reales, el promedio/mediana de Score/Urgencia/Afinidad de **todos** los clientes elegibles del país en esa combinación (no solo los que compraron), para poder comparar "¿el comprador real puntuaba mejor que el resto de los elegibles de su segmento?"

## 2. Resultados

### Cobertura

| Grupo | Cantidad | % |
|---|---|---|
| Total ventas consumadas evaluables | 291 | 100% |
| Clientes nuevos (sin historial en la base CIDATT) | 107 | 37% |
| Clientes con historial pero sin unidades elegibles en esa banda (el Perfilador no los habría mostrado) | 31 | 11% |
| Clientes con historial y score calculado | 153 | 53% |

### Comparación contra el promedio nacional del segmento (n=153)

| Eje | Delta promedio (comprador real vs. promedio nacional del segmento) | % de compradores por encima del promedio |
|---|---|---|
| **Afinidad** | **+6.0** | **80%** |
| Urgencia | -22.5 | 50% |
| Score final (Urgencia × Afinidad) | -10.1 | 39% |

### Distribución de Score final entre compradores reales

| Rango | Cantidad | % |
|---|---|---|
| Alto (≥70) | 0 | 0% |
| Medio (40-69) | 64 | 42% |
| Bajo (<40) | 89 | 58% |

### Desglose por marca (compradores con score calculado)

| Marca | n | Urgencia prom. | Afinidad prom. |
|---|---|---|---|
| International | 107 | 69.9 | 57.2 |
| FAW | 18 | 63.3 | 54.3 |
| MAN | 17 | 38.8 | 11.6 |
| Volkswagen | 9 | 53.3 | 68.0 |
| UD | 2 | 60.0 | 50.0 |

## 3. Interpretación

**La Afinidad predice bien.** El 80% de los compradores reales tenía una Afinidad por encima del promedio de su segmento antes de comprar. El comportamiento de marca (ya es cliente, bloque de origen, pivotes) sí anticipa qué clientes están más abiertos a cada marca — con la excepción notable de MAN, donde los compradores reales tenían afinidad muy baja (11.6 en promedio), sugiriendo que gran parte de esas ventas fueron conquista de competidores que el eje de Afinidad no vio venir.

**La Urgencia no está prediciendo el timing de compra — al contrario.** Los compradores reales tuvieron Urgencia por debajo del promedio nacional del segmento, no por encima. La hipótesis más plausible: el eje mide "hace cuánto no compra en esta banda" (antigüedad/reposición), pero buena parte de las compras de este período parecen ser **expansión de flota** (compran de nuevo aunque su flota en ese segmento todavía no esté vieja), un patrón que el eje actual no contempla — solo premia a quien "le toca" reponer por antigüedad.

**El Score final hereda la debilidad de la Urgencia.** Como Score = Urgencia × Afinidad, ningún comprador real llegó a un score "alto" (≥70) — el score promedio de los compradores (30.8) quedó por debajo del promedio nacional del segmento (35-43 según marca). Esto no invalida el motor, pero sí dice que **hoy el Score final no es un buen ranking de priorización de visitas** mientras el eje de Urgencia no se ajuste.

## 4. Supuestos y limitaciones

- **Clasificación Camión/Tractocamión de International:** se usó el código de propuesta (`ModeloCdg`) cruzado contra `Bandas_PBV_por_modelo.xlsx` para la mayoría de las 275 ventas de International (su modelo `LT625` es Tractocamión, confirmado explícitamente en el archivo de bandas). Para las familias `HV` (51 unidades) se usó el código exacto de propuesta, que coincidió con el archivo de bandas en todos los casos salvo 1 unidad (`MV607`, clasificada como Tractocamión por defecto, sin confirmar en el archivo de referencia — bajo impacto, 1 sola unidad).
- **Clientes nuevos (37%) quedan fuera del análisis por diseño** — el sistema no tiene forma de predecir compradores sin historial de flota. Esto es una limitación estructural del enfoque (no es específico de la fórmula de Urgencia), pero vale la pena tenerlo presente: poco más de un tercio de las ventas reales del año son "invisibles" para cualquier versión del Perfilador basada en historial de flota.
- Se excluyeron las 168 filas "Venta en Curso" (ofertas no cerradas) — no son compras confirmadas.
- El baseline nacional se calculó sobre el snapshot actual de `data/perfilador/` (posterior al fix de geo del 2026-08-07), no cambia la metodología del backtest en sí.

## 5. Rediseño del Eje 1 — de "Urgencia" a "Recurrencia" (2026-08-08, implementado)

Se probaron varias variantes contra las mismas 153 ventas reales antes de decidir:

| Variante | Delta vs. promedio del segmento | % compradores arriba | Score alto (≥70) |
|---|---|---|---|
| Urgencia actual (ventana 5 años, antigüedad) | -22.5 | 50% | 0% |
| Ventana 8 años | -30.2 | 30% | — |
| Bonus de expansión (2+ compras en 3 años → 100) | -1.5 | 78% | 22% *(descartada: en el barrido de umbrales, las versiones "ganadoras" dejaban al 100% de la población nacional pegada en Urgencia=100 — anulaba el eje en vez de mejorarlo)* |
| Cadencia personal (intervalo propio entre compras) | -15.2 | 58% | — |
| Ventana de antigüedad segmentada por tamaño de cuenta (Retail/Medium 2 años, Big 4, Mega 10) | -3.4 | 67% | 3% |
| Rampa invertida (reciente=alto, silencio 5+ años=0) | +22.5 | 50% | 0% |
| Invertida + segmentada por tamaño | +5.2 | 46% | 14% |
| **Frecuencia + Recencia ("Recurrencia") — ver fórmula final** | **+48.9** | **83%** | **24%** |

**Hallazgo central:** la Urgencia original medía "hace cuánto no compra" (antigüedad) — un cliente con una sola compra en 1988 y nunca más marcaba Urgencia=100 (el "más urgente" del país), mientras un cliente que compra todos los años marcaba solo 20 (poco urgente, porque su flota es "nueva"). Es el error inverso al correcto: **la Frecuencia histórica de compra predice mucho mejor que la antigüedad.** Un cliente con 5+ unidades históricas en esa banda va a seguir comprando porque tiene el negocio para hacerlo; uno con 1 sola unidad muy vieja probablemente ya no.

Se probó Frecuencia sola (delta +52.2, 82% arriba) contra varias mezclas con Recencia — Frecuencia sola es incluso mejor que las mezclas, pero se optó por sumarle un 15% de Recencia para no ignorar del todo cuándo fue la última compra (ver tabla de sensibilidad más abajo), perdiendo casi nada de poder predictivo.

**Validación cruzada:** se dividieron las 153 ventas en dos mitades al azar; ambas mitades mostraron el mismo patrón (delta +52.5 y +51.9, 86% y 79% arriba) — no es un ajuste a una muestra particular.

**Sensibilidad de pesos (robustez):**

| Mezcla (Frecuencia/Recencia) | Delta | % arriba |
|---|---|---|
| 100/0 (frecuencia pura) | +52.2 | 82% |
| **85/15 (elegida)** | **+48.9** | **83%** |
| 75/25 | +46.7 | 80% |
| 60/40 | +43.4 | 83% |
| 34/33/33 con extensión de historial también incluida | +38.7 | 84% |

### Fórmula final implementada

```
Frecuencia = min(100, (n_unidades_historicas_en_la_banda - 1) / (5 - 1) * 100)   [0 si solo 1 unidad]
Recencia   = 0 si hace más de 8 años que no compra en la banda;
             si no, 100 - (años_desde_ultima_compra / 8) * 100
Recurrencia (reemplaza a Urgencia) = Frecuencia × 0.85 + Recencia × 0.15
```

Igual que antes, Score final = Recurrencia × Afinidad / 100.

### Casos de ejemplo (validados a mano antes de implementar)

| Caso | Frecuencia | Recencia | Recurrencia nueva | Urgencia vieja |
|---|---|---|---|---|
| Compra seguido, activo hasta hoy (2020-2025, 6 unid.) | 100 | 88 | **98.1** | 20.0 |
| Compró mucho, dormido hace 20 años (1995-2005, 6 unid.) | 100 | 0 | **85.0** | 100.0 |
| Una sola compra, reciente (2025) | 0 | 88 | **13.1** | 20.0 |
| Una sola compra, muy vieja — caso real "Molino Las Mercedes" (1988) | 0 | 0 | **0.0** | 100.0 |
| Frecuencia media, activo (2018, 2020, 2023) | 50 | 62 | **51.9** | 60.0 |

El caso de Molino Las Mercedes es real (visto en `perfilador.html` en producción antes del cambio): una sola unidad de 1988, nunca más volvió a comprar — la fórmula vieja lo marcaba como el cliente más urgente del país (100); la nueva lo manda a 0, que es lo esperable.

### Estado: implementado en `perfilador.html` y `directorio.html`, pendiente de push/deploy final

- Funciones `calcularFrecuencia`/`calcularFrecuenciaScore` y `calcularRecencia`/`calcularRecenciaScore` nuevas en ambos archivos; `calcularUrgencia`/`calcularUrgenciaScore` ahora calculan la mezcla 85/15 en vez de la rampa de antigüedad (se mantuvo el nombre interno de la función por compatibilidad con el resto del código, pero la UI ahora dice "Recurrencia").
- Etiquetas actualizadas en la UI: botón de reordenar resultados y la etiqueta de la ficha de cliente en el Perfilador, columna de la tabla de score por marca en el Directorio.
- Probado con Node contra datos reales (caso Molino sintético → 0; cliente real de Arequipa con 27 vehículos → valores de Recurrencia entre 77 y 98 según marca, coherentes).
- **No se tocó el eje de Afinidad** (quedó pendiente a pedido explícito del usuario — hay dos grietas conocidas ahí, ver conversación del 2026-08-08: el amortiguador no distingue consistencia con pocas unidades, y la multiplicación anula el Score cuando Afinidad es 0 aunque el resto de las señales sean fuertes). Se revisará con el equipo de la oficina más adelante.
- **Limitación que sigue abierta:** todo el backtest se corrió sobre un solo período (ene-ago 2026) y sobre una foto fija de la flota (`cidatt a marz 2026.xlsx`). La validación cruzada (dividir la muestra al azar) confirma que no es un ajuste a casos sueltos, pero no reemplaza probarlo contra un período de ventas distinto al que se usó para diseñar la fórmula — el usuario va a pedir los históricos de CIDATT de años anteriores para poder hacer esa validación real más adelante.
- Los umbrales de "alto/medio/bajo" (70/40) para colorear los scores en la UI **no se recalibraron** — se mantienen los mismos cortes que ya existían. Los datos del backtest sugieren que siguen siendo razonables con la fórmula nueva (24% de los compradores reales caen en "alto" vs. 0% con la fórmula vieja), pero vale la pena revisarlos con uso real.

---

## 6. Afinidad — Paso 1 corregido (2026-08-08, implementado)

Revisando el Perfilador con casos reales del asesor de MAN en Apurímac, se detectaron
clientes con una sola unidad de la marca evaluada (ej. "Empresa Comunal de Servicios
Múltiples Huancuire", 1 camión MAN 2024) que mostraban Afinidad = 50 (neutral puro) en vez
de un score alto, pese a tener evidencia directa de haber comprado la marca.

**Causa 1 — el amortiguador de confianza no distinguía la marca evaluada del resto de la
banda.** El Paso 1 (¿ya es cliente?) calculaba correctamente un score alto según la recencia
de la compra, pero después ese resultado pasaba por el mismo amortiguador que los Pasos 2-4
(que sí necesitan volumen para confiar en una inferencia estadística). Con 1 sola unidad en
la banda —sin importar de qué marca— el amortiguador aplastaba cualquier resultado a 50. Caso
extremo verificado: un cliente con 1 camión MAN + 3 Volvo en la misma banda (4 unidades
elegibles en total) daba Afinidad 86, mientras uno con solo el camión MAN (1 unidad) daba 50 —
la misma evidencia de MAN, resultado distinto, solo por tener unidades de OTRA marca al lado.

**Causa 2 — el piso de 50 aplastaba compras viejas de la marca a neutral.** Un cliente con una
compra de la marca evaluada hace 14 años (caso real: "Emp Const Apurímac Contrat Grales",
MAN 2012) calculaba un score que decaía hasta 50 con el paso del tiempo — igual que un cliente
que nunca compró esa marca.

**Fix aplicado:** el Paso 1 ya no pasa por el amortiguador (es un hecho directo — compró o no
compró la marca — no una inferencia estadística que necesite volumen para confiar), y su piso
subió de 50 a 60 (nunca cae a neutral puro, aunque la compra haya sido muy vieja). Techo se
mantiene en 95 para compras muy recientes.

```
Paso 1 (nuevo): si el cliente tiene unidades de la marca evaluada en la banda:
  factor_recencia = max(0, 1 - años_desde_ultima_compra_de_la_marca / 5)
  score = 60 + factor_recencia × (95 - 60)          [rango 60-95, SIN amortiguar]
```

**Validado contra las 153 ventas del backtest** (probando distintos pisos entre 50 y 75):

| Piso | Delta Afinidad | % arriba del promedio | Delta Score combinado (con Recurrencia) | % Score arriba |
|---|---|---|---|---|
| 50 (solo quitar amortiguador) | +7.6 | 80% | +29.5 | 87% |
| **60 (elegido)** | **+10.3** | **80%** | **+32.0** | **82%** |
| 65 | +11.6 | 73% | +33.2 | 80% |
| 70 | +12.9 | 73% | +34.5 | 80% |

Se eligió 60 como balance: mejora sustancial sobre el neutral (60 vs 50) sin sacrificar casi
nada de poder predictivo (82% vs 87% de score arriba del promedio con piso 50). Subir más el
piso sigue mejorando el delta promedio pero empieza a perder discriminación entre compradores
buenos y regulares.

**Casos de validación (verificados con Node antes de pushear):**

| Caso | Antes | Después |
|---|---|---|
| 1 unidad MAN, compra reciente (Huancuire, Aysa) | 50 | **81** |
| 1 unidad MAN + 3 Volvo en la misma banda | 86 (inconsistente con el caso de arriba) | **88** |
| 1 unidad MAN, compra de hace 14 años (Emp Const Apurímac) | 50 | **60** |

**Nota importante:** este fix solo ayuda cuando el cliente YA tiene la marca evaluada. No
resuelve el caso de conquista de competencia (MAN seguía en Afinidad promedio 11.6 entre sus
compradores reales, sin cambios) ni el caso de clientes grandes con muchas unidades viejas de
la marca cuya última compra no fue reciente (ej. clientes con 100+ unidades International
donde la recencia sigue siendo la única variable del Paso 1, sin crédito extra por volumen —
queda pendiente si se quiere sumar también volumen al Paso 1, no solo recencia).

Implementado en `perfilador.html` y `directorio.html`. Commit `d81a9b1`.
