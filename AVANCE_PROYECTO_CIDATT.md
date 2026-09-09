# CIDATT TCP Sur — Registro de avance

**Repo:** https://github.com/Puchulungo/cidatt-tcp-sur
**Producción:** https://cidatt-tcp-sur.vercel.app/
**Última actualización de este documento:** 2026-09-09 — se sumó la **sección 15**, el
rediseño mayor: base de datos nueva del sitio, bandas de peso v2, ficha con modelo y
carrocería, y el Perfilador reordenado por niveles. **La sección 15 manda sobre las
secciones 6, 12 y 13 donde se contradigan** — todo el diseño está cerrado con el usuario
pero NADA está implementado todavía. La sección 14 (seguridad) sigue en curso sin cerrar.

---

## Estado actual (leer esto primero al retomar)

> **Nota del 2026-09-09 — leer la sección 15 antes que este bloque.** Ese día se cerró un
> rediseño completo (bandas de peso, ficha del Directorio, Perfilador por niveles) que deja
> resueltos **en diseño** los pendientes 1, 2 y 3 de la lista de abajo, y cambia la base de
> datos del sitio. Nada de eso está implementado todavía: el código en producción sigue siendo
> el del checkpoint del 2026-08-11 que describe este bloque.


**Checkpoint de cierre de sesión — 2026-08-11 noche.** Sesión larga enfocada casi 100% en
rediseñar Afinidad (Pasos 1, 2, 3 y 4), la banda de UD, y tres mejoras de UI (placas en
Perfilador, placas+segmentación en Directorio). Todo pusheado a `main` (repo
`Puchulungo/cidatt-tcp-sur`) en 5 commits (`8655e34`, `96f1467`, `695bed1`, y el último par
`3163228`) y debería estar ya en producción vía redeploy automático de Vercel. **No hay
ninguna tarea de código en curso ni a medias.** Además se creó
`DISEÑO_SEGUIMIENTO_ASESORES.md` (carpeta del proyecto) — documento aparte, autocontenido,
para retomar en un chat nuevo el tema de integrar seguimiento real de asesores (SIMA +
Drive de carterización) al sistema. Detalle completo del rediseño de Afinidad de hoy en las
secciones 12 y 13. Lo único realmente abierto ahora:

