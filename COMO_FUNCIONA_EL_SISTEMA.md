# CIDATT TCP Sur — Cómo funciona el sistema (explicación completa)

> Actualizado el 2026-09-09 con el rediseño de la sección 15 del
> `AVANCE_PROYECTO_CIDATT.md`: base de datos nueva, bandas de peso, ficha del
> Directorio y Perfilador por niveles. Todo lo que describe este documento está en
> producción.

**Producción:** https://cidatt-tcp-sur.vercel.app/
**Repo:** https://github.com/Puchulungo/cidatt-tcp-sur
**Última actualización:** 2026-08-11

Este documento explica el sistema completo de punta a punta: qué es, cómo está construido,
de dónde sale cada dato, y cómo funciona el motor de scoring por dentro — pensado para poder
responder cualquier pregunta de "¿y esto cómo funciona exactamente?" sin tener que abrir el
código.

---

## 1. Qué es, en una frase

Un sitio web interno para el equipo comercial de Truck Center Perú Sur (marcas MAN, Dongfeng,
FAW, International, UD, Volkswagen) con dos herramientas: un **Directorio** para buscar
cualquier empresa del Perú y ver su flota de camiones registrada, y un **Perfilador** que
prioriza, para una marca y clase de vehículo específica, qué clientes tienen más probabilidad
de comprar — con un score auditable, no una caja negra.

## 2. Arquitectura técnica

**No hay servidor ni base de datos.** Es un sitio 100% estático (HTML/CSS/JavaScript puro,
sin frameworks) hosteado en Vercel. Todo el cálculo — búsquedas, filtros, el motor de scoring
completo — corre en el navegador del usuario, sobre archivos JSON que se descargan al abrir
cada página. Cualquier push a la rama `main` del repo redespliega el sitio automáticamente en
1-2 minutos.

Esto tiene una implicancia importante: **los datos no se actualizan solos.** Reflejan una
foto fija del parque vehicular al momento en que se generaron los archivos (hoy, marzo/agosto
2026). Si un cliente compra un camión mañana, el sistema no lo va a saber hasta que se vuelva
a procesar un Excel nuevo y se suban los JSON actualizados.

**Seguridad:** el sitio es privado, no público. Usa login corporativo de Microsoft 365 / Azure
AD (misma cuenta que ya usaba el dashboard de leads), con verificación en dos pasos por
Microsoft Authenticator. La sesión se cachea en el navegador (`sessionStorage`), así que una
vez logueado en cualquiera de las 3 páginas del sitio, no vuelve a pedir login en las otras
dos.

## 3. De dónde sale la información

Hay dos fuentes de datos originales, ambas en Excel, que se procesan una sola vez para generar
los JSON que realmente usa el sitio:

**`operaciones`** — el padrón de flota: una fila por vehículo registrado en el Perú (285,632
filas), con placa, RUC del dueño, marca, modelo, año de fabricación, peso bruto, clase
(Camión/Remolcador), departamento/provincia, y una columna `ORIGEN SUGERIDO` que clasifica la
marca en bloques (Europeo, Chino, Americano, Japonés, Coreano, Otro). Esta es la data que
"trackea" CIDATT — específicamente inmatriculaciones (primera matrícula), no compras
posteriores de usados.

**`Hoja1`** — datos de SUNAT por RUC (142,303 filas): si la empresa está Activa o de Baja,
sector económico, CIIU, fecha de inicio de actividades, dirección, teléfono, etc.

Estas dos se cruzan por RUC para armar:
- **`clientes_v2.json`** (~98MB): un registro por cliente (136,425 en total), con sus datos
  SUNAT y su flota completa. Es lo que usa el buscador del Directorio.
- **`data/perfilador/*.json`**: los mismos 136,425 clientes, pero partidos en 26 archivos (uno
  por departamento) para que el navegador no tenga que descargar los 98MB de una — solo carga
  los departamentos que el usuario filtra. Cada unidad de flota acá trae además el peso bruto,
  categoría de peso y bloque de origen, que es lo que necesita el motor de scoring.

