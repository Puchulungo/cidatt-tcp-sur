# CIDATT TCP Sur — Registro de avance

**Repo:** https://github.com/Puchulungo/cidatt-tcp-sur
**Producción:** https://cidatt-tcp-sur.vercel.app/
**Última actualización de este documento:** 2026-08-07 (noche) — motor de scoring del
Perfilador **implementado y en producción**, sección 6

---

## 1. Seguridad — Login corporativo con Microsoft

El sitio pasó de ser público a tener acceso restringido. Se usa el mismo mecanismo que ya
tenían en el dashboard de leads (`leads_dashboard`): login con la cuenta corporativa de
Microsoft 365 / Azure AD, con verificación en dos pasos (Microsoft Authenticator) que ya
estaba configurada para la cuenta `ipsa_tcp@grupoeuromotors.onmicrosoft.com`. La aprobación
por celular es 100% nativa de Microsoft — no hay código propio gestionando eso.

**App Registration en Azure AD** (creada nueva, separada de `leads_dashboard`):
- Nombre: `CIDATT-TCP-Sur`
- Tenant: EUROMOTORS S.A. (single-tenant)
- Client ID: `ef5d1a00-5207-4052-99b3-63366114238e`
- Tenant ID: `1fd5f062-1288-4b1e-bd47-85287dde4d4c`
- Tipo de plataforma: Single-page application (SPA)
- Redirect URI registrada: `https://cidatt-tcp-sur.vercel.app/` (siempre la raíz, sin importar
  desde qué página se inicia sesión — así solo hace falta registrar una URL)

**Implementación técnica:**
- Librería `@azure/msal-browser` v3.30.0, vendorizada localmente en `lib/msal-browser.min.js`
  (no depende de un CDN externo).
- `auth.js` — lógica de login compartida por las 3 páginas del sitio (landing, directorio,
  perfilador). Usa `sessionStorage` como cache, por lo que una vez logueado en cualquier
  página, las otras dos no vuelven a pedir login (mismo origin).
- Cada página tiene una pantalla de login (`#auth-gate`) que tapa el contenido hasta
  verificar la sesión.

---

## 2. Datos — Migración a la matriz de marzo 2026

Se recibió un Excel nuevo (`cidatt a marz 2026.xlsx`, 285,632 filas, una por vehículo) con
datos más completos que el `clientes_v2.json` original: incluye **peso bruto**,
**departamento**, **provincia**, y clasificaciones de peso ya calculadas
(`CLASIFICACION_PESO` y `CATEGORIA_PESO_BRUTO_CLASE`).

**Decisiones de procesamiento:**
- Se usa la columna **`MARCA ESTANDAR`** (no `MARCA`) porque tiene menos variantes
  duplicadas de la misma marca (233 vs 262 valores únicos; 15,179 de 285,632 filas
  difieren entre ambas columnas, ej. variantes de "MITSUBISHI" consolidadas bajo
  "MITSUBISHI FUSO"). Este cambio se aplicó después de la primera versión del
  Perfilador y obligó a regenerar los 27 archivos de `data/perfilador/`.
- Se corrigió un problema de codificación de caracteres presente en el Excel original
  (bytes UTF-8 mal decodificados como Windows-1252, ej. "CAÃ‘ETE" → "CAÑETE").
- Las 2 unidades de grúas industriales (marcas LIEBHERR y GROVE, con peso bruto de
  160,000 kg y 300,000 kg) se marcaron como `atipico: true` y se excluyen de los
  resultados del Perfilador y de la ficha del Directorio — no son relevantes para la
  venta de camiones/remolcadores.
- Por decisión explícita: **esta matriz nueva NO reemplaza** `clientes_v2.json`. El
  buscador por RUC/razón social sigue funcionando con los datos viejos; la matriz nueva
  alimenta el Perfilador y enriquece la ficha del Directorio (cruzando por RUC) sin
  sustituir la fuente original.

**Estructura de datos generada** (`data/perfilador/`):
- 27 archivos JSON, uno por departamento (ej. `lima.json`, `arequipa.json`), cada uno con
  la lista de clientes de ese departamento y su flota completa.
- `_index.json` — índice liviano con departamento, provincias disponibles, y cantidad de
  clientes por archivo (se usa para poblar los filtros sin cargar los datos pesados).