1. **Afinidad Paso 1 — problema de volumen ("caso Concretos Supermix/Transaltisa"):**
   sigue sin resolver, **no se tocó en esta sesión** (el usuario dijo explícitamente "esto
   lo vemos después con calma" al arrancar). El Paso 1 (¿ya es cliente de la marca?) sigue
   sin dar crédito por volumen, solo por recencia (ver sección 13 para el cambio que sí se
   hizo hoy en la ventana de recencia). Ver sección 11 para el detalle del fix de piso 60.
2. **Paso 1 vs. Paso 4 — inversión residual para compras muy viejas (5+ años):** hoy
   (sección 13) se estiró la ventana de recencia del Paso 1 de 5 a 6 años para que un
   dueño real de la marca no puntúe peor que un desconocido con flota "cercana" — pero
   solo funciona bien hasta ~4-4.5 años de antigüedad de la última compra. A partir de ahí
   el piso del Paso 1 (60) vuelve a quedar por debajo del escalón "resto" (70) del Paso 4
   ya descontado. El usuario decidió no tocar el escalón 70 (le gusta tal cual), así que
   esta inversión para compras muy antiguas queda como limitación conocida, sin resolver.
3. **Pivote (Paso 3) — posible redundancia con el descuento por concentración de marca:**
   desde el rediseño de ayer/hoy (sección 12), el pivote y el paso de bloque/concentración
   comparten parcialmente la misma señal (`distanciaOrigen` + mismo descuento). Pregunta de
   diseño abierta: ¿todavía aporta el pivote algo que el resto de la cascada no capture ya?
4. **MAN tiene Afinidad promedio baja (11.6) en compradores reales del backtest** — es de
   antes de todos los cambios de hoy. Valdría la pena correr de nuevo el backtest de las
   293 ventas con la fórmula actual para ver si cambia (Paso 4 ya no da 0% en seco).
5. **Backtest de un solo período**, más 7 casos reales puntuales de hoy (Grupo TTN,
   Piscocalla, Pilars, Ausanta, Olimpus, Transportes Zuñiga, Servosa Gas) — no hay un
   backtest formal de las 293 ventas con la fórmula nueva completa. El usuario va a
   conseguir históricos de CIDATT de años anteriores — tarea del usuario, no de código.
6. **Consulta MTC de flota por RUC:** sigue igual que el 08-08, no se retomó.
7. **Hagemsa / Transaltisa / Barcino:** deben seguir apareciendo normal en Directorio y
   Perfilador (decisión ya cerrada, no excluir — las gestiona Lima pero el usuario quiere
   que sigan visibles).
8. **Seguimiento de asesores (SIMA + Drive de carterización):** conversación de diseño
   completa, sin código — ver `DISEÑO_SEGUIMIENTO_ASESORES.md` para todo el contexto y
   los próximos pasos concretos (sección 9 de ese documento). El jefe del usuario no
   quiere un CRM formal todavía; cualquier propuesta debe apoyarse en lo que ya existe.
9. Carterización como feature del sitio (botón "CARTERAS TCP"), unificar visualmente
   Directorio+Perfilador: ideas a futuro, nunca se empezaron a construir.
10. `clientes_v2.json` pesa ~91MB, por encima del límite recomendado de GitHub (nota
    técnica en sección 4, no bloquea nada hoy).
11. **Restringir el acceso a CIDATT más allá del login básico de Microsoft — investigación
    en curso, sin aplicar todavía en Azure (ver sección 14).** Disparado por un incidente
    real (alguien externo pidiendo acceso repetidas veces a un Excel de Google Drive de
    carteras de asesores — ese archivo en sí está bien protegido, cero fuga real ahí, pero
    expuso que el login de CIDATT hoy acepta a cualquier persona con correo del tenant de
    EUROMOTORS, sin distinguir quién específicamente debería entrar). Plan acordado con el
    usuario: (a) restringir la app en Azure AD a una lista explícita de usuarios/grupo
    asignado, y (b) exigir además que la conexión venga desde la red de la empresa (oficina
    o VPN FortiClient), vía Conditional Access. Ya se recolectó la IP pública compartida por
    las 4 sedes (190.116.0.98) — falta confirmar si es fija, confirmar la IP real de salida
    del VPN (dato dudoso, puede haber salido por split-tunnel), y confirmar la licencia de
    Microsoft 365 (Conditional Access requiere Azure AD Premium P1). Nada de esto se ha
    tocado aún en el portal de Azure — es solo investigación/plan hasta ahora.

**Documentos de referencia en esta misma carpeta:**
- `BACKTEST_SCORING_2026.md` — metodología y resultados completos del backtest contra
  ventas reales 2026 (secciones 1-6, incluye todo el detalle de Recurrencia y Afinidad
  Paso 1).
- `COMO_FUNCIONA_EL_SISTEMA.md` — explicación técnica completa del sistema (arquitectura,
  seguridad, fórmulas de scoring), pensada para que el usuario la use al explicarle el
  sistema a terceros (ej. su jefe).

Si el usuario dice que algo de este documento ya está resuelto y el texto dice lo
contrario, confiar en lo que dice el usuario y corregir el documento — no al revés.

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
- Versión original (2026-08, primera etapa): filtros por Departamento/Provincia/Clase/Peso
  bruto (slider manual), resultados con cantidad de unidades que matchean.
- **Esta versión quedó reemplazada por completo** al implementar el motor de scoring — ver
  sección 6 para el diseño y la versión actual de los filtros y resultados (Marca+Clase
  obligatorios, Score/Urgencia/Afinidad, Tamaño de cuenta, ficha auditable).

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
ejes independientes + 1 etiqueta aparte. Diseñado a fondo con el usuario y **ya implementado
y en producción** (ver estado al final de esta sección).

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
  Umbral cerrado, ver fórmula abajo.
- **Paso 1 (Arquetipo 5 — ¿ya es cliente nuestro?):** binario (tiene o no unidades de la
  marca evaluada) + recencia (misma rampa que Urgencia, invertida). Si sí y reciente →
  score muy alto.
- **Paso 2 (Arquetipo 1 — monomarca de un competidor puntual):** Métrica A = % de
  concentración en su marca más comprada, ponderado por recencia. Si domina fuerte una
  marca específica que no es la nuestra → score bajo. Dato de referencia (histórico
  nacional, clientes con 3+ unidades): 16.4% tiene 100% de su flota en una marca, pero solo
  0.6% cae en 90-99% — la concentración es bimodal, casi nadie queda "casi puro". Umbral
  cerrado en 80%, ver fórmula abajo.
- **Paso 3 (Arquetipo 3 — pivote):** detección de secuencia cronológica — compró del bloque
  no-compatible con la marca evaluada, y TODO lo posterior (hasta hoy) es del bloque
  compatible. Medición: sí/no + magnitud (cantidad de compras que confirman la vuelta +
  qué tan reciente fue el pivote). El par de bloques relevante cambia según marca+clase (ver
  tabla de bloques abajo). Sí se implementó la versión espejo (pivote EN CONTRA, señal
  negativa) — ver fórmula abajo.
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
9. `4bb28ce` — Motor de scoring del Perfilador: filtros Marca+Clase obligatorios
   (reemplazan Clase multi-selección + slider de peso), Eje 0 (elegibilidad por banda de
   peso), Eje 1 (Urgencia), Eje 2 (Afinidad — cascada de 4 pasos + amortiguador de
   confianza), Score final = Urgencia×Afinidad con reordenamiento por eje individual,
   Tamaño de cuenta (Retail/Medium Fish/Big Fish/Mega Fish) y ficha auditable por cliente.
   Detalle completo del diseño y de la implementación en la sección 6.
10. `c455cdc` — Fix de geo: 380 clientes con RUC ex-`XX` recuperan su Departamento/Provincia
    real (eliminado el bucket "SIN DATO" singular, separado del "SIN DATOS" genérico). Detalle
    en sección 9.
11. `30dc394` — Score por marca (Score final/Recurrencia/Afinidad) agregado a la ficha del
    Directorio, para las 6 marcas, calculado al vuelo con el mismo motor que el Perfilador.
    Detalle en sección 9.
12. `d81a9b1` — Eje 1 rediseñado de "Urgencia" (antigüedad) a "Recurrencia" (Frecuencia 85% +
    Recencia 15%); Afinidad Paso 1 corregido (sin amortiguador, piso 60 en vez de 50). Detalle
    en secciones 10 y 11.
13. `649462f` — Solo documentación (backfill del fix de Afinidad Paso 1 en este archivo).
14. `8655e34` — Afinidad Paso 2 rediseñado: descuento continuo por concentración de marca
    dominante, reemplaza el corte binario 80%→10 (también aplicado sobre el resultado del
    pivote). Detalle en sección 12.
15. `96f1467` — Tabla `DISTANCIA_ORIGEN` por bloque de origen (reemplaza el binario
    compatible/no-compatible en Pasos 3 y 4); placa visible en el detalle de unidades del
    Perfilador; badge de segmentación (Retail/Medium/Big/Mega Fish) en la ficha del
    Directorio. Detalle en sección 12.
16. `695bed1` — Grilla de placas desplegable por fila de flota en el Directorio (5 columnas
    en desktop, auto-ajustable en pantalla chica). Detalle en sección 12.
17. `3163228` — Afinidad Paso 1: ventana de recencia de 5 a 6 años (fix parcial de la
    inversión Paso1/Paso4 detectada con el caso Volkswagen). Banda de UD Trucks ampliada
    con el Quester (núcleo 11.7-34t). Detalle en sección 13.

---

## 9. Fix de geo (380 clientes) y Score por marca en el Directorio (agosto 2026)

### Fix de geo: los 380 clientes "SIN DATO" (antes RUC con prefijo XX)

El commit `e74994e` (sección 4) había limpiado el prefijo `XX` del RUC de 380 clientes
para que el cruce con SUNAT diera 100%, pero dejó su Departamento/Provincia como
`"SIN DATO"` (singular) en vez de usar el valor real — un bucket separado del genérico
`"SIN DATOS"` (plural, ~26,344 clientes sin ubicación real). El Perfilador mostraba
entonces dos departamentos casi idénticos en el filtro, algo que el usuario notó.

Causa encontrada: esos 380 clientes sí tienen distrito real (148 distritos distintos)
y el Excel `Hoja1` sí trae su Departamento/Provincia real por RUC — el script de cruce
original no lo usó para ese grupo. Se recuperó el dato real de `Hoja1` por RUC y se
reasignó cada uno de los 380 a su departamento correcto (177 Lima, 33 Arequipa, 21
Cusco, 16 La Libertad, 16 Piura, etc.; solo 3 de los 380 no tienen dato en ningún lado
y quedaron en `"SIN DATOS"` genérico). El bucket `"SIN DATO"` (singular) desapareció
por completo.

Archivos actualizados: `clientes_v2.json` (campos `ciudad`/`provincia`) y los shards de
`data/perfilador/` (se eliminó `sin_dato.json`, sus 380 registros se repartieron entre
los shards correctos, y `_index.json` se regeneró con los conteos/provincias/distritos
correctos). Verificado antes de pushear: 136,425 clientes totales, sin duplicados ni
pérdidas. Commit `c455cdc`.

### Score por marca en la ficha del Directorio

Objetivo: que la ficha de cada cliente en el Directorio muestre el mismo score que
calcula el Perfilador (Score final / Urgencia / Afinidad), para las 6 marcas y las
clases aplicables, sin tener que ir al Perfilador a buscarlo. El motor de cálculo es
exactamente el mismo que `perfilador.html` (Eje 0 elegibilidad, Eje 1 urgencia, Eje 2
afinidad con cascada de 4 pasos) — se ejecuta al vuelo en el navegador sobre los datos
ya enriquecidos del cliente (`data/perfilador/*.json`, cargados igual que para la ficha
de flota existente), sin llamadas a servidor ni datos precalculados/guardados. No hay
score "guardado" en ningún JSON, se recalcula cada vez que se abre la ficha.

**Diseño (definido junto con el usuario antes de implementar, iterando con mockups):**
en la parte derecha de la ficha (junto al árbol de flota), una grilla de 6 botones, uno
por marca, sin color (neutros hasta que el asesor hace click — se descartó un punto de
color de preview por decisión explícita del usuario). Al abrir un botón, se despliega
una tabla con filas Camión/Tracto y columnas Score final/Urgencia/Afinidad, más el
motivo de auditoría de la Afinidad (mismo texto que ya usa el Perfilador internamente,
ej. "Ya compró MAN hace 1 año", "62% de su flota es Europeo"). Para UD y Volkswagen, la
fila Tracto no aparece (no tienen catálogo en esa clase — igual que en el Perfilador).
Si el cliente no tiene unidades elegibles en la banda de esa marca+clase, la fila
muestra "Sin unidades en esta banda" en vez de inventar un score. Si el cliente no está
enriquecido con datos del Perfilador (no aparece en `data/perfilador/`), la sección
completa muestra "No hay datos suficientes para calcular el score de este cliente".

Implementado en `directorio.html`: CSS nuevo (`.ficha-columns`, `.score-section`,
`.score-grid`, `.score-brand-btn`, `.score-panel`, `.score-table`), motor de scoring
copiado 1:1 de `perfilador.html` (mismas fórmulas y constantes `BANDAS`/`MARCA_LABELS`,
renombradas con sufijo `_SCORE`/`_SCORE` para no chocar con nada existente en el
archivo), y la función `seleccionar(ruc)` ahora calcula `scoreHtml` y lo agrega junto
al árbol de flota dentro de un contenedor `.ficha-columns` (flota a la izquierda, score
a la derecha; se apilan verticalmente en pantallas angostas). Probado con Node antes de
pushear, corriendo el motor contra un cliente real del shard de Arequipa (27 vehículos)
— resultados coherentes con la lógica ya validada del Perfilador (mismo Eje 0/1/2, sin
diferencias). Commit `30dc394`.

**Pendiente:** el usuario todavía no lo vio funcionando en producción (Vercel debería
haber redesplegado ambos commits en 1-2 min desde el push) — falta la validación visual
final antes de darlo por cerrado.

---

## 10. Eje 1 del scoring: de "Urgencia" a "Recurrencia" (2026-08-08)

Se hizo un backtest completo contra las ventas reales de 2026 (`INCAPESA - Venta VN.xlsx`,
293 ventas) para medir qué tan bien predecía el motor de scoring del Perfilador. Resultado
completo, metodología y todas las variantes probadas en `BACKTEST_SCORING_2026.md`.

**Hallazgo central:** el eje de Urgencia original medía antigüedad (hace cuánto no compra en
esa banda) y funcionaba al revés de lo esperado — los compradores reales tenían Urgencia por
debajo del promedio de su segmento, no por encima. Un cliente con una sola unidad de 1988 y
nunca más marcaba Urgencia=100 (el "más urgente" del país); un cliente que compra todos los
años marcaba solo 20. Se reemplazó por **Recurrencia = Frecuencia histórica de compra en esa
banda (85%) + Recencia de la última compra (15%)** — un cliente con varias unidades compradas
a lo largo del tiempo en ese segmento es mejor prospecto que uno con una sola compra vieja,
sin importar hace cuánto fue esa única compra.

Validado con backtest (delta contra el promedio nacional del segmento pasó de -22.5 a +48.9,
83% de los compradores reales por encima del promedio) y validación cruzada (dividiendo la
muestra en dos mitades al azar, ambas mitades sostienen el mismo patrón). Implementado en
`perfilador.html` y `directorio.html` (funciones `calcularFrecuencia`/`calcularRecencia`
nuevas; `calcularUrgencia` ahora calcula la mezcla en vez de la rampa de antigüedad; UI
actualizada de "Urgencia" a "Recurrencia").

**No se tocó el eje de Afinidad** — quedó pendiente a pedido explícito del usuario. El
backtest encontró dos grietas ahí (el amortiguador no distingue consistencia con pocas
unidades — caso real "Transportes Corval"; la multiplicación anula el Score cuando Afinidad
es 0 aunque el resto de las señales sean fuertes — caso real "Dimarza") que se revisarán con
el equipo de la oficina más adelante, no en esta sesión.

**Pendiente:** todo el backtest se corrió sobre un solo período (ene-ago 2026). El usuario va
a pedir los históricos de CIDATT de años anteriores para poder validar la fórmula contra un
período de ventas distinto al que se usó para diseñarla.

---

## 11. Afinidad — Paso 1 corregido (2026-08-08)

Revisando el Perfilador con casos reales (asesor de MAN en Apurímac), se detectó que clientes
con evidencia directa de haber comprado la marca evaluada (aunque sea 1 sola unidad) mostraban
Afinidad neutral (50) en vez de un score alto. Dos causas: el amortiguador de confianza
diluía la señal con solo 1 unidad en la banda (sin importar si esa unidad era de la marca
evaluada u otra), y el piso de 50 aplastaba a neutral cualquier compra de la marca de hace más
de 5 años. Se corrigió: el Paso 1 (¿ya es cliente?) ya no pasa por el amortiguador —es un
hecho directo, no una inferencia estadística— y su piso subió de 50 a 60. Validado contra el
mismo backtest de 153 ventas reales (delta de Afinidad +7.6 a +10.3 según el piso probado, se
eligió 60 como mejor balance). Detalle completo, fórmulas y casos de validación en
`BACKTEST_SCORING_2026.md`, sección 6. Commit `d81a9b1`.

No se tocó nada más del eje de Afinidad — el problema de clientes grandes con muchas unidades
viejas de la marca (donde la recencia sigue siendo la única variable del Paso 1, sin crédito
por volumen) queda identificado pero pendiente.

---

## 12. Afinidad — rediseño de Pasos 2, 3 y 4 (2026-08-11)

Sesión distinta a la del 08-08: el usuario trajo 7 casos reales (revisando el Perfilador con
MAN filtrado en Camión Volquete) donde el score de Afinidad no calzaba con lo que él veía a
ojo en la flota real del cliente. Dos problemas de fondo, ambos con causa raíz en cómo el
sistema definía "bloque de origen".

### Problema 1 — el Paso 2 (monomarca) dejaba pasar duopolios y tenía un corte abrupto

Casos reales: **Grupo TTN** (67% Volvo + 33% Mercedes, ninguna unidad MAN, Afinidad 100),
**Piscocalla** (78.5% Mercedes ponderado, justo debajo del umbral, Afinidad 100), **Pilars**
(71% Mercedes, Afinidad 100), **Olimpus** (72.5% Mercedes + Scania, Afinidad 98.1),
**Transportes Zuñiga** (72-89% Volvo con una excepción vieja, Afinidad 98.1 vía un pivote
"positivo" que en realidad escondía monomarca). El Paso 2 viejo solo miraba si **una sola
marca** llegaba a 80% del peso ponderado — como estos casos reparten entre 2 marcas rivales
(nunca la evaluada), ninguno cruzaba el 80%, así que caían al Paso 4 y se llevaban el score
casi pleno del bloque, sin importar que fueran, en la práctica, fieles a 1-2 competidores
puntuales. **Ausanta** (51% Volvo / 49% Scania, historial Volvo→Scania→Volvo) sí merecía
quedar arriba de los demás — el usuario lo marcó explícitamente como "afín, pero no 100".

**Fix (commit `8655e34`):** se eliminó el corte binario del Paso 2. Ahora se calcula la
concentración ponderada de la marca dominante que no es la evaluada, y se aplica como
descuento continuo — tanto sobre el resultado de Paso 4 (bloque) como sobre el de Paso 3
(pivote), porque el pivote puede esconder el mismo problema (caso Zuñiga).

```
factorConcentracion = clamp((pctDominante − 33%) / (90% − 33%), 0, 1)
penalizacion = 1 − factorConcentracion × 0.85
scoreBruto_final = scoreBruto_pivoteOBloque × penalizacion   [solo si pctDominante >= 33%]
```

Anclajes calibrados a mano contra los 7 casos: piso 33% (reparto entre 3+ marcas, sin
penalizar), techo 90% (casi monomarca, penalización casi máxima), floor 0.85 (nunca
descuenta más del 85% — nunca cae a 0 del todo, mismo criterio que el piso 60 del Paso 1).

Resultado validado corriendo el motor real extraído de `perfilador.html` contra los 7 RUCs
(MAN, Camión): **Ausanta 73** (el más alto de los 6 originales, como pedía el usuario),
**Grupo TTN 48.8 → 41.5** (con la tabla de distancia del problema 2, ver abajo), **Pilars
42.8 → 36.4**, **Olimpus 41.1 → 35**, **Piscocalla 32.2 → 27.4**, **Zuñiga 30.3 → 25.8**
(el pivote dejó de dispararse al filtrar por clase Camión real — el Kenworth que lo activaba
es clase Remolcador).

### Problema 2 — "bloque de origen" era binario, y eso rompía clientes con flota de un solo bloque distinto

Caso real que lo expuso: **Servosa Gas S.A.C.** (Mega Fish, flota ~100% marcas chinas —
Shacman, Dongfeng, FAW), evaluado para **UD** (bloque Japonés) daba **Afinidad 0 en seco**
en producción (con el fix del problema 1 ya aplicado) — porque el Paso 4 calculaba "% de la
flota que es exactamente del bloque evaluado" y Servosa tiene 0% Japonés, así que 0 × lo que
sea sigue siendo 0.

El usuario identificó el patrón real subyacente conversando marca por marca: no es geografía,
es **distancia de precio**. Para las marcas premium (MAN, Volkswagen, International, UD) el
bloque propio de la marca es lo más cercano, el resto de bloques "premium" (Europeo,
Americano, Japonés, Coreano, Otro) están a distancia media entre sí, y Chino es la excepción
lejana por el salto de precio. Para las marcas económicas chinas (Dongfeng, FAW) se invierte:
Chino es lo cercano (es su propio bloque) y todo lo demás queda lejos por igual.

**Fix (commit `96f1467`):** tabla `DISTANCIA_ORIGEN` que reemplaza el binario
`origen === banda.bloque ? 100 : 0` tanto en el Paso 3 (etiquetas C/N del pivote, ahora
`distancia >= 70% → 'C'`) como en el Paso 4 (% ponderado ya no es todo-o-nada, cada unidad
aporta su peso según distancia):

| Marca evaluada | Marca propia (Paso 1) | Bloque propio | Resto (Amer./Jap./Cor./Otro) | Chino |
|---|---|---|---|---|
| MAN / Volkswagen | 100 | Europeo: 85 | 70 | 50 |
| International | 100 | Americano: 85 | 70 (incl. Europeo) | 50 |
| UD | 100 | Japonés: 85 | 70 (incl. Europeo) | 50 |
| Dongfeng / FAW | 100 | Chino: 85 | — | 50 (todo lo demás) |

Nunca baja de 50 a propósito — mismo criterio de "nunca aplastar a 0" que el piso 60 del
Paso 1 y el floor 0.85 del descuento de concentración.

Validado: Servosa Gas × UD pasó de **0 a 12** (sigue bajo, con razón — 89% de su flota
elegible en esa banda es Volkswagen, no Japonés — pero ya no es un cero que borra toda la
información). Los 6 casos del problema 1 bajaron proporcionalmente de forma consistente
(85% en vez de 100% por ser "mismo bloque, no marca exacta").

**Pendiente identificado durante la sesión, sin resolver:** con este cambio, el pivote
(Paso 3) y el descuento de concentración ahora comparten parcialmente la misma señal
(`distanciaOrigen`) — vale la pena revisar si el pivote sigue aportando algo único o si
conviene simplificar/fusionar más adelante (ver punto 2 de "Estado actual").

### Mejoras de UI pedidas junto con el rediseño

- **Placa por unidad en el Perfilador** (commit `96f1467`): en el detalle de "unidades que
  calzaron el filtro" de cada cliente, ahora se muestra la placa junto al peso bruto.
  Motivación del usuario: las placas inmatriculadas en Arequipa empiezan con "V", así que a
  simple vista se puede notar si un cliente compra en AQP.
- **Badge de segmentación en el Directorio** (commit `96f1467`): la ficha de cada cliente en
  `directorio.html` ahora muestra el badge Retail/Medium Fish/Big Fish/Mega Fish junto al RUC,
  mismos colores y cortes que ya usaba el Perfilador (CSS `size-tag` copiado 1:1).
- **Grilla de placas desplegable en el Directorio** (commit `695bed1`): cada fila de flota
  (Clase→Año→Marca+banda+cantidad) es clickeable y despliega una grilla de placas (solo la
  placa, sin repetir marca/peso) en 5 columnas fijas en desktop, auto-ajustable
  (`auto-fill`/`minmax`) en pantallas chicas — evita que un cliente con 56+ unidades de la
  misma combinación reviente el layout con una placa por línea. `buildTreeEnriched` pasó de
  guardar solo un conteo por combinación a guardar `{ count, placas: [] }`; de paso se
  corrigieron 2 sumas (`totalClase`, `totalAnio`) que asumían valores numéricos y se rompían
  con la estructura nueva (bug detectado y corregido en el mismo commit, antes de pushear,
  con un cliente sintético de prueba de 65 unidades).
- **Feedback del usuario sobre lo de las placas: "me encanta, sirve un montón montón."**

Los 3 commits de esta sección: `8655e34`, `96f1467`, `695bed1`.

---

## 13. Ventana de recencia del Paso 1 (5→6 años) y banda de UD ampliada con el Quester (2026-08-11)

Dos ajustes chicos, mismo día que la sección 12, después de que el usuario filtró por
Volkswagen en el Perfilador y notó algo raro.

### Paso 1 vs. Paso 4 — un dueño real perdía contra un desconocido

Caso real: **Carrocerias Dueñas** (sí tiene 3 unidades Volkswagen, compradas hace 4 años)
daba Afinidad **67** vía Paso 1. **M.C.M. Ingenieros** (nunca compró VW; su flota elegible
es 60% Hino/Fuso Japonés + 40% Volvo Europeo) daba Afinidad **68.1** vía Paso 4 (76%
ponderado por distancia, descontado por concentración de Hino al 40%) — **un desconocido
le ganaba a un dueño real.**

Causa: el piso del Paso 1 (60, alcanzado a los 5 años con la ventana vieja) quedó por
debajo del escalón "resto" (70, Japonés/Americano/Coreano/Otro) que se introdujo el mismo
día en la sección 12. Cualquier comprador real con más de ~2.3 años desde su última compra
ya podía perder contra un desconocido con flota mixta "premium".

**Decisión del usuario:** no tocar el escalón "resto" (70) — le gusta tal cual. En cambio,
estirar la ventana de decaimiento del Paso 1 de 5 a 6 años, para que las compras de esos
años extra (4-6 años atrás) sigan beneficiando al dueño real.

```
factorRecencia = max(0, 1 − años_desde_última_compra / 6)   [antes: / 5]
score = 60 + factorRecencia × (95 − 60)
```

Con esto, Carrocerias Dueñas (4 años) sube de 67 a **71.7**, volviendo a ganarle a M.C.M.
(68.1). También se ajustó el valor por defecto para unidades sin año registrado (antes 5,
ahora 6, para que sigan cayendo exactamente en el piso).

**Limitación conocida, explicada con números:** el fix funciona bien hasta ~4.3 años de
antigüedad. A partir de 5 años, el score del Paso 1 vuelve a caer a 65.8, después 60 —
otra vez por debajo de un no-dueño tipo M.C.M. (68.1). El usuario fue informado de esto
explícitamente y decidió aceptarlo como límite conocido en vez de tocar el escalón "resto".

Commit `3163228`.

### Banda de UD ampliada con el Quester (34t)

UD sumó el Quester (línea CWE) a su stock, con 34 toneladas de peso bruto — muy por encima
del techo de tolerancia que tenía la banda de UD hasta hoy (23,125 kg). El usuario dio el
peso real de las 4 líneas de la marca: MKE 11.7t, LKE 14.5t, PKE 18.5t, Quester/CWE 34t, y
pidió que todo entre en **una sola banda** (núcleo 11.7-34t), aceptando que hay una brecha
grande entre el PKE (18.5t) y el Quester (34t) — "ahí ya viene el talento del asesor" para
convencer a los clientes con unidades intermedias.

```
BANDAS['UD TRUCKS'].CAMION = {
  nucleoMin: 11700, nucleoMax: 34000,   // antes: nucleoMax 18500
  tolMin: 8775, tolMax: 42500,          // antes: tolMax 23125
  bloque: 'JAPONES'
}
```

Misma metodología que el resto de las marcas (núcleo = rango real de modelos, tolerancia
= núcleo ±25%). Esto amplía la cantidad de clientes elegibles para UD — antes el techo de
23t dejaba afuera a cualquier cliente con flota más pesada. Commit `3163228` (mismo commit
que el cambio de ventana de recencia).

---

## 14. Seguridad — restringir el acceso a CIDATT (investigación en curso, 2026-08-14)

**Estado: solo investigación y plan acordado con el usuario. Nada de esto se aplicó todavía
en el portal de Azure AD — no hay commits de código involucrados, es 100% configuración de
Azure/red, fuera del repo.**

### Qué lo disparó

El usuario reportó que alguien externo a la empresa intentó varias veces (5 solicitudes en
7 minutos, cuenta "Balber Ito ramos") pedir acceso a un archivo de Google Drive
("CARTERA COMERCIAL TRATON.xlsx", cartera de un asesor). Se verificó ese archivo puntual:
permisos de Drive muestran **solo al owner** (`asanchez@truckcenterperu.pe`), cero
solicitudes aprobadas — no hubo fuga real ahí, el mecanismo de "solicitar acceso" de Drive
ya está funcionando como debería (deniega por defecto).

Ese susto llevó a la pregunta real y más importante: **el sitio CIDATT (Directorio +
Perfilador, la data comercial más valiosa) usa login corporativo de Microsoft 365 / Azure AD
(ver sección 1), pero ese login solo verifica que el correo pertenezca al tenant de
EUROMOTORS S.A. — no distingue qué persona específica debería tener acceso.** Cualquiera con
un correo válido del tenant entra igual, sea quien sea. El usuario lo resumió así: "no se
puede discriminar, no se sabe quién es el que entra porque solo es un correo."

### Plan acordado (dos capas, ninguna aplicada todavía)

**Capa 1 — lista explícita de usuarios autorizados.** En Azure AD / Entra admin center →
Enterprise Applications → `CIDATT-TCP-Sur` → Properties → activar "Assignment required? =
Yes", y en "Users and groups" asignar solo a las personas (o un grupo de seguridad, ej.
"CIDATT-Autorizados") que deben tener acceso. Sin esto, cualquiera del tenant entra; con
esto, hay que estar en la lista explícita además de pasar el login/MFA.