Cuando alguien abre la ficha de un cliente en el Directorio, el sitio busca ese mismo RUC en el
shard de `data/perfilador/` correspondiente para "enriquecer" la ficha con esos datos extra
(peso, categoría, origen) — por eso la ficha del Directorio también puede mostrar el score por
marca (ver sección 6).

## 4. El Directorio

Es el buscador por RUC o razón social (o nombre comercial). Al abrir la ficha de un cliente
muestra:
- Datos SUNAT: Estado (Activo/De baja, con badge visual), antigüedad del negocio, tipo de
  contribuyente, sector económico, CIIU, ubicación (departamento/provincia/distrito).
- Badge de segmentación (Retail/Medium Fish/Big Fish/Mega Fish) junto al RUC, en el header de
  la ficha — mismos cortes y colores que ya usaba el Perfilador (desde 2026-08-11).
- El árbol completo de su flota, en cuatro niveles (rediseñado el 2026-09-09):
  **Segmento de peso → Año (descendente) → Marca + Modelo + Carrocería + PBV + cantidad →
  placas.** El primer nivel son los 4 segmentos de Camión con su rango a la vista (Ligeros
  menos de 10 t · Medianos 10 a 25 t · Pesados 25 a 41 t · Super Pesados 41 t a más) más
  Remolcador, que no se segmenta por peso; solo aparecen los segmentos donde el cliente
  tiene unidades. Dos unidades se suman en una sola fila únicamente si coinciden en año,
  marca, modelo, carrocería y peso bruto — si difieren en cualquiera de esos campos van en
  filas separadas. Un click más despliega la grilla de placas (5 columnas en desktop,
  auto-ajustable en pantalla chica) — útil para detectar a simple vista clientes que compran
  en Arequipa (placas inmatriculadas ahí empiezan con "V").
- Desde agosto 2026, también la tabla de Score por marca (ver sección 6).

No tiene filtros de elegibilidad ni banda de peso — muestra la flota completa del cliente tal
cual, sin descartar nada. Es la herramienta para "quiero saber todo sobre esta empresa
puntual", no para priorizar una lista.

## 5. El Perfilador — filtros y elegibilidad (Eje 0)

El Perfilador responde una pregunta distinta: "dada una Marca y una Clase (Camión o
Tractocamión), ¿qué clientes de tal departamento/sector son los mejores prospectos?"

**Marca y Clase son obligatorios y de selección única** (no se pueden combinar dos marcas o
dos clases a la vez) porque cada combinación tiene su propia banda de peso y su propio bloque
de origen compatible — mezclarlas rompería el cálculo. Filtros opcionales: ubicación
geográfica y Sector Económico + CIIU.

**Elegibilidad (Eje 0):** antes de calcular cualquier score, el sistema filtra qué unidades de
la flota del cliente "cuentan" para esa marca+clase. Cada combinación tiene un **núcleo** (el
rango real de peso de los modelos de esa línea) y una **tolerancia** (núcleo ±15% desde el
2026-09-09 — antes ±25%, se cerró para acotar las listas, con cada extremo anclado a su
propio límite):

| Marca | Clase | Núcleo (kg) | Banda con tolerancia (kg) | Bloque de origen |
|---|---|---|---|---|
| MAN | Camión | 41,000–50,000 | 34,850–57,500 | Europeo |
| Dongfeng | Camión | 41,000–50,000 | 34,850–57,500 | Chino |
| FAW | Camión | 41,000–50,000 | 34,850–57,500 | Chino |
| International | Camión | 30,000 (punto único) | 25,500–34,500 | Americano |
| UD | Camión | 11,700–34,000 | 9,945–39,100 | Japonés |
| Volkswagen | Camión | 6,000–31,000 | 5,100–35,650 | Europeo |
| Todas | Tractocamión | sin banda de peso | sin banda | (cada una la suya) |

UD y Volkswagen no tienen catálogo de Tractocamión, así que esa clase no aparece como opción
para esas dos marcas. El núcleo de UD llega a 34 t porque incluye el Quester/CWE, que entró al
stock en agosto de 2026.

Un cliente sin ninguna unidad dentro de esa banda (de cualquier marca, no solo la evaluada) ya
no se descarta: desde el 2026-09-09 aparece en el último grupo de la lista, "Sin flota en la
banda", sin score. Antes se le daba un 50 neutro, lo que lo dejaba por encima de clientes
reales de la competencia — premiaba la ausencia de información.