- Este esquema de "sharding" por departamento resuelve el problema de rendimiento del
  JSON de 83MB: en vez de descargar todo, el sitio solo carga los departamentos que el
  usuario selecciona.

---

## 3. Estructura del sitio

Landing (`index.html`) con logo de Truck Center Peru y 3 accesos:

| Botón | Destino | Estado |
|---|---|---|
| DIRECTORIO | `directorio.html` | Activo |
| PERFILADOR | `perfilador.html` | Activo |
| CARTERAS TCP | — | Deshabilitado, etiqueta "Próximamente" (proyecto a futuro) |

### `directorio.html` (buscador por RUC / razón social)
- Es la página original, renombrada (antes era `index.html`).
- Búsqueda por RUC o razón social sobre `clientes_v2.json` (sin cambios).
- Ficha del cliente actualizada:
  - "Ciudad" → renombrado a **"Departamento"**, se agregó **"Provincia"** (cruzando por
    RUC contra la matriz nueva; si el cliente no está ahí, cae a los datos viejos sin
    romper nada).
  - Árbol de flota, versión final (dos iteraciones):
    1. Primera versión: Clase → Categoría de peso → Año → Marca + cantidad, con la
       categoría como pestaña que había que abrir.
    2. **Versión actual (aplanada):** Clase (Camión/Remolcador) → al abrirla se
       despliega todo de una, sin clicks adicionales → **Año** (descendente, más
       reciente primero) → dentro de cada año, una fila por combinación de
       **Marca + banda de peso + cantidad** (ej. "MAN — 25 – 28 t — 3 unidades"),
       ordenadas de mayor a menor cantidad. La banda de peso usa el rango real en
       toneladas calculado de los cortes de la data (5 bandas para camión, 4 para
       remolcador) en vez del nombre técnico de la categoría.
  - El árbol viejo (clase→marca→modelo→año, sin peso) se mantiene como fallback si un
    cliente no aparece en la matriz nueva.

### `perfilador.html` (nuevo)
- Filtros: **Departamento** (multi-selección), **Provincia** (multi, se filtra según los
  departamentos elegidos), **Clase** (Camión/Remolcador), **Peso bruto** (slider de rango
  doble en kg, 1,200 – 90,000 kg).
- Si se seleccionan varios departamentos grandes (o varios a la vez), aparece un aviso de
  que puede tardar más en cargar.
- Resultados: razón social + RUC + cantidad de unidades que matchean el filtro, ordenados
  de mayor a menor cantidad.
- Al hacer click en un cliente se despliega por **año (descendente) → marca + cantidad**
  de las unidades que matchean el filtro (no todas las unidades del cliente).

---

## 4. Datos SUNAT — Directorio y Perfilador enriquecidos (agosto 2026)

Se agregó una pestaña nueva al Excel (`Hoja1`, 142,303 filas, una por RUC) con datos de
SUNAT que antes no teníamos: Estado del Contribuyente, Condición del Contribuyente, Sector
Económico, CIIU (código y descripción), Fecha de Inicio de Actividades, Tipo de
Contribuyente, Distrito, Nombre Comercial, y datos de contacto (dirección/teléfono/email/
representante legal, con cobertura baja).

**Cruce con la flota:** el cruce por RUC contra `operaciones` dio 99.7% de match a primera
vista; se detectó que los 380 RUCs sin match tenían un prefijo `XX` mal cargado (ej.
`XX20511999287` en vez de `20511999287`) — al limpiarlo, el cruce quedó en **100%**. También
se corrigió el mismo problema de codificación de caracteres que en la matriz de marzo
(mojibake UTF-8 mal decodificado, ej. "BOLAÃ‘OS" → "BOLAÑOS") sobre razón social,
departamento, provincia, distrito y dirección de esta pestaña nueva.

**Decisión sobre Condición del Contribuyente:** se descartó por completo (no aparece ni en
Directorio ni en Perfilador). No es un buen indicador de si una empresa sigue operando:
"NO HABIDO" solo significa que SUNAT no pudo verificar el domicilio fiscal declarado
(la empresa no actualizó su dirección, no respondió notificaciones, etc.), algo muy común
en empresas que siguen funcionando con normalidad. El campo que sí importa para saber si
un prospecto sigue vigente es **Estado del Contribuyente** (ACTIVO / BAJA DE OFICIO / BAJA
DEFINITIVA / SUSPENSIÓN TEMPORAL / BAJA PROV. POR OFICIO).