**Capa 2 — restricción por red de origen (Conditional Access → Named Locations).** Exigir
que, además de estar en la lista de usuarios, la conexión venga desde la IP de la oficina o
del VPN corporativo (FortiClient, gateway `vpn.euromotors.com.pe`) — mismo principio que ya
usa el SIMA hoy (bloqueado fuera de la red de la empresa salvo por VPN). Esto bloquea el
escenario que más le preocupa al usuario: que el link/correo/contraseña de CIDATT se filtre
fuera de la empresa — sin la IP correcta, ni con credenciales válidas se puede entrar.

Nota importante ya discutida con el usuario: el VPN usa SSO (usuario/contraseña vía
navegador, según la captura de configuración de FortiClient — "Enable Single Sign On (SSO)
for VPN Tunnel" activado), **no un certificado atado al equipo físico**. O sea, esta capa
bloquea a cualquiera sin credenciales de VPN, pero no es un candado "solo esta laptop
específica" — si las credenciales de VPN también se filtraran, técnicamente se podría
instalar FortiClient en otra máquina. El usuario evaluó esto y lo considera suficiente para
el riesgo real (asesores comerciales sin malicia, links que se filtran sin querer) — no se
planteó ir a device-compliance/Intune por ahora.

También se puede agregar una alerta (Log Analytics / Sentinel) sobre los Sign-in logs de
Azure AD para notificar cuando alguien con correo válido intente entrar sin cumplir la
condición de red — pendiente de diseño, no bloqueante para el resto del plan.

### Datos recolectados hasta ahora

- **IP pública de la red de oficina (las 4 sedes):** `190.116.0.98` (ISP América Móvil
  Perú/Claro). Confirmado que **Administración, AQP Recepción, Almacén y Comercial Traton
  salen las 4 por esta misma IP** — toda la empresa comparte un solo punto de salida a
  internet centralizado. Falta confirmar si es **fija o dinámica** (llamar al proveedor y
  preguntar directamente es el método más confiable; alternativa: ver si cambia con el
  tiempo o al reiniciar el router, aunque eso no es 100% concluyente).
- **IP con VPN conectado:** `179.6.144.230` — capturada una sola vez, desde la laptop del
  usuario. **Dato dudoso, no confirmado todavía:** mismo ISP que la IP de oficina pero
  ciudad distinta en la geolocalización, lo que podría indicar que el VPN está en modo
  "split-tunnel" (solo el tráfico a recursos internos como el SIMA pasa por el túnel; la
  navegación normal, incluida la prueba de "cuál es mi IP", seguiría saliendo por la
  conexión personal del usuario, no por el gateway del VPN). Para confirmar de verdad: pedir
  a 2-3 personas en ubicaciones bien distintas entre sí (casa, datos móviles, otra ciudad)
  que se conecten al VPN y revisen su IP — si a todos les sale la misma IP, confirma que es
  un punto de salida centralizado y confiable para usar en Azure; si a cada quien le sale
  una IP distinta (parecida a su conexión personal), confirma split-tunnel y esta capa
  necesitaría un enfoque distinto. **Esta prueba todavía no se hizo.**
- **Licencia de Microsoft 365 del tenant:** no confirmada. Conditional Access (ambas capas
  de restricción por usuario asignado y por red) requiere como mínimo Azure AD Premium P1
  (incluido en Business Premium o E3, no en planes más básicos). Falta que el usuario
  confirme el plan contratado (admin.microsoft.com → Facturación → Tus productos) o lo
  consulte con quien administra esa cuenta/el Fortigate.

### Próximos pasos (ninguno iniciado)

1. Confirmar si `190.116.0.98` es IP fija.
2. Hacer la prueba de VPN desde múltiples ubicaciones para confirmar (o descartar) split-
   tunnel y la IP real de salida del VPN.
3. Confirmar el plan de Microsoft 365 / licencia Azure AD Premium P1.
4. Con los 3 datos anteriores confirmados: armar la Conditional Access Policy real en el
   portal de Azure (Capa 1 + Capa 2 combinadas) — pasos exactos pendientes de escribir, se
   harán cuando haya datos confirmados para no armar una regla con información dudosa que
   termine bloqueando a todo el mundo o sin proteger nada.
5. (Opcional, más adelante) Alerta sobre intentos de login bloqueados.

**Quién administra el Fortigate/VPN y la cuenta de Microsoft 365:** no identificado en la
conversación — el usuario no dijo si es alguien interno de sistemas o un proveedor externo.
Dato a conseguir para acelerar los puntos 1-3.

---

## 15. Rediseño mayor: bandas de peso v2, ficha con modelo/carrocería, y Perfilador por grupos (2026-09-09)

Sesión larga de diseño, **sin una línea de código todavía**. Se cerraron todas las decisiones
con el usuario y se dejó la base de datos lista. Esta sección reemplaza, donde se contradiga,
lo que dicen las secciones 6, 12 y 13.

### 15.1 Base de datos nueva del sitio

El sitio deja de alimentarse del CIDATT 2026 antiguo. La base oficial pasa a ser:

`02_Datos_CIDATT/Carroceria_2026_Actualizada/CIDATT_2026_BASE_SITIO.xlsx` (hoja `Base`,
285,632 filas, 17 columnas).

Se generó a partir de `CIDATT_Estandar_2026_Carroceria_Actualizada.xlsx` (Carrocería cruzada
con 2025, PBV corregido, Departamento/Provincia por RUC) aplicándole la normalización de
Carrocería y las bandas de peso nuevas. Columnas: Placa, RUC, Nombre / Razon Social, Anio
Fabricacion, Marca (Estandar), Modelo, Clase, **Carroceria** (canónica), **Carroceria_Grupo**,
Peso Bruto (kg), **Categoria Peso Bruto** (bandas v2), Combustible, Origen Sugerido,
Departamento, Provincia, metodo_carroceria_2026, Carroceria_Original.

Se eliminaron `Anio Modelo` (estaba 100% vacía) y `Categoria_PBV_Anterior` /
`Categoria Peso Bruto Clase` (criterios de peso viejos, ya superados).

### 15.2 Auditoría de integridad de la base (hecha antes de aprobar el cambio)

Limpio y usable: Placa 285,632 **únicas, cero duplicadas**, formato uniforme. RUC 100% de 11
dígitos (prefijos 20: 169,993 / 10: 115,086 / 15: 331 / 17: 222). Marca (Estandar) 233 valores,
sin espacios sobrantes ni minúsculas. Modelo 7,123 valores, ninguno vacío. Clase solo CAMION
(222,329) y REMOLCADOR (63,303). Año 1946-2026, sin fechas futuras.

Outliers conocidos que NO bloquean: 22 unidades con PBV sobre 60 t (una marca 300,000 kg,
imposible); 1 unidad sin PBV; 966 unidades anteriores a 1970.

### 15.3 Carrocería — normalización ortográfica y catálogo controlado

**Problema encontrado:** la columna tenía 13 colisiones por tildes que afectaban **66,199
unidades (23% de la base)** — FURGÓN 37,008 vs FURGON 13,712; FURGÓN FRIGORÍFICO 4,200 vs
FURGON FRIGORIFICO 949 (más 2 variantes mixtas); CAMIÓN GRÚA 2,803 vs CAMION GRUA 1,328;
FURGÓN ISOTÉRMICO 3,013 vs FURGON ISOTERMICO 1,507; más AUXILIO MECÁNICO/MECANICO,
CAÑERO/CANERO, CIGÜEÑA/CIGUEÑA, TRACTO CAMIÓN/CAMION y dos casos de doble espacio. Esto rompía
de raíz la ficha nueva, que agrupa por Marca+Modelo+Carrocería+PBV: la misma combinación se
partía en dos filas.

**Solución en dos niveles, ambos en el archivo:**

1. **`Carroceria` (canónica).** Mismo texto del registro pero con ortografía corregida:
   mayúsculas, espacios colapsados, tildes correctas por palabra (FURGON→FURGÓN,
   ISOTERMICO→ISOTÉRMICO, GRUA→GRÚA, MECANICO→MECÁNICO...), mojibake arreglado (`CA?ERO` →
   CAÑERO), abreviaturas con punto expandidas (`CAB.SIMPLE` → CABINA SIMPLE, `PLATAF.BARAN.
   REBAT.` → PLATAFORMA BARANDA REBATIBLE) y errores de tipeo unificados (REVATIBLE /
   REVERTIBLE / REBERTIBLE → REBATIBLE, MESCLADORA → MEZCLADORA, EMMALLADA → ENMALLADA,
   ORMIGON → HORMIGÓN). Los valores basura (`-`, `* * * *`, `049`, `S/C`, `SIN TIPO DE
   CARROCERIA`) y los vacíos van todos a **SIN DATO**. Resultado: 430 valores → **383**.
2. **`Carroceria_Grupo` (catálogo controlado, 29 grupos).** El texto libre se clasifica en
   familias por reglas de palabra clave con orden de prioridad — lo específico gana sobre lo
   genérico, así `CISTERNA BARANDA` cae en CISTERNA y `GRÚA/BARANDA REBATIBLE` cae en GRÚA, no
   en BARANDA. Sirve para agrupar y filtrar sin perder el texto original, que queda guardado en
   `Carroceria_Original`.

| Grupo | Unidades | | Grupo | Unidades |
|---|---|---|---|---|
| BARANDA | 93,463 | | AUXILIO MECÁNICO | 582 |
| REMOLCADOR | 61,058 | | CAÑERO | 510 |
| FURGÓN | 50,832 | | INTERCAMBIADOR | 496 |
| VOLQUETE | 38,506 | | VALORES / CAUDALES | 415 |
| CÁMARA FRIG. / ISOTERM. | 10,276 | | SANITARIO / SALUD | 394 |
| CISTERNA | 7,300 | | TANQUE GLP / GAS | 305 |
| PLATAFORMA | 5,054 | | ELEVADOR | 265 |
| GRÚA / BRAZO HIDRÁULICO | 4,676 | | LUBRICADOR | 161 |
| HORMIGONERA / CONCRETO | 3,336 | | TOLVA / GRANELERO | 160 |
| SIN DATO | 2,267 | | USOS VIALES | 142 |
| CABINA / CHASIS | 1,601 | | FACTORÍA / TALLER | 126 |
| QUILLA | 1,419 | | PERFORADOR | 124 |
| COMPACTADOR / RECOLECTOR | 1,253 | | EXPLOSIVOS | 74 |
| OTROS USOS ESPECIALES | 779 | | CIGÜEÑA / VIVIENDA | 60 |

El script vive en `~/audit/carroceria.py` en el entorno de trabajo; el catálogo completo
(grupo → valor → unidades, y original → canónico) quedó en
`Carroceria_Catalogo_Mapeo.xlsx`, misma carpeta, para revisión humana.

### 15.4 Bandas de peso v2 — criterio DEFINITIVO

Reemplaza al criterio de 5 bandas del 2026-09-08 (cortes 10/16/25/42) y a toda categoría de
peso anterior. **Solo aplica a Clase = CAMION**; REMOLCADOR no se segmenta por peso.

| Segmento | Rango | Unidades |
|---|---|---|
| LIGEROS | < 10 t | 104,841 |
| MEDIANOS | 10 – <25 t | 56,018 |
| PESADOS | 25 – <41 t | 44,784 |
| SUPER PESADOS | ≥ 41 t | 16,685 |
| SIN DATO DE PESO | (PBV inválido) | 1 |

Ojo: esto NO tiene relación con las bandas del Eje 0 del Perfilador (núcleo por marca ±15%),
que son otra cosa y conviven con esto.

### 15.5 Ficha del Directorio — árbol nuevo

Reemplaza al árbol actual (Clase → Año → Marca + banda + cantidad → placas).

- **Nivel 1 —** hasta 5 grupos: los 4 segmentos de Camión con su rango de peso en el nombre
  ("Camión — Pesados (25–41 t)") + **Remolcador** (sin banda, un click despliega todo). Se
  muestran **solo los grupos donde el cliente tiene unidades**, nunca los 5 en seco. El grupo
  "Camión — Sin dato de peso" aparece únicamente si el cliente tiene esa unidad (1 en toda la
  base): nunca se mete a la fuerza en Ligeros.
- **Nivel 2 —** Año.
- **Nivel 3 —** fila agrupada por **Marca + Modelo + Carrocería + PBV**, con la **cantidad al
  lado derecho**. Combinación idéntica → una fila con N. Cualquier diferencia en cualquiera de
  los cuatro campos → filas separadas con 1 cada una. Carrocería vacía se muestra como
  **SIN DATO**.
- **Nivel 4 —** un click más: la grilla de placas, tal cual funciona hoy (commit `695bed1`).

### 15.6 Perfilador — Eje 0: tolerancia de ±25% a ±15%

Motivo: el usuario quiere listas más acotadas. `tolMin = núcleo_min × 0.85`,
`tolMax = núcleo_max × 1.15`.

| Marca | Clase | Núcleo | Banda ±25% (vieja) | **Banda ±15% (nueva)** |
|---|---|---|---|---|
| MAN / Dongfeng / FAW | Camión | 41,000–50,000 | 30,750–62,500 | **34,850–57,500** |
| International | Camión | 30,000 (punto único) | 22,500–37,500 | **25,500–34,500** |
| UD Trucks | Camión | 11,700–34,000 | 8,775–42,500 | **9,945–39,100** |
| Volkswagen | Camión | 6,000–31,000 | 4,500–38,750 | **5,100–35,650** |
| Todas | Tracto | sin banda | sin banda | sin banda |

El núcleo de UD ya incluye el Quester/CWE de 34 t desde el commit `3163228` (sección 13) — no
hay nada pendiente ahí.

**Impacto medido antes de aprobarlo** (clientes elegibles, Camión):

| Marca | ±25% | ±15% | Δ |
|---|---|---|---|
| MAN / Dongfeng / FAW | 12,843 | 8,517 | −33.7% |
| International | 29,242 | 11,140 | −61.9% |
| UD Trucks | 67,076 | 58,731 | −12.4% |
| Volkswagen | 107,467 | 105,399 | −1.9% |

**La ponderación núcleo-vs-tolerancia SE MANTIENE, pero suavizada.** El usuario propuso
eliminarla (que la zona de tolerancia contara al 100%, ya que la banda es más angosta); se
midió y la distorsión que la justificaba **sigue viva incluso a ±15%**: la tolerancia superior
de MAN es 89% Chino contra un núcleo 59% Europeo; la tolerancia inferior de Volkswagen es 41%
Chino + 28% Coreano contra un núcleo 44% Japonés; la inferior de UD es 60% Japonés contra un
núcleo 46% Europeo. Decisión: conservarla pero subir el piso del decaimiento **de 30% a 60%**
en el borde extremo, porque con la banda angosta el castigo doble era excesivo.

```
peso_unidad = 100% − (distancia_al_núcleo / ancho_de_la_zona_de_tolerancia) × 40%
```

### 15.7 Eje 1 — Recurrencia: CORRECCIÓN, no se toca

**Durante la implementación se encontró que el diseño de esta subsección partía de una premisa
equivocada.** Al discutirlo se describió el Eje 1 como "rampa lineal de antigüedad 0→5 años"
(que es lo que dice la sección 6) y se acordó estirarla a 8. Pero la sección 6 quedó obsoleta el
2026-08-08: la **sección 10** reemplazó esa rampa por
`Recurrencia = 85% Frecuencia + 15% Recencia`, donde Frecuencia = cuántas unidades compró
históricamente en la banda (tope en 5 unidades) y Recencia = qué tan reciente fue la última
compra, **con ventana de 8 años ya desde entonces** (`calcularRecencia(unidades, ventana = 8)`).

Ese cambio se hizo porque el backtest contra 293 ventas reales demostró que la rampa de
antigüedad medía al revés: los compradores reales quedaban POR DEBAJO del promedio de su
segmento (delta −22.5), porque un cliente con una sola unidad de 1988 marcaba 100 y uno que
compra todos los años marcaba 20. Con la fórmula nueva el delta pasó a +48.9.

**Decisión: el Eje 1 no se toca.** Volver a una rampa de antigüedad — aunque fuera de 8 años en
vez de 5 — desharía un arreglo validado con datos reales. La ventana de recencia ya es de 8
años, que era la intención del cambio pedido. Lo único que sí se movió es la **ventana del
Paso 1 de Afinidad, de 6 a 8 años**, para que quede alineada con la Recencia del Eje 1 (ver
15.8).

### 15.8 Eje 2 — Afinidad: de cascada continua a niveles que no se pisan

**El cambio de fondo de esta sesión.** Hoy la Afinidad es un solo número que sale de una cascada
donde los anclajes de cada paso se solapan — de ahí el bug conocido de la sección 13 (un
desconocido con flota mixta le ganaba a un dueño real de más de 5 años, 68.1 contra 60).

Requisito del usuario, literal: *"quiero que a cada marca siempre en la parte de arriba salgan
los clientes que tienen la marca × clase, luego los que son del bloque de origen de la marca,
luego los de los bloques más lejanos"*. Eso no es una calibración, es un orden **lexicográfico**:
primero el nivel, después el puntaje dentro del nivel. Los rangos se reparten sin solaparse, así
que la regla queda garantizada por construcción y no por ajuste fino.

| Nivel | Quién cae ahí | Rango | Qué ordena adentro |
|---|---|---|---|
| **N1** | Ya compró la marca (en esa clase) | 80–100 | Recencia (8 años) + participación de la marca en su flota |
| **N2** | Mayoría de su flota en el bloque propio de la marca | 55–79 | % ponderado + bonificación de pivote |
| **N3** | Flota en bloques más lejanos | 20–54 | Escalera de distancia (15.9) + bonificación de pivote |
| **N4** | Fiel a un competidor puntual | 0–19 | Qué tan concentrado |
| **N5** | Sin flota en la banda | sin score | Tamaño de cuenta |

**Cambios por paso respecto de la sección 6:**

- **Paso 0 (guardia).** Ya no da 50 neutro. Un 50 caía justo en medio del nivel de bloque, o sea
  que un cliente **sin ninguna unidad relevante** quedaba por encima de un cliente real de la
  competencia (que saca 10-30): premiaba la ausencia de información. Ahora esos clientes van al
  **N5, al fondo**, con un switch para ocultarlos. Tampoco tienen Recurrencia calculable: no hay
  ninguna compra en la banda que fechar.
- **Paso 1 (ya es cliente).** El piso sube de 60 a **80** (piso de N1):
  `score = 80 + factorRecencia × 20`, con `factorRecencia = max(0, 1 − años/8)`. Un dueño de hace
  8 años saca 80 y **nunca puede ser alcanzado por un no-dueño**. Además el descuento por
  concentración de marca ajena (sección 12) pasa a aplicarse **también dentro de N1**, acotado
  para que nunca saque al cliente del nivel: así el que tiene 1 MAN y 20 Volvos cae al piso de
  N1, debajo del que tiene 5 MAN y nada más. **Esto resuelve el pendiente viejo del caso
  Supermix/Transaltisa** (Paso 1 sin crédito por volumen), abierto desde el 2026-08-08.
- **Paso 2 (monomarca de competidor).** Sin cambios de fórmula. Queda explícito que la cascada
  corta antes: un cliente que compró la marca aunque sea una vez entra a N1 y **nunca llega al
  Paso 2** — intencional bajo la regla nueva, y compensado por el descuento dentro de N1.
- **Paso 3 (pivote).** **Deja de ser un nivel propio y pasa a ser bonificación** dentro de N2/N3:
  el que pivoteó hacia el bloque compatible sube dentro de su grupo, el que pivoteó en contra
  baja, sin cambiar de grupo. **Esto resuelve el pendiente #3** (desde el rediseño del 2026-08-11
  el pivote y el descuento por concentración compartían la señal `distanciaOrigen` y contaban dos
  veces lo mismo).