## 6. El motor de scoring — Eje 1 (Recurrencia) y Eje 2 (Afinidad)

Para cada cliente elegible se calculan dos ejes independientes, más una etiqueta aparte
(Tamaño de cuenta). Todo se recalcula al vuelo en el navegador, no hay nada precalculado ni
guardado — por eso la ficha del Directorio puede mostrar el score de las 6 marcas para
cualquier cliente con solo tener sus datos de flota ya cargados.

### Eje 1 — Recurrencia (rediseñado el 2026-08-08)

Mide "¿este cliente tiene un patrón de compra activo en este segmento de peso+clase?" —
independiente de la marca (eso lo mide Afinidad).

Originalmente se llamaba "Urgencia" y medía solo antigüedad: cuánto tiempo pasó desde la
última compra de cualquier marca en esa banda, con una rampa de 0 a 100 en 5 años. Se
descubrió, con un backtest contra 293 ventas reales de 2026 (ver `BACKTEST_SCORING_2026.md`),
que esa lógica funcionaba al revés de lo esperado: los compradores reales tenían Urgencia por
debajo del promedio de su segmento, no por encima. El caso extremo: un cliente con una sola
unidad comprada en 1988 y nunca más marcaba Urgencia=100 (el "más urgente" del país), mientras
uno que compra todos los años marcaba apenas 20.

La fórmula actual mide **Recurrencia**: cuántas veces (Frecuencia) y qué tan reciente
(Recencia) compró el cliente en esa banda, con Frecuencia pesando mucho más:

```
Frecuencia = (n_unidades_historicas_en_la_banda - 1) / (5 - 1) × 100, tope en 100
             (0 si el cliente tiene solo 1 unidad — no hay patrón para confiar)
Recencia   = 0 si hace más de 8 años que no compra en la banda;
             si no, 100 - (años_desde_la_ultima_compra / 8) × 100
Recurrencia = Frecuencia × 0.85 + Recencia × 0.15
```

Validado: el delta contra el promedio nacional del segmento pasó de -22.5 (fórmula vieja) a
+48.9 (nueva), con 83% de los compradores reales quedando por encima del promedio de su
segmento (antes 50%). Se probó con validación cruzada (dividiendo la muestra en dos mitades al
azar) y sensibilidad de pesos (varias mezclas Frecuencia/Recencia, todas mejoran sobre la
fórmula vieja) antes de confiar en el resultado.

### Eje 2 — Afinidad (rediseñado 2026-09-09 — de cascada a niveles)

Mide qué tan abierto está el cliente a la marca específica evaluada, mirando su historial de
compras dentro de la banda **ponderado por recencia y por cercanía al núcleo de peso** (las
compras en la zona de tolerancia pesan menos: 100% en el núcleo, bajando hasta 60% en el borde).

Hasta agosto de 2026 esto era una cascada de pasos donde el primero que aplicaba definía el
resultado. El problema era que los anclajes de cada paso se pisaban entre sí: un desconocido
con flota mixta podía sacar 68 y un dueño real de la marca de hace 6 años sacaba 60, o sea que
el desconocido aparecía primero. Desde el 2026-09-09 la Afinidad se organiza en **cinco niveles
con rangos que no se solapan**, así el orden queda garantizado por construcción:

| Nivel | Quién cae ahí | Rango |
|---|---|---|
| 1 | **Ya compró la marca** en esa clase | 80–100 |
| 2 | La **mayoría de su flota** (más del 50% ponderado) es del bloque de origen de la marca | 55–79 |
| 3 | Su flota está en **bloques más lejanos** | 20–54 |
| 4 | **Fiel a un competidor**: 80% o más de su flota en una sola marca rival | 0–19 |
| 5 | **Sin flota en la banda** | sin score |

Un cliente del nivel 2 nunca puede aparecer por encima de uno del nivel 1, sin importar sus
otros números. Dentro de cada nivel el puntaje se mueve así:

- **Nivel 1:** por recencia de la última compra de la marca (ventana de 8 años, alineada con la
  Recencia del Eje 1), descontado por concentración de marca ajena. Así, quien tiene 1 unidad
  de la marca y 20 de un rival cae al piso del nivel, debajo de quien tiene 5 de la marca y
  nada más.
- **Niveles 2 y 3:** por la distancia de origen ponderada de su flota (ver abajo), descontada
  por concentración de marca y ajustada por el pivote.
- **Nivel 4:** cuanto más concentrado en el rival, más abajo.

**Distancia de origen — escalera de 3 peldaños, simétrica.** Una unidad de otra marca no cuenta
igual según de dónde venga. La lógica no es geografía, es cercanía de precio:

| | Marca premium (MAN, VW, International, UD) | Marca china (Dongfeng, FAW) |
|---|---|---|
| Cerca | Bloque propio de la marca — 85 | Chino — 85 |
| Medio | Europeo, Americano, Japonés, Coreano — 70 | "Otro" (chinas de bajo costo) — 70 |
| Lejos | Chino y "Otro" — 45 | Todo el bloque premium — 45 |

El bloque "Otro" dejó de contar como premium el 2026-09-09: se verificó en la base que son
marcas chinas de bajo costo mal clasificadas (KYC, Kama, Sitom, Strong, Autocraft — 1,614
unidades que estaban al lado de Volvo y Freightliner).

**El pivote es una bonificación, no un nivel.** Si las últimas compras del cliente volvieron al
bloque cercano a la marca, sube dentro de su grupo; si se alejaron, baja. Antes era un paso
propio de la cascada y compartía señal con el descuento por concentración, o sea que contaba
dos veces lo mismo.

**Descuento por concentración de marca:** si más del 33% de la flota del cliente en esa banda
está en una sola marca rival, el puntaje se descuenta de forma continua, hasta un máximo de 85%
de descuento con concentración ≥90%.

**Piso de evidencia — mínimo 3 unidades.** Con 1 o 2 unidades en la banda no hay patrón que
medir: no se aplica el descuento por concentración ni se puede caer en el nivel 4. Un cliente
con una sola unidad Volvo tendría 100% de "concentración" y quedaría marcado como fiel a un
competidor, cuando lo que hay es una compra, no una fidelidad. Estos clientes se muestran con
una etiqueta visible de "señal débil" que además sirve de desempate: a igual puntaje, primero
el que tiene más unidades. Hasta agosto esto se manejaba con un amortiguador que aplastaba el
score a 50, lo que enterraba a clientes reales de la marca que tenían una sola unidad.

### Score final y Tamaño de cuenta

```
Score final = posición dentro del nivel (0 a 1) × Recurrencia
```

Multiplicar (no promediar) castiga fuerte cuando cualquiera de los dos ejes es muy bajo. Se usa
la **posición dentro del nivel** y no la Afinidad cruda porque los rangos de nivel son angostos
a propósito (el nivel 1 solo se mueve entre 80 y 100), así que multiplicar por la Afinidad tal
cual dejaba que la Recurrencia — que va de 0 a 100 — decidiera sola el orden dentro del grupo:
un cliente que compró la marca hace 2 años quedaba debajo de uno que compró hace 12 pero con
flota más grande.

**Los resultados salen agrupados por nivel, no en una lista plana.** Cada grupo es una sección
visible con su título y su conteo, y dentro de cada sección ordena el Score final. Así el nivel
manda en la estructura y la Recurrencia decide a quién llamar primero dentro del grupo. Los
empates se resuelven por Recurrencia y después por tamaño de flota.

**Tamaño de cuenta** es una etiqueta aparte, no se mezcla en el score, basada en el total de la
flota completa del cliente (todas las marcas, todas las clases):

| Categoría | Rango | % de clientes (Perú) |
|---|---|---|
| Retail | 1-5 unidades | 95.6% |
| Medium Fish | 6-29 unidades | 4.1% |
| Big Fish | 30-99 unidades | 0.3% |
| Mega Fish | 100+ unidades | 0.07% |

## 7. Qué tan bien predice hoy (resultado del backtest)