**`clientes_v2.json` regenerado desde cero:** ya no se arma solo con el Excel viejo — ahora
sale de cruzar `operaciones` (flota) + `Hoja1` (directorio SUNAT) por RUC. Pasó de 139,469 a
136,425 clientes (ahora coincide exactamente con la cantidad de RUCs únicos con flota
registrada, sin duplicados ni residuos de la fuente anterior). Cada cliente ahora incluye:
`estado`, `tipo_contribuyente`, `sector_economico`, `ciiu_codigo`, `ciiu`,
`fecha_inicio_actividades`, `distrito`, `nombre_comercial` (además de los campos que ya
existían: `direccion`, `telefono`, `email`, `representante`, `ciudad`/departamento,
`provincia`, `vehiculos`).

**Shards de `data/perfilador/*.json` regenerados** con los mismos campos nuevos a nivel de
cliente (además de lo que ya tenían: flota con peso/categoría/año/marca). Se sumó un archivo
liviano nuevo, `data/perfilador/_sectores.json`, con el catálogo Sector Económico → lista de
CIIU (ordenados por frecuencia) — se usa para poblar el filtro de CIIU dependiente del sector
elegido sin tener que cargar los shards pesados de cada departamento.

### `directorio.html`
- Ficha del cliente ahora muestra: **Estado** (con indicador visual verde/rojo), **Antigüedad
  del negocio** (calculada desde fecha de inicio de actividades, ej. "31 años (desde 31 de
  agosto de 1994)"), **Tipo de Contribuyente**, **Sector Económico**, **Distrito** (sumado a
  Departamento/Provincia que ya existían), y el **Nombre Comercial** debajo de la razón
  social cuando difiere de esta.
- La lista de resultados muestra un badge rojo **"DE BAJA"** junto al cliente si su Estado no
  es ACTIVO (con el estado exacto en el tooltip).
- El buscador ahora matchea también por **Nombre Comercial**, no solo RUC/razón social (útil
  porque ~35,500 empresas operan bajo un nombre de marca distinto al legal).