- **Paso 4 (bloque de origen).** Conceptualmente intacto: la tabla `DISTANCIA_ORIGEN` del commit
  `96f1467` ya hacía exactamente lo que pedía el usuario. Lo único que cambia es que su salida se
  comprime dentro de N2/N3 en vez de competir de igual a igual con N1, y que la escalera se
  reduce a 3 peldaños (15.9).
- **Paso 0.5 (amortiguador de confianza).** **Se elimina como amortiguador de score.** Empujar
  hacia 50 sacaba a un cliente de N1 con 1 unidad y lo dejaba en medio de N3, contradiciendo
  directamente la regla principal. Se reemplaza por una **etiqueta de confianza visible**
  ("1 unidad — señal débil") que además funciona como desempate: a igual score, primero el que
  tiene más unidades.

### 15.9 Escalera de bloques — 3 peldaños, simétrica

El usuario cerró que Coreano va junto a Europeo/Americano/Japonés (no es un peldaño intermedio),
y que la escalera es **simétrica** (la distancia premium→chino es la misma que chino→premium).

| | Marca premium (MAN, VW, International, UD) | Marca china (Dongfeng, FAW) |
|---|---|---|
| Cerca | Bloque propio — 85 | Chino — 85 |
| Medio | Resto premium: Europeo, Americano, Japonés, Coreano — 70 | Otro (chinas de bajo costo) — 70 |
| Lejos | Chino + Otro — 45 | Todo el bloque premium — 45 |