Se cruzaron las 293 ventas reales que hizo la empresa en lo que va de 2026 contra lo que el
sistema hubiera dicho de cada cliente *antes* de que comprara (se verificó que no hay trampa:
el 98% de esas ventas no estaban todavía en la foto de datos que usa el Perfilador). Resultado
con la fórmula actual (Recurrencia + Afinidad sin cambios):

- **37% de los compradores reales eran clientes completamente nuevos**, sin ningún historial
  de flota — invisibles para cualquier sistema basado en historial, por diseño.
- **11%** tenía historial pero ninguna unidad dentro de la banda de peso de la marca que
  compró — el Perfilador ni los habría mostrado como prospecto de ese segmento.
- Del **53%** restante, el 83% tenía Recurrencia por encima del promedio de su segmento, y el
  80% tenía Afinidad por encima del promedio — ambos ejes predicen genuinamente mejor que el
  azar.

**Nota (2026-08-11):** estos números son de antes del rediseño de Afinidad (Pasos 2, 3 y 4 —
ver sección 6 y `BACKTEST_SCORING_2026.md` sección 7). No se volvió a correr el backtest de
las 293 ventas con la fórmula nueva — queda pendiente para cuantificar el impacto real.

## 8. Limitaciones conocidas (para no venderlo de más)

- **La data es una foto fija, no en vivo.** No hay forma hoy de saber si un cliente compró la
  semana pasada hasta que se procese un Excel nuevo de CIDATT.
- **La Recurrencia se satura a las 5 unidades.** Medido el 2026-09-09: un cliente con 5
  unidades en la banda y uno con 60 sacan prácticamente lo mismo (94.7 contra 95.3 de media).
  Es la forma de la Frecuencia, que crece linealmente hasta 5 unidades y ahí topa. Está
  identificado pero **no se corrigió a propósito**: la fórmula actual salió de un backtest
  contra ventas reales y cambiarla a ojo desharía esa validación. Se decide con el backtest
  nuevo.
- **Dueños de la marca fuera de su propia banda.** Todo se evalúa marca × clase dentro de la
  banda de peso, así que un cliente que tiene la marca en otro rango no aparece arriba. El caso
  extremo es Dongfeng: 3,874 de sus 4,157 dueños quedan fuera, porque su banda es la línea
  volquete de 41-50 t mientras casi toda su flota en Perú es liviana. Es una limitación
  aceptada a conciencia, no un error.
- **37% de las ventas reales son de clientes sin historial** — ninguna versión de este sistema
  basada en flota puede predecir a un comprador que nunca apareció antes.
- **El backtest se hizo sobre un solo período** (enero-agosto 2026). La validación cruzada
  (dividir la muestra al azar) da confianza de que no es un ajuste a casos sueltos, pero no
  reemplaza probarlo contra un período distinto al que se usó para diseñar la fórmula.

## 9. Roadmap

- **Rehacer el backtest contra los CIDATT históricos** (2018-2026, ya conseguidos y
  estandarizados). Es lo que decide las preguntas abiertas: la saturación de la Recurrencia, el
  reparto 85/15, los rangos de los niveles y el piso de 3 unidades. La métrica cambia: ya no
  "los compradores puntúan por encima del promedio" sino "en qué grupo cae el comprador real y
  cuántos clientes hay que recorrer para llegar a él".
- **Recurrencia real** — con los 8 snapshots anuales se puede medir el intervalo de recompra
  observado por cliente, en vez del proxy de una sola foto. Sería la mejora más grande posible
  sobre todo el sistema.
- **Panel de auditoría por RUC** — mostrar todos los números intermedios del cálculo para poder
  diagnosticar en segundos por qué un cliente salió donde salió.
- **Registrar el feedback del asesor** sobre los clientes que salen en la lista — es la única
  forma de llegar algún día a un modelo estadístico en vez de reglas afinadas a mano.
- **Carterización de asesores** (botón "CARTERAS TCP" en el landing, hoy deshabilitado) — no
  se ha empezado a construir.
- Posibles fuentes de datos adicionales exploradas pero no implementadas: refrescar la
  inmatriculación con más frecuencia contra MTC/SUNARP (en vez de un Excel manual cada tanto),
  licitaciones públicas de SEACE como señal adelantada de compra, datos de CITV/SOAT como
  señal de decomiso de unidades viejas.