### `perfilador.html`
- Nuevo filtro **Sector Económico** (multi-selección, checklist como Departamento).
- Nuevo filtro **CIIU**, dependiente del/los sector(es) elegido(s) — solo muestra las
  descripciones de CIIU relevantes a ese sector (evita un dropdown de 263 valores). Dentro de
  "Transporte y Comunicaciones" el CIIU casi no discrimina (98% es "Transporte de carga por
  carretera"), pero en Comercio/Construcción/Manufactura sí separa bien el tipo de actividad
  (ej. venta mayorista de materiales de construcción vs. alimentos vs. ferretería).
- Nuevo filtro **Distrito**, dependiente del/los departamento(s) elegido(s), igual que
  Provincia.
- **Estado = ACTIVO queda fijo y obligatorio** en la búsqueda (no es un checkbox, es un
  filtro siempre aplicado) — nunca se muestran empresas de baja o suspendidas como
  prospectos. Se decidió explícitamente no usar Condición (Habido/No Habido) para esto.

**Nota técnica:** `clientes_v2.json` pesa ~91MB (GitHub avisa que supera su límite
recomendado de 50MB por archivo, aunque no bloqueó el push). Si sigue creciendo, evaluar
particionarlo (ej. por departamento, como ya se hace en `data/perfilador/`) o migrar a Git
LFS.

---

## 5. Pendiente / ideas a futuro

- **Carterización de asesores** (botón "CARTERAS TCP"): idea para que cada asesor pueda
  ver o solicitar la cartera de clientes que tiene asignada (hoy se maneja en Drive
  Sheets por marca). Falta definir el flujo de aprobación (asesor avisa → supervisor
  aprueba) y, sobre todo, qué tan seguido habría que actualizar la asignación — es
  probablemente alto al principio y bajaría con el tiempo. **No se ha empezado a
  construir.**
- Combinar visualmente Directorio y Perfilador en una experiencia más unificada (quedó
  abierto, sin definir todavía).

---

## 6. Motor de scoring del Perfilador — implementado (agosto 2026)

Objetivo: convertir el Perfilador en una herramienta de priorización real. Para cada
combinación **cliente × marca × clase (Camión o Tractocamión/Remolcador)** se calculan 3
ejes independientes + 1 etiqueta aparte. Nada de esto está programado todavía — es diseño
puro, discutido a fondo con el usuario, pendiente de traducir a código.

Fuente de datos nueva usada en este diseño: `Bandas_PBV_por_modelo.xlsx` (carpeta del
proyecto), con 2 hojas: `Bandas_por_modelo` (75 modelos reales de MAN/Dongfeng/FAW/
International/UD/Volkswagen, con PBV, HP y bandas de peso ya calculadas) y
`Techo_maximo_por_marca` (peso máximo homologado por marca+clase).

### Eje 0 — Elegibilidad (banda de PBV por marca + clase)

Regla general: **núcleo** = rango real de PBV de los modelos de esa línea; **tolerancia**
= núcleo_min × 0.75 (piso) hasta núcleo_max × 1.25 (techo). Cada extremo se ancla a su
propio límite del núcleo, no al centro.

| Marca | Clase | Núcleo | Banda final (±25%) | Notas |
|---|---|---|---|---|
| MAN | Camión (volquete) | 41,000-50,000 kg | 30,750-62,500 kg | banda compartida con Dongfeng/FAW |
| Dongfeng | Camión (volquete) | 41,000-50,000 kg | 30,750-62,500 kg | línea T-LIFT/KINGRUN35; EVOLUTION/GX son tracto |
| FAW | Camión (volquete) | 41,000-50,000 kg | 30,750-62,500 kg | solo línea **JH6**; JK6/Tiger (4,500-25,000 kg) queda **excluida por completo**, es la línea liviana que no le importa al jefe |
| International | Camión | 30,000 kg (punto único) | 22,500-37,500 kg | producto secundario para ellos, no se reduce más porque es un solo modelo |
| UD | Camión | 11,700-18,500 kg | 8,775-23,125 kg | el modelo CWE 350 (35,000 kg) queda **excluido por ahora** — no llega hasta el próximo año, revisar y sumar cuando esté disponible |
| Volkswagen | Camión | 6,000-31,000 kg | 4,500-38,750 kg | todo el catálogo cuenta, es un espectro amplio real (no hay línea "flagship" angosta) |
| **Todas las marcas** | **Tractocamión/Remolcador** | **sin banda** | **sin banda** | elegibilidad universal, sin filtro de peso, para las 6 marcas |

### Eje 1 — Urgencia (timing de recompra)

Mide cuándo fue la última compra **de cualquier marca** (no la evaluada) dentro de la
banda peso+clase del Eje 0 — mide "¿le toca comprar en este segmento?", no "¿le toca
comprar nuestra marca?" (eso es Eje 2).

```
años_transcurridos = max(0, año_actual − año_fabricación_más_reciente_dentro_de_la_banda)
Score_Urgencia = min(100, (años_transcurridos / 5) × 100)
```

Rampa lineal 0→5 años (20 pts/año), meseta en 100 desde el año 5 en adelante, sin decaer
nunca (la unidad más antigua registrada en CIDATT es de 1946). Filosofía explícita del
usuario: mejor que un cliente "viejo" salte a la luz y lo llamen a descartar, a que quede
escondido por un score raro.

Usa **año de fabricación** como proxy de año de compra — validado con el usuario: CIDATT
trackea inmatriculaciones (primera matrícula), los vehículos usados no aparecen, y el
rezago típico entre fabricación y matrícula es de 0-2 años. Contexto de negocio: contratos
mineros suelen exigir modelo del año siguiente al de la licitación (ej. en 2026 piden 2027)
para que el contrato corra el máximo de años posible — esto genera compras en clusters de
un mismo año, no un goteo parejo.

### Eje 2 — Afinidad de marca (comportamiento) — el más complejo, aún con puntos abiertos

Mide qué tan abierto está el cliente a la marca específica evaluada, mirando su historial
de compras en la banda con **ponderación por recencia** (se descartó una ventana fija de
7 años por diluir señales — ver razonamiento abajo).

6 arquetipos evaluados en cascada (el primero que aplica define el resultado):

- **Paso 0 (Guardia, Arquetipo 6):** ¿tiene unidades en la banda peso+clase? No → score
  neutral fijo (50), fin.
- **Paso 0.5 (amortiguador de confianza, no es arquetipo propio):** cuántas unidades tiene
  en total en la banda. Pocas unidades → el score final se amortigua hacia 50; muchas
  unidades → se confía en el score calculado tal cual. Se aplica al final, no decide solo.
  *(Falta definir el mínimo de unidades exacto.)*
- **Paso 1 (Arquetipo 5 — ¿ya es cliente nuestro?):** binario (tiene o no unidades de la
  marca evaluada) + recencia (misma rampa que Urgencia). Si sí y reciente → score muy alto.
- **Paso 2 (Arquetipo 1 — monomarca de un competidor puntual):** Métrica A = % de
  concentración en su marca más comprada, ponderado por recencia. Si domina fuerte una
  marca específica que no es la nuestra → score bajo. Dato de referencia (histórico
  nacional, clientes con 3+ unidades): 16.4% tiene 100% de su flota en una marca, pero solo
  0.6% cae en 90-99% — la concentración es bimodal, casi nadie queda "casi puro". *(Falta
  definir el umbral exacto: 100% vs ≥70-80%.)*
- **Paso 3 (Arquetipo 3 — pivote):** detección de secuencia cronológica — compró del bloque
  no-compatible con la marca evaluada, y TODO lo posterior (hasta hoy) es del bloque
  compatible. Medición: sí/no + magnitud (cantidad de compras que confirman la vuelta +
  qué tan reciente fue el pivote). El par de bloques relevante cambia según marca+clase (ver
  tabla de bloques abajo). *(Falta definir si hace falta la versión espejo: pivote EN
  CONTRA, del bloque compatible hacia uno no-compatible, como señal negativa.)*
- **Paso 4 (Arquetipos 2 y 4, Métrica B — bloque de origen):** si nada de lo anterior se
  activó, se usa la distribución por bloque de origen (columna `ORIGEN SUGERIDO` del Excel,
  ya validada: EUROPEO/CHINO/AMERICANO/JAPONES/COREANO/OTRO, 100% consistente salvo 1 marca
  de bajo volumen) de las compras del cliente en la banda, comparada contra el bloque de la
  marca evaluada. Cubre tanto "domina un bloque" (Arquetipo 2, ej. 80% Chino) como "mezcla
  pareja sin dominancia" (Arquetipo 4, salta de marca sin patrón).

**Umbrales y fórmulas finales (todos cerrados):**

- **Amortiguador de confianza (Paso 0.5):** `confianza = min(1, (unidades−1)/(4−1))`;
  `score_final = 50 + confianza × (score_calculado − 50)`. Con 1 unidad el resultado queda
  en 50 (neutral puro, se ignora el patrón calculado); con 4+ unidades se usa el score
  calculado tal cual, sin amortiguar. Corazonada del usuario, sin justificación estadística
  formal pero con sentido de negocio: 1 unidad "perturba todo", 4 unidades ya es un cliente
  que "persiste" en el sector.
- **Umbral de dominancia (Pasos 2 y 4): 80% fijo**, tanto para monomarca de una marca
  puntual como para dominancia de un bloque de origen. Se autorregula solo por el tamaño de
  flota sin necesidad de fórmula variable: con 3 unidades, 2/3 (66.7%) no alcanza — hacen
  falta las 3 iguales; con 4 unidades, 3/4 (75%) tampoco alcanza; recién con 5 unidades, 4/5
  (80%) sí califica dejando 1 unidad distinta. Cuantas menos unidades, más pureza exige el
  mismo número fijo.
- **Anclajes de score por paso:** Paso 1 (ya es cliente, reciente) = **95**. Paso 3 pivote
  positivo = **85**. Paso 3 pivote espejo (negativo) = **30** (no simétrico a propósito —
  un pivote hacia el bloque no-compatible es más reciente y menos definitivo que uno que
  vuelve, así que castiga menos que la monomarca). Paso 2 monomarca de un competidor = **10**.
  Paso 4 (bloque de origen) = **% directo** de su historial ponderado que cae en el bloque
  compatible (0-100, sin curva adicional — el propio porcentaje es el score).
- **Pivote con magnitud:** mismo mecanismo que el amortiguador general pero con su propio
  contador — `confianza_pivote = min(1, (compras_que_confirman−1)/(3−1))`, aplicado sobre el
  anclaje 85 o 30 según la dirección. Mínimo real para confianza plena: 1 compra del bloque
  no-compatible (el quiebre) + 3 compras del bloque compatible después = 4 compras en total
  como piso (no hace falta nada antes del quiebre).
- **Compatible vs. no-compatible (simplificación final):** el pivote y el bloque de origen
  ya NO distinguen "rival" de "ruido" — cualquier compra que no sea del bloque propio de la
  marca evaluada cuenta como "no-compatible", sin importar cuál sea (Chino, Japonés,
  Coreano, Americano, Otro). Se aplica igual en las 6 marcas, sin necesidad de definir un
  rival específico por marca+clase.

**Ponderación núcleo vs. tolerancia (cerrado): núcleo = 100%, decae lineal hasta 30% en el
borde extremo de la tolerancia.**

```
peso_unidad = 100% − (distancia_al_núcleo / ancho_de_la_zona_de_tolerancia) × 70%
```

Para Pasos 1-4 (Eje 2), las compras dentro del núcleo pesan 100%; las que caen solo en la
zona de tolerancia pesan menos según esta fórmula. Distinto de Eje 0, que sí usa la banda
completa sin descuento — esa distinción existe porque, comprobado con datos reales
(`ORIGEN SUGERIDO` × `PESO BRUTO` en `operaciones`, base nacional completa), mezclar
núcleo+tolerancia sin ponderar distorsiona la lectura de bloque de origen — especialmente en
UD y VW, donde los extremos de la tolerancia representan mercados casi opuestos:

- **MAN/Dongfeng/FAW** (núcleo 41,000-50,000 kg, 16,548 unid.): Europeo 60.1% / Chino 39.4%.
  Banda completa (30,750-62,500, 28,760 unid.): Europeo 59.3% / Chino 36.2% — poca
  distorsión. Pero la punta extra-superior sola (50,000-62,500, solo 943 unid.) **invierte**
  la proporción: Chino 67.7% / Europeo 31.6% — nicho de volquetes mineros chinos extra
  pesados (ej. XCMG).
- **International-Camión** (22,500-37,500 kg, 49,176 unid.): Europeo 58.9%, Japonés 21.8%,
  Chino 9.7%, Americano 8.1%, Coreano 1.2%.
- **UD** (núcleo 11,700-18,500, 31,879 unid.): Japonés 40.0% / Europeo 26.0% / Chino 18.9%.
  Extra inferior (8,775-11,700, 23,729 unid.): Europeo cae a 7.9%. Extra superior
  (18,500-23,125, 4,419 unid.): Europeo sube a 33.4%.
- **Volkswagen** (núcleo 6,000-31,000, 161,675 unid.): Japonés 43.7% / Europeo 21.7% / Chino
  16.7% / Coreano 11.8%. Extra inferior (4,500-6,000, 12,040 unid.): Europeo casi
  desaparece (0.4%). Extra superior (31,000-38,750, 10,379 unid.): Europeo pasa a mayoría
  absoluta (65.8%).
- **Tractocamión** (todas las marcas, sin banda de peso, 63,303 unid. a nivel nacional):
  Americano 46.6% (Volvo, International, Freightliner, Kenworth, Mack) / Europeo 44.2%
  (Volvo, Scania, Mercedes, Iveco, DAF) / Chino 8.7%.

Tabla de bloques propios por marca+clase (ya no hace falta columna de "rival" — todo lo que
no sea el bloque propio cuenta como no-compatible, sin distinción):

| Marca | Clase | Bloque compatible |
|---|---|---|
| MAN | Camión | Europeo |
| Dongfeng / FAW | Camión | Chino |
| International | Camión | Americano |
| Volkswagen | Camión | Europeo |
| UD | Camión | Japonés |
| MAN / Dongfeng / FAW / International | Tractocamión | Europeo / Chino / Chino / Americano respectivamente |

**UD y Volkswagen no tienen catálogo de Tractocamión** (confirmado en `Bandas_por_modelo`,
solo tienen modelos Camión) — el eje Tracto no aplica para esas 2 marcas.

### Tamaño de cuenta (etiqueta separada, NO se mezcla en el score)

Se muestra aparte del score numérico, junto a Urgencia/Afinidad, para que el asesor decida
con criterio (lógica: Probabilidad × Tamaño = Valor esperado, sin automatizar la decisión).
Basado en el **total de la flota completa del cliente** (todas las marcas, todas las clases
— no solo las unidades que caen dentro del filtro marca+clase actual), porque mide poder de
negociación y sofisticación como empresa, no tamaño de oportunidad puntual de un producto.

Sigue la segmentación oficial de la empresa (Retail 1-5, Medium Fleet 6-29, Big Fleet 30+),
con un 4to nivel nuevo agregado tras validar con datos que el "Big Fleet 30+" original
escondía outliers enormes. Apodo interno de la sesión: "Fleet" → "Fish" (aprobado por el
usuario en joda, puede que no sobreviva la revisión del jefe):

| Categoría | Rango | Clientes TCP Sur | Clientes Perú (nacional) |
|---|---|---|---|
| Retail | 1-5 unidades | 24,609 (96.59%) | 130,368 (95.56%) |
| Medium Fish | 6-29 unidades | 810 (3.18%) | 5,580 (4.09%) |
| Big Fish | 30-99 unidades | 52 (0.20%) | 388 (0.28%) |
| Mega Fish | 100+ unidades | 8 (0.03%) | 89 (0.07%) |

Validado también a nivel nacional antes de cerrar (el usuario pidió confirmar que aplicara a
todo el universo de clientes de Perú, no solo al sur) — los porcentajes se sostienen casi
idénticos, y el techo nacional es mucho más alto: Transportes 77 S.A. (Lima) tiene **851
unidades**, más del doble que el mayor cliente del sur (Arequipa Expreso Marvisur, 389).
Top Mega Fish nacional: Transportes 77 S.A. (851), Unión de Concreteras (745),
Racionalización Empresarial (662), Construcción y Administración (625), Transportes Rodrigo
Carranza — La Libertad (456), Zeta Gas Andino — Callao (397), Arequipa Expreso Marvisur
(389), Shalom Empresarial (387).

### Ficha del cliente en el Perfilador (auditabilidad del score)

Al hacer click en un cliente dentro de la lista de resultados, además del score se despliega
el **detalle de las unidades que efectivamente calzaron el filtro** (año, marca, cantidad) —
así el asesor puede corroborar por qué salió ese puntaje, mismo patrón visual que ya existe
hoy en la ficha del Directorio (árbol Clase → Año → Marca + banda de peso).

### Flujo completo del Perfilador (UI)

**Filtros obligatorios (selección única, no se pueden combinar):** Marca (MAN / Dongfeng /
FAW / International / UD / Volkswagen) + Clase (Camión o Tractocamión — Tracto no aparece
como opción para UD/VW). No se pueden multi-seleccionar porque cada combinación tiene su
propia banda de peso, bloque compatible y hasta disponibilidad de catálogo — mezclar dos
marcas o dos clases rompería el cálculo.

**Filtros opcionales (acotan la lista, no tocan el score):** Ubicación geográfica
(Departamento/Provincia/Distrito) y Sector Económico + CIIU (dependiente del sector).

**Resultados:** lista scrolleable (como ya funciona hoy), cada cliente con Razón Social,
RUC, **Score final** (Urgencia × Afinidad, escalado — no promedio, para castigar fuerte
cuando cualquiera de los dos ejes es muy bajo), Urgencia, Afinidad, y Tamaño de cuenta
(Retail/Medium Fish/Big Fish/Mega Fish). Orden por defecto: Score final descendente. El
asesor puede reordenar por **solo Afinidad** (ver quién compraría aunque no sea urgente, útil
para planificar visitas de nutrición a futuro) o **solo Urgencia** (ver quién necesita
comprar ya aunque no sea tan afín, para intentarlo igual).

### Estado: implementado en `perfilador.html`, sin código de servidor (todo corre en el navegador)

**Qué se hizo al implementar:**
- `data/perfilador/*.json` regenerado con el campo `origen` por unidad (columna `ORIGEN
  SUGERIDO`, ya la traía `operaciones`) sumado a lo que ya tenían.
- Filtros viejos del Perfilador (chips de Clase multi-selección + slider manual de peso)
  **reemplazados por completo** por el flujo obligatorio Marca + Clase de selección única —
  la banda de peso y el bloque compatible ahora los decide la marca elegida, no tiene sentido
  que el usuario la mueva a mano. Los filtros de ubicación y Sector/CIIU se mantuvieron
  igual, como opcionales.
- Config `BANDAS` en JS con núcleo/tolerancia/bloque por marca+clase, tal cual la tabla del
  Eje 0 de este documento (usa la marca `'UD TRUCKS'` como clave — así aparece en la columna
  `MARCA ESTANDAR` de `operaciones`, aunque la etiqueta visible en el filtro sigue siendo
  "UD").
- Motor de scoring (Eje 0 elegibilidad, Eje 1 urgencia, Eje 2 afinidad con la cascada de 4
  pasos + amortiguador de confianza) corre 100% en el navegador sobre los shards ya
  cargados, sin llamadas a servidor.
- Resultados: Score final (Urgencia × Afinidad / 100) como orden por defecto, con botones
  para reordenar por solo Urgencia o solo Afinidad. Tamaño de cuenta (Retail/Medium Fish/
  Big Fish/Mega Fish) como etiqueta aparte, sin mezclarse en el score. Ficha desplegable por
  cliente con el detalle de las unidades que calzaron el filtro (año, marca, origen, peso) —
  mismo patrón de auditabilidad que ya existía en el Directorio.

**Una decisión tomada durante la implementación que no había quedado 100% cerrada en el
diseño:** el Paso 1 (¿ya es cliente nuestro?) del Eje 2 necesitaba una fórmula exacta de cómo
la recencia modula el score de 95, y el diseño solo decía "misma rampa que Urgencia" sin más
detalle de la dirección. Se implementó como rampa lineal **inversa** a Urgencia (compra
reciente de nuestra marca = score alto, cerca de 95; compra vieja = decae hacia 50 en 5 años,
nunca por debajo de 50) — tiene sentido de negocio (un cliente antiguo nuestro nunca debería
puntuar peor que uno neutral) pero vale la pena que el usuario lo revise con casos reales
antes de confiar el 100% en el orden que arroja.

**Validado con datos reales antes del push:** sintaxis JS ok, motor corrido contra 5
escenarios sintéticos (ya-cliente reciente, monomarca de competidor, pivote positivo,
1-unidad-amortiguada, pivote-espejo-tapado-por-Paso1) con resultados esperados, y corrida
completa contra el shard real de Arequipa (9,064 clientes → 850 elegibles para MAN/Camión,
distribución de scores de 0 a 100 con mediana 40).

---

## 7. Notas técnicas para continuar el proyecto

- El código fuente vive **solo en GitHub** (no hay carpeta local persistente del repo);
  para seguir trabajando hay que clonar `https://github.com/Puchulungo/cidatt-tcp-sur`.
- Cualquier push a `main` redespliega automático en Vercel (~1-2 min).
- Si se necesita tocar la autenticación, la configuración de Azure AD está en el portal
  bajo "App registrations" → `CIDATT-TCP-Sur`.
- Si se actualiza la matriz de datos (nuevo Excel), hay que volver a correr el proceso de
  generación de `data/perfilador/*.json` (agrupar por RUC, aplicar fix de codificación,
  marcar atípicos, shardear por departamento) y volver a commitear/pushear esos archivos.

---

## 8. Changelog (commits en orden cronológico)

1. `917783c` — Login corporativo con Microsoft (MSAL) como puerta de acceso al sitio.
2. `4667553` — Pestaña Perfilador: filtros por departamento/provincia/clase/peso con
   desglose por año y marca.
3. `39e1cae` — Landing con logo y 3 accesos; ficha del directorio con
   departamento/provincia y árbol clase→categoría de peso→año→marca.
4. `8859b0d` — Mostrar rango de peso (t) junto a cada categoría en la ficha del
   directorio.
5. `412d7c3` — Al abrir una categoría de peso, desplegar automáticamente todos los años
   sin click adicional.
6. `d560968` — Cambio de columna `MARCA` a `MARCA ESTANDAR` (menos duplicados/variantes),
   regenerando todo `data/perfilador/`.
7. `729b524` — Ficha del directorio aplanada: Clase → Año → Marca + banda de peso, todo
   visible sin clicks adicionales (reemplaza el nivel de "categoría de peso" como pestaña).
8. `e74994e` — Enriquecer Directorio y Perfilador con datos SUNAT de la pestaña `Hoja1`:
   Estado, Antigüedad, Tipo de Contribuyente, Sector Económico, CIIU, Distrito y Nombre
   Comercial en la ficha; filtros de Sector Económico, CIIU (dependiente del sector) y
   Distrito en el Perfilador; Estado=ACTIVO obligatorio en resultados del Perfilador;
   `clientes_v2.json` regenerado desde `operaciones` + `Hoja1` (136,425 clientes, cruce 100%
   tras corregir prefijo `XX` mal cargado en 380 RUCs).