**Corrección respecto de la tabla vieja:** el bloque `OTRO` deja de contar como premium. Se
verificó que son marcas chinas de bajo costo mal clasificadas (KYC 379, Kama 283, Sitom 267,
Strong 143, Autocraft 123) — 1,614 unidades que estaban en el escalón "resto = 70" al lado de
Volvo y Freightliner.

Composición real de cada bloque en la base (para futuras discusiones): EUROPEO 80,105 (Volvo
47k, Mercedes 13k, Scania 11k, VW 5.9k, Iveco 2k) · JAPONES 76,163 (Fuso 27k, Isuzu 21k, Hino
21k, Nissan 4.4k) · CHINO 53,860 (Foton 10k, JAC 10k, Sinotruk 7k, Dongfeng 6k, Shacman 3.6k) ·
AMERICANO 39,597 (International 15k, Freightliner 11k, Kenworth 3.9k, Mack 3k) · COREANO 34,293
(Hyundai 28.6k, Kia 5.6k) · OTRO 1,614.

**Recencia dentro del bloque:** el porcentaje de bloque ya se calcula ponderado por recencia
desde el diseño original, así que un cliente con 3 Volvo del 2024 y 3 Foton del 2012 pesa
mayoritariamente como europeo — la pregunta del usuario sobre "si los Volvo son nuevos y los
Foton antiguos" ya estaba resuelta. Se agrega mostrar en la ficha el **año de la última compra
por bloque**, para que el asesor pueda auditar de dónde salió la clasificación.

**Regla de corte N2 vs N3:** por **mayoría del peso ponderado**. Si más del 50% de la flota
ponderada del cliente está en el bloque propio de la marca → N2; si no → N3. Se eligió sobre la
alternativa de cortar por puntaje (ej. ≥75) porque es la regla que el asesor puede explicar en
voz alta: "la mayoría de su flota es europea".

### 15.10 Clientes de 1, 2 y 3 unidades — piso de evidencia

Importa porque **ahí está el 96.6% de los clientes** (Retail 1-5 unidades). Al eliminar el
amortiguador aparece un hueco: un cliente con 1 sola unidad Volvo tiene 100% de concentración en
Volvo, y el descuento por concentración lo mandaría a N4 "fiel a un competidor" — absurdo, con
una unidad no hay fidelidad, hay una compra. Antes eso lo tapaba el amortiguador.

**Regla nueva:** para caer en N4 hacen falta **mínimo 3 unidades** en la banda. Con 1 o 2 no hay
patrón que medir. El descuento por concentración también se aplica solo desde 3 unidades.

| Unidades en la banda | ¿Tiene la marca? | Destino |
|---|---|---|
| 0 | — | N5, al fondo, sin score |
| 1–2 | Sí | **N1** (es cliente real, solo que chico) |
| 1–2 | No | **N3** por su bloque. Nunca N4 |
| 3+ | Sí | N1, ordenado por recencia + participación |
| 3+ | No | N2 / N3 / N4 según su patrón |

Efecto práctico: un cliente con 1 MAN comprado el año pasado hoy sale con Afinidad 50 (el
amortiguador lo aplasta) y queda enterrado; con el diseño nuevo sube a N1 — que es justo el
cliente que ya compró uno y puede comprar el segundo. El badge de Tamaño de cuenta (Retail /
Medium / Big / Mega Fish, sección 6) sigue ahí para que el asesor pese si le conviene ir.

### 15.11 Presentación de resultados — lista agrupada, no plana

`Score final = Urgencia × Afinidad` se mantiene, pero **deja de ser el orden de primer nivel**:
por sí solo hundía a un dueño de la marca con urgencia baja, contradiciendo la regla principal.

La lista de resultados sale **partida en secciones visibles** — "Ya son clientes MAN" / "Bloque
europeo" / "Bloques lejanos" / "Fieles a un competidor" / "Sin flota en la banda" — y **dentro de
cada sección** se ordena por Score final. Así el nivel manda en la estructura y la urgencia
decide a quién llamar primero dentro del grupo. Los reordenamientos por solo Afinidad o solo
Urgencia se mantienen como están.

**Ajuste posterior del mismo día — el Score final se calcula sobre la posición dentro del
nivel, no sobre la Afinidad cruda.** Al probar el motor contra datos reales apareció que los
rangos angostos de nivel (N1 solo se mueve entre 80 y 100) dejaban ciega a la multiplicación:
la Recurrencia, que va de 0 a 100, decidía sola el orden dentro del grupo. Caso real (MAN, sur):

| Cliente | Compró MAN | Afinidad | Recurrencia | Score viejo | Score nuevo |
|---|---|---|---|---|---|
| Gruas y Transportes San Lorenzo | hace 12 años | 80 | 98.1 | 78.5 | 0 |
| AYSA Barra Alipio | hace 2 años | 95 | 11.3 | 10.7 | 8.5 |

El comprador reciente quedaba enterrado debajo del frío, al revés de la regla principal. Se
corrigió normalizando la Afinidad a su **posición dentro del nivel** (0 a 1) antes de
multiplicar: `Score final = posEnNivel(nivel, afinidad) × Recurrencia`. Así las dos señales
pesan parejo en todos los grupos, no solo en N1.

Efecto lateral aceptado: todo cliente fuera de la ventana de 8 años queda en posición 0 y por
lo tanto en Score final 0, lo que borraría el orden entre ellos. Se agregó una cadena de
desempate — **Score final → Recurrencia → tamaño de flota** — para que entre los fríos siga
adelante el de flota más grande.

### 15.12 Ficha del cliente en el Perfilador

Mismo árbol que el Directorio pero **sin el nivel de segmento de peso** (la lista ya viene
filtrada por la banda de la marca): **Año → Marca + Modelo + Carrocería + PBV + bloque de origen
+ cantidad → click → placa(s)**. Se conservan el PBV y el bloque de origen, que es el dato del
que depende el score y sin el cual la ficha no sirve para auditar.

### 15.13 Limitación aceptada a conciencia: dueños fuera de su propia banda

Al cerrar a ±15% se midió cuántos dueños de cada marca quedan fuera de la banda de esa marca
(Camión): **Dongfeng 3,874 de 4,157 (93%)**, International 754 de 1,188, FAW 552 de 1,227, MAN 26
de 76, Volkswagen 52 de 2,594, UD 4 de 454. El caso Dongfeng es extremo porque su banda es la
línea volquete de 41-50 t mientras casi toda su flota en Perú es liviana.

Se le planteó al usuario separar las dos preguntas (propiedad de la marca sobre toda la clase,
análisis de bloque dentro de la banda). **Decisión: no separarlas — todo se sigue evaluando
marca × clase dentro de la banda.** Queda como limitación conocida y documentada: un dueño de
Dongfeng liviano no aparecerá arriba cuando se filtre Dongfeng-Camión.

### 15.14 Plan de implementación

1. ~~Recalcular bandas de peso y normalizar Carrocería~~ — **hecho**, ver 15.1 a 15.4.
2. Clonar `Puchulungo/cidatt-tcp-sur` desde GitHub. La copia local en `04_App_Web_Fuente/` es del
   2026-08-06 y está atrasada (sus shards ni siquiera traen `origen`). **El repo se lee sin token**
   (probado: HEAD = `3163228`, el último commit del 2026-08-11); el token solo hace falta para el
   push.
3. Regenerar `data/perfilador/*.json` desde `CIDATT_2026_BASE_SITIO.xlsx`, sumando `modelo`,
   `carroceria`, `carroceria_grupo` y `categoria_peso` a lo que ya traen.
4. `directorio.html`: árbol nuevo de la ficha (15.5).
5. `perfilador.html`: Eje 0 a ±15% con decaimiento 60%, Eje 1 a 8 años, Eje 2 por niveles,
   escalera de 3 peldaños, piso de evidencia de 3 unidades, lista agrupada, ficha nueva.
6. Backtest — ver abajo.

### 15.15 Cómo se va a rehacer el backtest

**La métrica vieja ya no sirve.** El backtest multianual (sección propia, `BACKTEST_MULTIANIO_
2019_2026.md`) medía "los compradores reales puntúan por encima del promedio de su segmento",
que es la pregunta correcta para un score continuo. El sistema nuevo es un **ordenamiento por
grupos**, así que la pregunta pasa a ser: **¿en qué grupo cae el comprador real?**

Métricas nuevas: (a) % de compradores reales que aparecen en N1 y N2 (recall por nivel);
(b) cuántos clientes tiene que recorrer el asesor para llegar a ellos, contra una lista al azar
(lift); (c) comparación motor viejo vs. motor nuevo sobre los mismos 7 pares de años.

**Decisión del usuario (2026-09-09): el backtest se corre contra los CIDATT históricos, NO
contra el archivo de ventas de la empresa** (`INCAPESA - Venta VN.xlsx`, 293 ventas) — esa
muestra queda chica para validar un sistema de ordenamiento por grupos. Queda para una sesión
aparte.

Data: los 8 snapshots estandarizados están en `02_Datos_CIDATT/Estandar/CIDATT_Estandar_<año>.
xlsx` (2018-2026); los crudos originales en `00_Archivo_Historico/CIDATT/BBDD <mes> <año>/`.
El proxy de compra sigue siendo "placa nueva por RUC entre dos snapshots consecutivos".
**El puerto Python del motor ya no está en disco** — hay que rehacerlo (es mecánico: se porta
1:1 desde `perfilador.html`, como se hizo la primera vez).

### 15.16 Pendientes de calibración (identificados el 2026-09-09, ninguno decidido)

**La Recurrencia se satura a las 5 unidades.** Medido sobre los clientes con unidades en la
banda (MAN, sur): 1 unidad → Recurrencia media 6.3 · 2 → 29.8 · 3-4 → 59.4 · 5-9 → **94.7** ·
10-29 → **95.4** · 30+ → **95.3**. De 5 unidades para arriba deja de discriminar: un cliente con
5 camiones y uno con 60 sacan lo mismo. La causa es la forma de `calcularFrecuencia`
(`(n−1)/4`, tope en 5 unidades), no el reparto 85/15. En la práctica hoy la Recurrencia mide
"cantidad de unidades truncada en 5", que además duplica lo que ya dice el badge de Tamaño de
cuenta.

**Decisión del usuario: no tocar el 85/15 ni la forma de la Frecuencia hasta rehacer el
backtest.** El 85/15 salió de un backtest real y cambiarlo a ojo sería el mismo error que
motivó la corrección de 15.7. Hipótesis a medir cuando se corra: reemplazar el tope lineal de 5
por una curva logarítmica que siga creciendo (1 → 0, 3 → 32, 10 → 68, 30 → 100), que separaría a
los clientes grandes entre sí.

**Otras tres ideas de calibración, planteadas y postergadas:**
1. *Recurrencia real* — con los 8 snapshots se puede medir el intervalo de recompra observado
   por RUC (cada cuánto agrega unidades) en vez del proxy de stock de una sola foto. Es la
   mejora más grande disponible y la data ya está en la carpeta.
2. *Panel de auditoría por RUC* — una pantalla que muestre todos los números intermedios (peso
   de cada unidad, distancia de bloque, % dominante, posición, nivel) para diagnosticar en
   segundos en vez de adivinar.
3. *Registro de feedback del asesor* — pulgar arriba/abajo con motivo sobre cada cliente que
   sale en la lista. Sin etiquetas reales no se puede pasar de reglas afinadas a mano a un
   modelo estadístico, que es el destino que anota la sección 6.
