# AvistAves — Análisis y plan de ejecución

Documento de trabajo del equipo. Define qué se construye, con qué decisiones, bajo qué criterios
se da por cumplido cada requerimiento y en qué orden se ejecuta el tiempo disponible.

---

## 1. Resumen de la entrega

| Aspecto | Detalle |
|---|---|
| Producto | AvistAves, aplicación móvil para que los voluntarios de la Red de Observadores de Aves registren avistamientos en terreno |
| Asignatura | Desarrollo de Aplicaciones Móviles, Instituto Profesional San Sebastián |
| Equipo | Otton Lucena y Valeria Gómez |
| Modalidad | Grupal. Ambos integrantes deben quedar registrados en el historial de commits |
| Plazo | Jueves 17 de septiembre de 2026, 23:59 |
| Repositorio | `https://github.com/ottonlucena/examen-transversal-app-moviles` |
| Framework | React Native con Expo (SDK 57), TypeScript |
| Demostración | Emulador de Android sobre Linux Mint, AVD `Pixel_8_API_34` |
| Entregables | Repositorio público en GitHub con `README.md`, informe en Markdown dentro del repositorio y declaración del uso de IA |
| Puntaje | 100 puntos, aprobación con 60 |

La aplicación tiene tres pantallas: listado de avistamientos, formulario de registro y detalle de
un avistamiento.

### Pauta oficial de evaluación

| Indicador | Dónde se evalúa | Máx |
|---|---|---|
| Conceptos del framework | Informe | 10 |
| Patrones de diseño | Informe | 12 |
| Comparación de frameworks | Informe | 12 |
| Principios de diseño de UI | RF-01 a RF-04 | 12 |
| Componentes de UI | RF-01, RF-03, RF-06 | 12 |
| Interfaces intuitivas | Estados, permisos y validaciones | 12 |
| Uso de periféricos | RF-01 (cámara y GPS) | 10 |
| Integración con la API | RF-02, RF-04 | 10 |
| Optimización de la API | Medidas documentadas en el informe | 10 |

Lectura operativa de la tabla: 34 puntos (conceptos, patrones y comparación) se ganan escribiendo
el informe y no dependen de que la aplicación esté terminada. Otros 10 (optimización de la API)
se ganan documentando medidas que además deben ser señalables en el código. Por eso el informe se
escribe en paralelo al desarrollo y no al final, y por eso los patrones de diseño y las medidas de
optimización quedan decididos en este documento antes de escribir la primera línea de código: si
se decidieran después, habría que buscarlos en un código que no fue escrito para exhibirlos.

---

## 2. Decisiones tomadas

| Decisión | Elección | Justificación breve |
|---|---|---|
| Framework | React Native + Expo SDK 57 | El equipo trabaja en JavaScript/TypeScript. Expo entrega los módulos de cámara, ubicación, sistema de archivos y almacenamiento ya compilados dentro de un binario de desarrollo, sin obligar a tocar Gradle ni código nativo. Con menos de 48 horas, eliminar la configuración nativa es la decisión de mayor impacto sobre el riesgo del proyecto |
| Lenguaje | TypeScript | El tipo `Avistamiento` se vuelve un artefacto citable en el informe: el modelo de datos deja de ser una promesa en prosa y pasa a ser una definición que el docente puede abrir. Además el editor detecta errores de forma antes de compilar, lo que ahorra ciclos de emulador, que es el recurso más caro del proyecto |
| Router | Expo Router (basado en archivos) | Es el router propio del framework que exige RF-06. Deriva la navegación de la estructura de la carpeta `app/`, monta un stack nativo sobre `react-native-screens` y resuelve el botón atrás del sistema Android sin trabajo adicional |
| Persistencia de datos | AsyncStorage | Es la opción que el enunciado declara suficiente. El volumen esperado (decenas de avistamientos) está muy por debajo de lo que justificaría SQLite, y una base de datos relacional agregaría esquema, migraciones y consultas sin ganar ningún punto de la pauta |
| Persistencia de fotografías | Archivo en el directorio de documentos, con el nombre del archivo guardado en AsyncStorage | Decisión desarrollada en la sección 4. En síntesis: la cámara escribe en caché, que el sistema operativo puede vaciar, y AsyncStorage no es un lugar para binarios |
| API de clima | Open-Meteo, endpoint `/v1/forecast` con bloque `current` | Gratuita, sin clave ni registro, sin límite de cuota que administrar. Evita el riesgo de que una clave expuesta en un repositorio público deje de funcionar el día de la revisión |
| Estrategia de la fotografía | Cámara embebida con `CameraView` de `expo-camera` dentro de la propia aplicación | RF-01 exige que la foto se tome en el momento y prohíbe explícitamente elegirla de la galería. Se descarta `expo-image-picker` incluso en modo cámara, porque delega en la aplicación de cámara del sistema y desde el código no se distingue el origen del archivo. Con `CameraView` la captura ocurre dentro de la aplicación y es demostrable en la demo |
| Ubicación legible | `reverseGeocodeAsync` de `expo-location` | Exigido por RF-04. Convierte el par de coordenadas en calle, comuna y región |
| Entorno de demostración | AVD `Pixel_8_API_34`: Android 14, imagen `google_apis_playstore`, cámara trasera `virtualscene` | Permite inyectar coordenadas GPS por el panel de controles extendidos y simular la cámara con la escena virtual del emulador, que es lo que hace demostrable RF-01 sin un dispositivo físico |
| Ordenamiento del listado | Selector con tres criterios: fecha, nombre del ave y cantidad | Cumple RF-03 con holgura y se demuestra en dos toques, sin depender de que haya muchos datos cargados |
| Tercer dato del clima | Humedad relativa | Se solicitan y se guardan los tres valores (temperatura, humedad y viento) porque vienen en la misma respuesta y no cuestan una llamada extra. La humedad relativa es el tercer dato que se exhibe en el detalle |
| Historial de commits | Línea `Co-authored-by` en los mensajes de commit | Decisión del equipo. Ver el riesgo R-07, que documenta la condición técnica para que efectivamente funcione |

---

## 3. Requerimientos traducidos a criterios de aceptación

Cada criterio está redactado para poder marcarse cumplido o no cumplido ejecutando la aplicación.
Ninguno admite la respuesta "más o menos".

### RF-01 Registrar un avistamiento

| ID | Criterio verificable |
|---|---|
| CA-01.1 | Desde el listado existe un control visible que abre el formulario de registro |
| CA-01.2 | El formulario presenta los siete campos del modelo: fotografía, coordenadas, clima, nombre del ave, fecha y hora, cantidad y notas |
| CA-01.3 | Al pulsar el control de cámara se abre una vista de cámara dentro de la aplicación, no la aplicación de cámara del sistema ni la galería |
| CA-01.4 | Tras disparar, la fotografía capturada se muestra como vista previa en el formulario y existe la opción de repetirla |
| CA-01.5 | No existe ninguna ruta en la interfaz que permita adjuntar una imagen ya existente en el dispositivo |
| CA-01.6 | Al abrir el formulario se inicia automáticamente la captura de ubicación, sin intervención del usuario |
| CA-01.7 | Existe además un botón dedicado para volver a capturar la ubicación |
| CA-01.8 | Los campos de latitud y longitud se muestran en modo lectura: no aceptan escritura manual |
| CA-01.9 | El campo de nombre del ave acepta cualquier texto, incluido "no identificada", y con ese valor el avistamiento se guarda sin obstáculos |
| CA-01.10 | La fecha y hora vienen precargadas con el instante de apertura del formulario y el usuario puede modificarlas |
| CA-01.11 | El campo de cantidad solo admite enteros mayores o iguales a 1, y viene precargado en 1 |
| CA-01.12 | Al intentar guardar sin fotografía, la aplicación no guarda y muestra un mensaje que nombra el campo faltante |
| CA-01.13 | Al intentar guardar sin ubicación, la aplicación no guarda y muestra un mensaje que nombra el campo faltante |
| CA-01.14 | Al intentar guardar sin nombre del ave, o con cantidad menor a 1, o sin fecha, la aplicación no guarda y señala el campo |
| CA-01.15 | El mensaje de validación se muestra junto al campo afectado, no solo como alerta global |
| CA-01.16 | Al guardar correctamente, la aplicación confirma la operación y navega de vuelta al listado |
| CA-01.17 | El avistamiento recién creado aparece en la primera posición del listado |

### RF-02 Obtener el clima del avistamiento

| ID | Criterio verificable |
|---|---|
| CA-02.1 | La consulta a Open-Meteo se dispara con las coordenadas ya capturadas, nunca con coordenadas fijas |
| CA-02.2 | Se guardan junto al avistamiento, como mínimo, temperatura, condición climática y humedad relativa |
| CA-02.3 | El clima guardado corresponde al momento del registro y no se vuelve a consultar al abrir el detalle |
| CA-02.4 | El `weather_code` numérico se traduce a texto en español y a un ícono, según la tabla de la sección 7 |
| CA-02.5 | En ninguna pantalla se muestra el `weather_code` como número |
| CA-02.6 | Con el modo avión activado en el emulador, el formulario permite guardar el avistamiento igual, sin clima |
| CA-02.7 | El fallo de clima se comunica como aviso informativo, nunca como error bloqueante |
| CA-02.8 | Un avistamiento guardado sin clima muestra un indicador explícito de clima no disponible, no un espacio en blanco |

### RF-03 Listar los avistamientos

| ID | Criterio verificable |
|---|---|
| CA-03.1 | La pantalla inicial de la aplicación es el listado |
| CA-03.2 | El orden por defecto es del avistamiento más reciente al más antiguo |
| CA-03.3 | Cada elemento muestra miniatura de la fotografía, nombre del ave, fecha del avistamiento y temperatura registrada |
| CA-03.4 | Un elemento sin clima muestra un indicador de temperatura no disponible en lugar de la temperatura |
| CA-03.5 | Existe un selector de ordenamiento con tres criterios: fecha, nombre del ave y cantidad |
| CA-03.6 | Al cambiar el criterio, el listado se reordena de inmediato y el criterio activo queda visualmente marcado |
| CA-03.7 | Sin avistamientos registrados se muestra un estado vacío con ícono, título, texto explicativo y botón de acción hacia el formulario |
| CA-03.8 | El listado ofrece acceso directo y permanente al formulario de registro |
| CA-03.9 | Mientras se leen los datos de AsyncStorage se muestra un estado de carga, no una pantalla en blanco |

### RF-04 Ver el detalle de un avistamiento

| ID | Criterio verificable |
|---|---|
| CA-04.1 | Al pulsar un elemento del listado se abre la pantalla de detalle de ese avistamiento |
| CA-04.2 | La fotografía se muestra en tamaño grande, ocupando el ancho disponible |
| CA-04.3 | Se muestran todos los campos del avistamiento, incluidas las notas cuando existen |
| CA-04.4 | El clima se presenta como texto e ícono legibles, junto a temperatura y humedad con sus unidades |
| CA-04.5 | La ubicación se muestra como dirección legible obtenida con `reverseGeocodeAsync` |
| CA-04.6 | Las coordenadas numéricas se muestran como dato secundario, subordinado a la dirección, nunca como única representación del lugar |
| CA-04.7 | Si el geocodificador inverso falla o no devuelve resultados, se muestra un texto de respaldo explícito y las coordenadas, sin que la pantalla se rompa |
| CA-04.8 | Existe un control para volver al listado, además del gesto y el botón atrás del sistema |

### RF-05 Persistencia

| ID | Criterio verificable |
|---|---|
| CA-05.1 | Tras cerrar por completo la aplicación y reabrirla, el listado conserva todos los avistamientos |
| CA-05.2 | Las miniaturas y las fotografías en tamaño grande siguen visibles tras el reinicio |
| CA-05.3 | Tras cerrar la aplicación, matarla desde la bandeja de recientes y reabrirla, no aparece ningún recuadro de imagen rota |
| CA-05.4 | El clima guardado sigue siendo el del momento del registro y no cambia entre reinicios |

### RF-06 Navegación

| ID | Criterio verificable |
|---|---|
| CA-06.1 | Las tres pantallas están declaradas como rutas de Expo Router |
| CA-06.2 | El botón atrás físico de Android funciona en las tres pantallas |
| CA-06.3 | Desde el detalle se vuelve al listado, y desde el listado el botón atrás sale de la aplicación, no a una pantalla intermedia |
| CA-06.4 | Tras guardar un avistamiento, el formulario no queda en la pila: el botón atrás desde el listado no lo reabre |
| CA-06.5 | Cada pantalla tiene un título propio en la barra de navegación |

### Criterios transversales

| ID | Criterio verificable |
|---|---|
| CA-T.1 | Toda operación asíncrona (cámara, GPS, clima, lectura de almacenamiento) tiene sus estados de carga, error y vacío definidos en la sección 8 e implementados |
| CA-T.2 | Ninguna pantalla presenta un período en que el usuario no sepa si la aplicación está trabajando |
| CA-T.3 | Cada permiso se solicita con una explicación previa de para qué se necesita |
| CA-T.4 | Rechazar cualquier permiso no cierra ni congela la aplicación |
| CA-T.5 | Las dos medidas de optimización de la sección 9 están implementadas y localizables en los archivos allí indicados |
| CA-T.6 | Los tres patrones de la sección 10 están presentes en los archivos allí indicados |
| CA-T.7 | Todo control pulsable mide al menos 48 puntos de alto, para uso con una mano |
| CA-T.8 | El contraste de texto sobre fondo cumple una relación mínima de 4.5:1, para legibilidad bajo sol directo |

---

## 4. Modelo de datos

### Entidad `Avistamiento`

| Campo | Tipo | Obligatorio | Origen | Persistencia |
|---|---|---|---|---|
| `id` | `string` | Sí | Generado en la aplicación al guardar, a partir de la marca de tiempo y un sufijo aleatorio | AsyncStorage, dentro del objeto |
| `nombreAve` | `string` | Sí | Texto libre escrito por el usuario | AsyncStorage |
| `fotoNombreArchivo` | `string` | Sí | Nombre del archivo escrito por la aplicación en el directorio de documentos | AsyncStorage. Ver "Decisión sobre la fotografía" |
| `latitud` | `number` | Sí | GPS del dispositivo vía `expo-location` | AsyncStorage |
| `longitud` | `number` | Sí | GPS del dispositivo vía `expo-location` | AsyncStorage |
| `precisionMetros` | `number \| null` | No | Campo `coords.accuracy` de `expo-location` | AsyncStorage |
| `fechaAvistamiento` | `string` (ISO 8601) | Sí | Instante de apertura del formulario, editable por el usuario | AsyncStorage |
| `cantidad` | `number` (entero >= 1) | Sí | Ingresado por el usuario, valor inicial 1 | AsyncStorage |
| `notas` | `string` | No | Texto libre escrito por el usuario | AsyncStorage, cadena vacía si no se escribe |
| `clima` | `ClimaRegistrado \| null` | No | Open-Meteo, con las coordenadas ya capturadas | AsyncStorage, `null` si la consulta falló |
| `direccion` | `string \| null` | No | `reverseGeocodeAsync`, resuelto al guardar | AsyncStorage. Ver "Decisión sobre la dirección" |
| `fechaCreacion` | `string` (ISO 8601) | Sí | Instante en que se pulsa guardar | AsyncStorage |

### Entidad `ClimaRegistrado`

| Campo | Tipo | Obligatorio | Origen | Persistencia |
|---|---|---|---|---|
| `temperaturaC` | `number` | Sí | `current.temperature_2m` | Anidado en el avistamiento |
| `humedadRelativa` | `number` | Sí | `current.relative_humidity_2m` | Anidado en el avistamiento |
| `vientoKmh` | `number` | Sí | `current.wind_speed_10m` | Anidado en el avistamiento |
| `codigoClima` | `number` | Sí | `current.weather_code` | Anidado en el avistamiento. Se conserva el código crudo además del texto, porque es el dato de origen y permite recalcular la traducción si la tabla cambia |
| `descripcion` | `string` | Sí | Traducción del `codigoClima` mediante la tabla de la sección 7 | Anidado en el avistamiento |
| `icono` | `string` | Sí | Nombre de glifo de MaterialCommunityIcons, según la misma tabla | Anidado en el avistamiento |
| `obtenidoEn` | `string` (ISO 8601) | Sí | Instante de la respuesta de la API | Anidado en el avistamiento |

### Decisión sobre la fotografía

Se persiste el **nombre del archivo**, no la imagen ni la ruta completa. El archivo vive en
`<directorio de documentos>/fotos/<nombre>.jpg`, y la ruta absoluta se reconstruye en tiempo de
lectura concatenando `Paths.document` con ese nombre.

Hay tres razones, y las tres descartan alternativas concretas:

1. **No se guarda el URI que devuelve la cámara.** La documentación de `expo-camera` establece que
   las imágenes capturadas se escriben en el directorio de caché y que en plataformas nativas esos
   archivos son temporales: el sistema operativo puede eliminarlos cuando necesite espacio. Guardar
   ese URI produce exactamente el fallo que RF-05 prohíbe, un listado con recuadros de imagen rota
   después de un reinicio. Por eso, inmediatamente después de disparar, la aplicación **mueve** el
   archivo al directorio de documentos con la API `File` de `expo-file-system`.
2. **No se guarda la imagen en base64 dentro de AsyncStorage.** AsyncStorage es un almacén de pares
   clave-valor de texto pensado para datos pequeños; una fotografía de cámara ocupa varios megabytes
   y en base64 crece alrededor de un tercio más. Se leería y escribiría el conjunto completo de
   avistamientos en cada operación, y el listado se volvería lento justo en la pantalla que evalúa
   RF-03. El sistema de archivos es el lugar correcto para los binarios; la base de datos guarda la
   referencia.
3. **No se guarda la ruta absoluta.** En Android el directorio de documentos de la aplicación cuelga
   de una ruta que pertenece al sistema y que no está garantizada entre instalaciones o
   actualizaciones de la aplicación. Guardar solo el nombre y reconstruir la ruta desde
   `Paths.document` en cada lectura hace que el dato persistido sea independiente de dónde el
   sistema decida montar el directorio.

El borrado de un avistamiento, si se implementa, debe eliminar también su archivo de foto, para no
dejar huérfanos ocupando espacio.

### Decisión sobre la dirección

La dirección legible se resuelve **al guardar** y se persiste, en lugar de resolverse cada vez que
se abre el detalle. Esto convierte un dato que depende de un servicio externo en un dato histórico
estable, igual que el clima, y evita que la pantalla de detalle quede esperando un servicio para
mostrar algo que ya se sabía. Si la resolución falla al guardar, se persiste `null` y el detalle
intenta resolverla una vez más al abrirse, con las coordenadas como respaldo final.

### Forma del almacenamiento

| Clave | Contenido |
|---|---|
| `avistaves:avistamientos:v1` | Arreglo JSON de objetos `Avistamiento`, serializado completo |
| `avistaves:cacheClima:v1` | Objeto JSON de entradas de caché de clima, indexado por coordenada redondeada |

El sufijo `v1` de las claves permite cambiar la forma de los datos más adelante sin leer basura de
una versión anterior.

---

## 5. Arquitectura y estructura de carpetas

La arquitectura sigue una separación en cuatro capas. La regla que la sostiene: **una pantalla
nunca habla directamente con un periférico, con la red ni con el almacenamiento**. Habla con un
hook; el hook habla con un servicio; el servicio es el único que conoce la biblioteca externa.

```
examen-transversal-app-moviles/
├── src/
│   ├── app/                          Rutas de Expo Router. Una pantalla por archivo
│   │   ├── _layout.tsx               Stack raíz y proveedor de contexto global
│   │   ├── index.tsx                 RF-03 Listado de avistamientos
│   │   ├── registro.tsx              RF-01 Formulario de registro
│   │   └── avistamiento/
│   │       └── [id].tsx              RF-04 Detalle de un avistamiento
│   ├── modelos/
│   │   ├── avistamiento.ts           Tipo Avistamiento y sus utilidades de validación
│   │   └── clima.ts                  Tipos ClimaRegistrado y RespuestaOpenMeteo
│   ├── servicios/                    Única capa autorizada a importar bibliotecas externas
│   │   ├── repositorioAvistamientos.ts   Lectura y escritura en AsyncStorage
│   │   ├── servicioFotos.ts              Mover la foto de caché a documentos, resolver rutas
│   │   ├── servicioUbicacion.ts          Permisos, posición actual y geocodificación inversa
│   │   ├── servicioClima.ts              Consulta a Open-Meteo, caché y degradación
│   │   ├── clienteHttp.ts                Fetch con timeout y reintento
│   │   └── cacheClima.ts                 Caché por ubicación con vencimiento
│   ├── hooks/                        Estado y orquestación. Exponen carga, error y datos
│   │   ├── usarAvistamientos.ts
│   │   ├── usarUbicacionActual.ts
│   │   ├── usarClima.ts
│   │   └── usarFormularioAvistamiento.ts
│   ├── contexto/
│   │   └── ContextoAvistamientos.tsx     Estado compartido del listado entre pantallas
│   ├── componentes/                  Presentación pura. Reciben props, no llaman servicios
│   │   ├── TarjetaAvistamiento.tsx
│   │   ├── EstadoVacio.tsx
│   │   ├── EstadoCarga.tsx
│   │   ├── EstadoError.tsx
│   │   ├── CapturadorFoto.tsx
│   │   ├── CampoTexto.tsx
│   │   ├── SelectorOrden.tsx
│   │   ├── InsigniaClima.tsx
│   │   └── BotonPrimario.tsx
│   ├── utilidades/
│   │   ├── tablaClima.ts             Traducción de weather_code a texto e ícono
│   │   ├── estrategiasOrden.ts       Criterios de ordenamiento del listado
│   │   └── formato.ts                Fechas, coordenadas y unidades
│   └── tema/
│       └── tema.ts                   Colores, tipografía y espaciados
├── assets/
├── docs/                             Capturas de la demostración
├── app.json
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── INFORME.md
├── BRIEF.md
├── AGENTS.md
└── CLAUDE.md
```

El proyecto Expo vive en la **raíz del repositorio**, junto a los documentos: `package.json`,
`app.json` y `tsconfig.json` cuelgan directamente de la raíz.

Las rutas viven en `src/app/`, no en `app/`. Esta no fue una decisión nuestra: es la convención que
genera la plantilla `default` de Expo SDK 57, y Expo Router la reconoce igual que a `app/` en la
raíz. Se respeta porque deja **todo** el código fuente bajo `src/`, incluidas las rutas, y porque
pelearse con la plantilla no aporta nada a ningún indicador de la pauta. El alias `@/` que la
plantilla configura en `tsconfig.json` apunta a `src/`, de modo que los componentes se importan como
`@/componentes/TarjetaAvistamiento`.

Esta estructura no es decorativa: es la que hace que los patrones de la sección 10 tengan un lugar
señalable, y la que permite decir en el informe, con el archivo en la mano, dónde ocurre cada cosa.

---

## 6. Mapa de pantallas y navegación

```
                        ┌────────────────────────────────┐
                        │  src/app/_layout.tsx           │
                        │  Stack + ProveedorAvistamientos│
                        └───────────────┬────────────────┘
                                        │
                ┌───────────────────────▼───────────────────────┐
                │  src/app/index.tsx  ·  Listado  (ruta inicial)│
                │  Título: "Avistamientos"                      │
                │  FlatList + SelectorOrden + EstadoVacio       │
                └───────┬───────────────────────────┬───────────┘
                        │ botón "Registrar"         │ pulsar tarjeta
                        │ router.push('/registro')  │ router.push(`/avistamiento/${id}`)
                        ▼                           ▼
        ┌───────────────────────────┐   ┌──────────────────────────────┐
        │  src/app/registro.tsx     │   │ src/app/avistamiento/[id].tsx│
        │  Título: "Nuevo avist."   │   │  Título: nombre del ave      │
        │  Formulario RF-01 + RF-02 │   │  Detalle RF-04               │
        └───────────┬───────────────┘   └──────────────┬───────────────┘
                    │ al guardar                       │ atrás
                    │ router.replace('/')              │ router.back()
                    └──────────────┬───────────────────┘
                                   ▼
                            vuelve al Listado
```

Reglas de navegación:

- El listado es la ruta raíz. El botón atrás del sistema desde el listado sale de la aplicación.
- Del listado al formulario se navega con `push`, de modo que atrás cancela el registro.
- Al guardar con éxito se usa `replace` hacia el listado, para que el formulario no quede en la
  pila y el botón atrás desde el listado no lo reabra (CA-06.4).
- La cámara no es una ruta: es un componente a pantalla completa montado dentro del formulario.
  Así el estado del formulario, que ya puede tener nombre, notas y coordenadas, no se pierde al
  capturar la fotografía.
- El detalle recibe únicamente el `id` por parámetro de ruta y lee el avistamiento del contexto.
  No se pasan objetos por parámetros de navegación: los parámetros de URL son cadenas y serializar
  un avistamiento completo ahí sería frágil.

---

## 7. Contrato con Open-Meteo

### Petición

```
GET https://api.open-meteo.com/v1/forecast
    ?latitude=<latitud>
    &longitude=<longitud>
    &current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code
```

Sin clave de API, sin cabeceras de autenticación, sin registro. Documentación de referencia:
`https://open-meteo.com/en/docs`.

### Respuesta verificada

Ejecutada con las coordenadas de ejemplo, la API devuelve esta estructura:

```json
{
  "latitude": -33.427067,
  "longitude": -70.64276,
  "current_units": {
    "time": "iso8601", "interval": "seconds",
    "temperature_2m": "°C", "relative_humidity_2m": "%",
    "wind_speed_10m": "km/h", "weather_code": "wmo code"
  },
  "current": {
    "time": "2026-09-16T02:15", "interval": 900,
    "temperature_2m": 17.8, "relative_humidity_2m": 62,
    "wind_speed_10m": 1.5, "weather_code": 0
  }
}
```

Dos observaciones que condicionan el diseño:

- La API devuelve las coordenadas de la **celda de grilla** más cercana, no las que se enviaron. Por
  eso el avistamiento guarda las coordenadas del GPS, no las que devuelve el clima.
- El campo `current.interval` vale `900` segundos. La API actualiza el dato cada quince minutos, de
  modo que consultar dos veces dentro de esa ventana devuelve el mismo valor. Este número, y no una
  intuición, es el que fija el vencimiento de la caché de la sección 9.

### Campos que se guardan

Los cuatro del bloque `current` (`temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`,
`weather_code`), más la descripción y el ícono derivados del código, y la marca de tiempo de
obtención. En la lista se muestra la temperatura; en el detalle, temperatura, condición y humedad,
que es el mínimo de RF-02 más el tercer dato a elección.

### Traducción de `weather_code`

Tabla WMO usada por Open-Meteo. Los nombres de ícono corresponden al conjunto MaterialCommunityIcons
de `@expo/vector-icons` y fueron verificados contra el mapa de glifos del paquete instalado.

| Código | Texto en español | Ícono |
|---|---|---|
| 0 | Despejado | `weather-sunny` |
| 1 | Mayormente despejado | `weather-sunny` |
| 2 | Parcialmente nublado | `weather-partly-cloudy` |
| 3 | Nublado | `weather-cloudy` |
| 45 | Niebla | `weather-fog` |
| 48 | Niebla con escarcha | `weather-fog` |
| 51 | Llovizna ligera | `weather-rainy` |
| 53 | Llovizna moderada | `weather-rainy` |
| 55 | Llovizna intensa | `weather-rainy` |
| 56 | Llovizna helada ligera | `weather-snowy-rainy` |
| 57 | Llovizna helada intensa | `weather-snowy-rainy` |
| 61 | Lluvia ligera | `weather-rainy` |
| 63 | Lluvia moderada | `weather-pouring` |
| 65 | Lluvia intensa | `weather-pouring` |
| 66 | Lluvia helada ligera | `weather-snowy-rainy` |
| 67 | Lluvia helada intensa | `weather-snowy-rainy` |
| 71 | Nevada ligera | `weather-snowy` |
| 73 | Nevada moderada | `weather-snowy` |
| 75 | Nevada intensa | `weather-snowy-heavy` |
| 77 | Granos de nieve | `weather-snowy` |
| 80 | Chubascos ligeros | `weather-rainy` |
| 81 | Chubascos moderados | `weather-pouring` |
| 82 | Chubascos violentos | `weather-pouring` |
| 85 | Chubascos de nieve ligeros | `weather-snowy` |
| 86 | Chubascos de nieve intensos | `weather-snowy-heavy` |
| 95 | Tormenta eléctrica | `weather-lightning` |
| 96 | Tormenta con granizo ligero | `weather-hail` |
| 99 | Tormenta con granizo intenso | `weather-hail` |

Cualquier código no listado se traduce como "Condición desconocida" con el ícono
`weather-cloudy`. La tabla vive en `src/utilidades/tablaClima.ts`.

### Timeout, caché y comportamiento ante fallo

| Aspecto | Definición |
|---|---|
| Timeout | 6 segundos por intento, implementado con `AbortController` |
| Reintento | Uno solo, tras 1 segundo de espera, y únicamente ante error de red o timeout. Un `4xx` no se reintenta porque reintentar una petición mal formada solo gasta tiempo |
| Tiempo máximo total | 13 segundos en el peor caso (6 + 1 + 6), tras los cuales se decide sin clima |
| Caché | Por ubicación redondeada a 2 decimales (aproximadamente 1,1 km) con vencimiento de 15 minutos |
| Resultado del fallo | `clima: null` en el avistamiento |
| Efecto sobre el guardado | Ninguno. El avistamiento se guarda igual. La ausencia de clima nunca bloquea RF-01 |
| Aviso al usuario | Mensaje informativo en el formulario: "No se pudo obtener el clima. Puedes guardar igual." con opción de reintentar manualmente |
| Presentación posterior | En el listado, "Sin clima" en lugar de la temperatura. En el detalle, un bloque explícito que indica que no se pudo obtener el clima en ese momento |

La regla que gobierna todo lo anterior: **el clima es un dato deseable, no un requisito**. Ninguna
ruta del código permite que un problema de red impida registrar un avistamiento.

---

## 8. Matriz de estados de carga, error y vacío

| Operación | Carga | Error | Vacío | No aplica / caso especial |
|---|---|---|---|---|
| Lectura del listado desde AsyncStorage | Indicador de actividad centrado con el texto "Cargando avistamientos" | Pantalla de error con el texto "No se pudieron leer los avistamientos guardados" y botón "Reintentar" | Componente `EstadoVacio`: ícono de ave, título "Aún no hay avistamientos", texto "Registra el primero cuando veas un ave en terreno" y botón "Registrar avistamiento" | — |
| Permiso de cámara | Vista neutra mientras el estado del permiso es `null` | Pantalla explicativa con botón "Abrir ajustes" si fue denegado de forma permanente | — | Si está denegado pero es solicitable, se muestra la justificación y el botón "Permitir cámara" |
| Captura de fotografía | Botón de disparo deshabilitado con indicador de actividad mientras se escribe el archivo | Mensaje "No se pudo guardar la fotografía" con botón "Intentar de nuevo"; el formulario conserva el resto de los datos | — | Vista previa con opción "Repetir foto" al completarse |
| Permiso de ubicación | Vista neutra mientras el estado del permiso es `null` | Bloque de ubicación con "Permiso de ubicación denegado" y botón "Abrir ajustes" | — | El formulario sigue usable: el usuario puede llenar los demás campos, aunque no podrá guardar hasta obtener ubicación |
| Obtención de coordenadas GPS | Texto "Obteniendo ubicación" con indicador de actividad dentro del bloque de ubicación | "No se pudo obtener la ubicación" con botón "Reintentar" | — | Timeout propio de 15 segundos: pasado ese plazo se muestra el error, nunca un indicador infinito |
| Geocodificación inversa | El bloque de ubicación muestra las coordenadas mientras resuelve la dirección | La dirección queda en `null` en silencio; se muestran las coordenadas. No se molesta al usuario por un dato accesorio | — | Sin resultados devuelve el mismo respaldo que el error |
| Consulta de clima | Bloque de clima con "Consultando el clima" e indicador de actividad. El botón de guardar permanece habilitado durante toda la consulta | Bloque con "No se pudo obtener el clima. Puedes guardar igual." y botón "Reintentar" | — | Servido desde la caché: se muestra el dato de inmediato, sin estado de carga |
| Guardado del avistamiento | Botón de guardar deshabilitado con indicador de actividad y texto "Guardando" | Mensaje "No se pudo guardar el avistamiento" y botón "Reintentar"; el formulario conserva todos los datos | — | Éxito: confirmación breve y navegación de vuelta al listado |
| Apertura del detalle | Indicador breve mientras se resuelve el avistamiento desde el contexto | "No se encontró el avistamiento" con botón "Volver al listado" | — | — |
| Carga de la imagen en el detalle | Marcador de posición con el color de fondo del tema mientras se decodifica la imagen | Ícono de imagen no disponible con el texto "La fotografía no está disponible" | — | — |

Regla de aplicación general: **ninguna pantalla puede quedar sin los tres estados definidos**.
Cuando un estado no corresponde, se declara explícitamente en la tabla con un guion, no se omite.

---

## 9. Permisos

| Permiso | Momento de la solicitud | Explicación mostrada al usuario | Si se rechaza |
|---|---|---|---|
| Cámara (`expo-camera`, `useCameraPermissions`) | Al pulsar el control de cámara dentro del formulario, no al abrir la aplicación | "AvistAves necesita la cámara para que puedas fotografiar el ave en el momento del avistamiento. La fotografía se guarda solo en tu dispositivo." | El bloque de fotografía muestra el motivo, un botón para volver a solicitarlo y, si el sistema ya no permite solicitarlo, un botón "Abrir ajustes" que lleva a la configuración de la aplicación. El resto del formulario sigue funcionando; solo no se podrá completar el guardado, y así se indica |
| Ubicación en primer plano (`expo-location`, `useForegroundPermissions`) | Al abrir el formulario de registro, antes de intentar la captura automática | "AvistAves necesita tu ubicación para registrar dónde viste el ave y consultar el clima del lugar. No se comparte con nadie ni se usa en segundo plano." | El bloque de ubicación muestra el motivo y un botón para volver a solicitarlo, o "Abrir ajustes" si ya no es solicitable. El formulario sigue usable y los demás campos se conservan |

Principios que rigen ambos casos:

- **Permiso en contexto**: se solicita en el momento en que el usuario hace la acción que lo
  necesita, no en una pantalla de bienvenida. El usuario entiende para qué sirve porque acaba de
  pedirlo.
- **Explicación antes del diálogo del sistema**: la pantalla explica el motivo antes de que aparezca
  el diálogo de Android, de modo que el usuario decide informado.
- **Ninguna denegación cierra la aplicación.** Un permiso rechazado degrada una función concreta y
  lo comunica; nunca deja la pantalla inservible ni provoca un cierre inesperado.
- **Siempre hay una salida.** Toda pantalla de permiso denegado ofrece volver a solicitarlo o abrir
  los ajustes del sistema.
- No se solicita ubicación en segundo plano: la aplicación no la necesita y pedirla sería una
  intrusión injustificada.

---

## 10. Optimización del consumo de la API

Se implementan **dos medidas obligatorias**, ambas localizables en un archivo concreto, más una
tercera que refuerza el indicador sin costo adicional.

### Medida 1 — Caché por ubicación con vencimiento de 15 minutos

**Archivo:** `src/servicios/cacheClima.ts`

Antes de salir a la red, el servicio de clima consulta una caché persistida en AsyncStorage. La
clave es el par de coordenadas redondeado a dos decimales, lo que agrupa en una misma celda todo lo
que ocurra dentro de un radio aproximado de 1,1 km. Si existe una entrada para esa celda con menos
de 15 minutos de antigüedad, se devuelve sin tocar la red.

El vencimiento no es arbitrario: la propia respuesta de Open-Meteo declara `current.interval: 900`,
es decir, el dato se recalcula cada 900 segundos. Consultar antes de que venza ese plazo devuelve
exactamente el mismo valor, de modo que la petición no aportaría información nueva.

Efecto medible: un voluntario que registra varios avistamientos en la misma zona durante una salida
de terreno, que es el escenario real de uso, consume **una** petición en lugar de una por
avistamiento.

### Medida 2 — Timeout de 6 segundos con un único reintento

**Archivo:** `src/servicios/clienteHttp.ts`

Toda petición se envía con un `AbortController` que la cancela a los 6 segundos. Una petición
abortada libera de inmediato el socket y la interfaz, en lugar de quedarse colgada hasta el timeout
por defecto del sistema, que en una red móvil deficiente puede superar el minuto.

Ante un error de red o un timeout se hace **un** reintento, tras 1 segundo de espera. Ante una
respuesta `4xx` no se reintenta: el error es de la petición y repetirla solo gastaría batería y
datos. El costo máximo total queda acotado en 13 segundos, tras los cuales el avistamiento se guarda
sin clima.

Efecto medible: el peor caso está acotado y conocido, en lugar de depender del comportamiento por
defecto de la red.

### Medida 3 — Renderizado eficiente del listado (refuerzo)

**Archivos:** `src/app/index.tsx` y `src/componentes/TarjetaAvistamiento.tsx`

`FlatList` con `keyExtractor` estable por `id`, la tarjeta envuelta en `React.memo` para que un
cambio de criterio de ordenamiento no vuelva a renderizar tarjetas cuyos datos no cambiaron, y el
arreglo ordenado calculado dentro de `useMemo` en lugar de recalcularse en cada render. No es una
optimización de la API, sino de la aplicación, y por eso se presenta como refuerzo y no como una de
las dos medidas exigidas.

---

## 11. Patrones de diseño a demostrar

El indicador exige señalar patrones **presentes en el framework** y mostrarlos **en nuestro propio
código**. Se decide ahora dónde vivirá cada uno, para escribir el código de modo que sean
señalables.

### Patrón 1 — Observador (Observer)

**En el framework:** el modelo de renderizado de React es una implementación de publicación y
suscripción. Un componente que lee un estado queda suscrito a él; cuando ese estado cambia, React
notifica a todos los suscriptores volviéndolos a renderizar. La Context API generaliza el mismo
mecanismo a un árbol completo de componentes: el proveedor publica, y cada `useContext` es una
suscripción.

**En nuestro código:** `src/contexto/ContextoAvistamientos.tsx`. El proveedor mantiene la colección
de avistamientos y la publica. El listado (`src/app/index.tsx`) y el detalle
(`src/app/avistamiento/[id].tsx`) se suscriben con `useContext`. Cuando el formulario guarda un
avistamiento nuevo, ninguna pantalla recibe una notificación manual: el cambio de estado en el
proveedor basta para que el listado se actualice.

**Qué se mostrará en el informe:** el proveedor, el hook `usarAvistamientos` y las dos pantallas
suscritas, con la explicación de por qué el listado se actualiza sin que el formulario le hable.

### Patrón 2 — Fachada (Facade)

**En el framework:** Expo es, en su conjunto, una fachada. Cada módulo (`expo-camera`,
`expo-location`, `expo-file-system`) expone una superficie JavaScript pequeña y uniforme que oculta
dos implementaciones nativas distintas, en Kotlin y en Swift, además de la gestión de permisos y del
ciclo de vida de la actividad de Android. `Location.getCurrentPositionAsync()` es una llamada; por
detrás hay un `FusedLocationProviderClient` de Google Play Services.

**En nuestro código:** `src/servicios/servicioUbicacion.ts`, `src/servicios/servicioClima.ts`,
`src/servicios/servicioFotos.ts` y `src/servicios/repositorioAvistamientos.ts`. Cada uno expone
funciones del dominio (`obtenerUbicacionActual`, `obtenerClimaPara`, `guardarFotoPermanente`) y es
el único archivo del proyecto que importa la biblioteca correspondiente. Una pantalla nunca importa
`expo-location` ni `AsyncStorage`.

**Qué se mostrará en el informe:** el servicio de clima completo, que tras una sola función pública
esconde caché, timeout, reintento, traducción de códigos y degradación sin red; y la constatación
de que ninguna pantalla importa una biblioteca externa.

### Patrón 3 — Compuesto (Composite)

**En el framework:** el árbol de componentes de React Native es un compuesto en el sentido clásico.
Un componente hoja (`Text`) y un componente contenedor (`View`, o uno propio que agrupa otros)
comparten exactamente la misma interfaz: reciben props y devuelven elementos. El cliente que los usa
no distingue entre una hoja y un compuesto, y esa uniformidad es la que permite anidarlos
recursivamente hasta llegar a la jerarquía de vistas nativas de Android.

**En nuestro código:** `src/componentes/TarjetaAvistamiento.tsx` compone `InsigniaClima`, la
miniatura y los bloques de texto; a su vez es una hoja desde el punto de vista de la `FlatList` de
`src/app/index.tsx`, que la trata igual que trataría a un `Text`. Lo mismo ocurre con `EstadoVacio`, que
compone ícono, título, texto y `BotonPrimario`.

**Qué se mostrará en el informe:** la tarjeta y su uso desde el listado, mostrando que el mismo
componente es contenedor y contenido según desde dónde se mire.

### Patrón de reserva — Adaptador (Adapter)

Si sobra espacio en el informe: `src/servicios/servicioClima.ts` contiene una función que traduce la
respuesta cruda de Open-Meteo (`current.temperature_2m`, `weather_code` numérico) al tipo de dominio
`ClimaRegistrado`. Es un adaptador entre una interfaz externa que no controlamos y la interfaz que
nuestra aplicación necesita. No sustituye a ninguno de los tres anteriores, pero el archivo existe
de todos modos y documentarlo no cuesta trabajo extra.

---

## 12. Comparación de frameworks

Los tres frameworks a comparar:

1. **React Native + Expo** — el elegido.
2. **Ionic + Capacitor** — exigido por el enunciado.
3. **Flutter** — tercero elegido por el equipo.

### Eje de comparación

Los tres se comparan sobre un eje único y explícito: **cómo llega el código escrito por el
desarrollador hasta la pantalla y hasta los periféricos del dispositivo**. Es decir, el modelo de
renderizado y el modelo de acceso al hardware.

La elección del eje no es decorativa. Es lo que hace que la sección sea una comparación y no un
listado de ventajas: los tres frameworks resuelven el mismo problema con tres respuestas
estructuralmente distintas, y de esa diferencia se derivan sus fortalezas y sus debilidades.

| Framework | Cómo se dibuja la interfaz | Cómo se accede al hardware |
|---|---|---|
| React Native + Expo | El código JavaScript describe el árbol; el framework instancia **componentes nativos reales** de Android e iOS | Módulos nativos expuestos a JavaScript a través de la capa de interoperabilidad (JSI y la nueva arquitectura) |
| Ionic + Capacitor | La interfaz es **HTML y CSS dentro de un WebView**; los componentes imitan la apariencia nativa | Plugins de Capacitor que hacen de puente entre el WebView y el código nativo |
| Flutter | El framework **dibuja cada píxel** en su propio lienzo con el motor Impeller; no usa los componentes del sistema | Platform channels, un canal de mensajes asíncrono entre Dart y el código nativo |

Cada framework se desarrollará en el informe con fortalezas y debilidades derivadas de su posición
en este eje. Notas de trabajo, a ampliar al redactar:

- **React Native + Expo.** Fortalezas: componentes nativos reales, por lo que la aplicación se ve y
  se comporta como las del sistema; ecosistema JavaScript reutilizable; Expo elimina la
  configuración nativa. Debilidades: la capa de interoperabilidad sigue siendo un punto de fricción
  en cargas intensivas; la dependencia del ciclo de versiones del SDK de Expo condiciona las
  actualizaciones; salir del entorno gestionado tiene un costo real.
- **Ionic + Capacitor.** Fortalezas: una sola base de código para web y móvil, reutilización directa
  de conocimientos de desarrollo web, la curva de entrada más corta de los tres. Debilidades: el
  WebView impone un techo de rendimiento en desplazamiento, animaciones y listas largas; la
  apariencia es una imitación, no la interfaz del sistema; el acceso a periféricos añade un salto
  adicional respecto de los otros dos.
- **Flutter.** Fortalezas: control total del píxel, de modo que la interfaz es idéntica en ambas
  plataformas; compilación a código nativo con rendimiento muy alto; conjunto de widgets muy
  completo. Debilidades: exige aprender Dart, un lenguaje con mucho menos alcance fuera del móvil;
  al no usar componentes del sistema, no hereda automáticamente los cambios de diseño de cada
  versión de Android; el tamaño base del binario es mayor.

Cierre de la sección: por qué, dado el problema concreto (registrar avistamientos con cámara, GPS y
una API pública, en menos de 48 horas y con un equipo que ya conoce JavaScript), la posición de
React Native + Expo en ese eje era la adecuada.

---

## 13. Plan por fases

Punto de partida: madrugada del miércoles 16 de septiembre. Plazo: jueves 17 a las 23:59. La
planificación se mide en **horas de trabajo**, no en días, y contempla dos personas trabajando en
paralelo.

| Fase | Contenido | Horas | Responsable sugerido | Prioridad |
|---|---|---|---|---|
| F0 | Repositorio en GitHub, proyecto Expo creado, emulador levantado y aplicación corriendo. Primer commit de ambos integrantes | 1,5 | Ambos | Imprescindible |
| F1 | Expo Router con las tres rutas y navegación entre ellas. Pantallas con contenido de prueba. Cierra RF-06 | 1,5 | Otton | Imprescindible |
| F2 | Modelo `Avistamiento`, repositorio en AsyncStorage, contexto y listado funcionando con datos reales. Cierra RF-03 y RF-05 parcialmente | 3,0 | Otton | Imprescindible |
| F3 | Cámara con `CameraView`, movimiento del archivo a documentos, vista previa. Cierra la mitad de RF-01 y completa RF-05 | 2,5 | Otton | Imprescindible |
| F4 | GPS, permisos de ubicación, geocodificación inversa y pantalla de detalle. Cierra RF-04 y la otra mitad de RF-01 | 2,0 | Otton | Imprescindible |
| F5 | Servicio de clima con caché, timeout y reintento. Degradación sin red. Cierra RF-02 y la sección 10 | 2,5 | Otton | Imprescindible |
| F6 | Validaciones, mensajes por campo, matriz completa de estados y pantallas de permisos denegados | 2,5 | Ambos | Imprescindible |
| F7 | Diseño para terreno: tema, contraste, jerarquía, áreas de toque de 48 puntos, estado vacío cuidado | 2,0 | Valeria | Alta |
| F8 | Informe: arquitectura del framework, tres patrones con código propio citado, comparación de los tres frameworks, medidas de optimización, declaración del uso de IA | 5,0 | Valeria, en paralelo desde F0 | Imprescindible |
| F9 | Demostración en emulador con capturas, `README.md`, revisión de la checklist y entrega | 2,0 | Ambos | Imprescindible |

**Total estimado:** 24,5 horas de trabajo, repartidas entre dos personas.

### Ventanas propuestas

| Ventana | Contenido |
|---|---|
| Miércoles 09:00 – 13:00 | F0, F1, F2. En paralelo, Valeria arranca F8 con la sección de arquitectura del framework |
| Miércoles 14:00 – 19:00 | F3, F4. En paralelo, F8 sección de comparación de frameworks |
| Miércoles 20:00 – 23:00 | F5. En paralelo, F8 sección de patrones de diseño, que ya puede citar el código de F2 a F4 |
| Jueves 09:00 – 13:00 | F6 y F7 |
| Jueves 14:00 – 18:00 | Cierre de F8, ajustes finales de código |
| **Jueves 18:00** | **Congelamiento del código.** A partir de aquí no se abren funcionalidades nuevas |
| Jueves 18:00 – 21:00 | F9: demostración, capturas, `README.md`, checklist |
| Jueves 21:00 – 23:00 | Revisión final, verificación de la checklist completa y entrega |
| Jueves 23:00 – 23:59 | Colchón. Si se ocupa, algo falló en la planificación |

### Qué se sacrifica si el tiempo se acorta

En este orden, del primero que se corta al último:

1. Borrado de avistamientos. No lo pide ningún RF.
2. Ordenamiento por cantidad. RF-03 exige un criterio y bastan fecha y nombre.
3. Edición de un avistamiento ya guardado. No lo pide ningún RF.
4. Animaciones y transiciones. El diseño se sostiene con contraste, jerarquía y espaciado.
5. La fecha editable pasa a solo lectura con el valor automático. Se pierde parte de CA-01.10, pero
   se conserva el campo obligatorio.

**Nunca se sacrifica**, porque cada uno vale puntos directos de la pauta: el informe completo (34
puntos), las dos medidas de optimización documentadas (10 puntos), la cámara y el GPS reales (10
puntos), y los estados, permisos y validaciones (12 puntos). Si el tiempo aprieta, se recorta
producto, no informe: 34 de los 100 puntos no dependen de que la aplicación esté terminada.

---

## 14. Checklist de entrega

| # | Ítem | Indicador que lo evalúa |
|---|---|---|
| 1 | Repositorio público en GitHub, accesible sin credenciales | Entregable 1 |
| 2 | `README.md` con descripción, requisitos, instalación, ejecución y equipo | Entregable 1 |
| 3 | Ambos integrantes visibles en el historial de commits y en la lista de contribuyentes de GitHub | Requisito de modalidad grupal |
| 4 | `INFORME.md` con la sección de arquitectura de React Native y el rol de Expo, con terminología correcta | Conceptos del framework (10) |
| 5 | `INFORME.md` con los tres patrones de la sección 11, cada uno citando código propio con su ruta de archivo | Patrones de diseño (12) |
| 6 | `INFORME.md` con la comparación de los tres frameworks sobre el eje declarado, con fortalezas y debilidades de cada uno | Comparación de frameworks (12) |
| 7 | Jerarquía visual, contraste y espaciados consistentes en las tres pantallas | Principios de diseño de UI (12) |
| 8 | Formulario, listado con ordenamiento y estado vacío, y navegación con Expo Router | Componentes de UI (12) |
| 9 | Matriz de estados de la sección 8 implementada por completo | Interfaces intuitivas (12) |
| 10 | Permisos de cámara y ubicación con explicación, y sin cierres inesperados al rechazarlos | Interfaces intuitivas (12) |
| 11 | Validaciones por campo con mensajes que nombran el campo faltante | Interfaces intuitivas (12) |
| 12 | Fotografía tomada con `CameraView` y ubicación obtenida con `expo-location`, demostradas en vivo | Uso de periféricos (10) |
| 13 | Clima consultado con las coordenadas capturadas, persistido y mostrado traducido en el detalle | Integración con la API (10) |
| 14 | Las dos medidas de optimización implementadas y documentadas en el informe, con la ruta del archivo donde están | Optimización de la API (10) |
| 15 | Demostración de la aplicación en el emulador con capturas o enlace: registro real con cámara y GPS en vivo | Entregable 2 |
| 16 | Declaración del uso de IA en el informe: qué se usó y para qué | Entregable 3 |
| 17 | Verificación de persistencia: cerrar la aplicación, matarla y reabrirla con las fotos intactas | RF-05 |
| 18 | Verificación en modo avión: el avistamiento se guarda sin clima | RF-02 |

---

## 15. Riesgos y mitigaciones

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R-01 | El emulador no entrega ubicación y `getCurrentPositionAsync` nunca resuelve | Bloquea RF-01 y RF-02, que suman 20 puntos | Mitigado en parte: el AVD `Pixel_8_API_34` usa imagen `google_apis_playstore`, que sí incluye el proveedor de ubicación de Google. Queda fijar la ubicación con `adb emu geo fix -70.6693 -33.4489` **antes** de abrir el formulario, e implementar un timeout propio de 15 segundos en la captura para que el fallo sea visible y no un indicador infinito. Verificar la ubicación en F0, no en F4 |
| R-02 | La cámara del emulador no funciona o da imagen negra | Bloquea la evidencia de RF-01, 10 puntos | Mitigado en parte: el `config.ini` del AVD `Pixel_8_API_34` ya declara `hw.camera.back=virtualscene`. Queda probar la captura real en F0 con una pantalla mínima, antes de construir el formulario. Si la cámara del emulador falla de forma irrecuperable, grabar la demostración en un dispositivo Android físico con Expo Go y dejar constancia del motivo en el informe |
| R-03 | Permisos que el emulador concede o deniega de forma inconsistente entre ejecuciones | Falsos negativos que consumen tiempo de depuración | Probar los tres escenarios de forma deliberada: conceder, denegar y denegar de forma permanente. Restablecer con `adb shell pm reset-permissions`. Documentar el comportamiento observado en el informe |
| R-04 | Open-Meteo caído o sin red durante la demostración | Rompería la demostración de RF-02, 10 puntos | La degradación sin red ya es un requisito (CA-02.6), de modo que el fallo es un caso demostrado y no un accidente. Capturar en las evidencias **ambos** escenarios: con clima y en modo avión sin clima. Una caída de la API se convierte así en parte de la demostración |
| R-05 | Las fotografías no sobreviven al reinicio porque quedaron en el directorio de caché | Rompe RF-05 y arruina la demostración del listado | El movimiento al directorio de documentos es parte de F3, no un ajuste posterior. La verificación número 17 de la checklist (cerrar, matar y reabrir) se ejecuta al cerrar F3 y se repite en F9 |
| R-06 | La ruta absoluta de la fotografía cambia entre reinstalaciones y todas las imágenes se rompen | Rompe RF-05 de forma silenciosa, difícil de detectar | Persistir solo el nombre del archivo y reconstruir la ruta desde `Paths.document` en cada lectura, como establece la sección 4 |
| R-07 | Valeria no queda registrada como contribuyente del repositorio | Incumple un requisito explícito de la modalidad grupal | Se acordó usar la línea `Co-authored-by` en los mensajes de commit. **Condición técnica ineludible:** el correo de esa línea debe ser exactamente el correo verificado de la cuenta de GitHub de Valeria, o su dirección `noreply` de GitHub; con cualquier otro correo, GitHub no la vincula y no aparecerá como contribuyente. Verificar en F0 con un commit de prueba que su avatar aparece en la vista del commit, y volver a verificarlo en F9 sobre la pestaña de contribuyentes. Si la vinculación no funciona, el respaldo es que Valeria haga al menos tres commits como autora principal, uno por cada bloque del informe |
| R-08 | Una versión de paquete incompatible rompe la compilación a mitad de camino | Pérdida de horas en un problema que no da puntos | Instalar siempre con `npx expo install`, que resuelve la versión correspondiente al SDK, y nunca con `npm install` a secas. No actualizar el SDK de Expo durante el desarrollo |
| R-09 | El informe queda para el final y se entrega incompleto | Pérdida de hasta 34 puntos, el bloque más grande de la pauta | El informe corre en paralelo desde F0, a cargo de Valeria, y no depende de que la aplicación esté terminada. Las secciones 11 y 12 de este documento ya contienen su estructura y su contenido base |
| R-10 | Se descubre el jueves por la tarde que un patrón de diseño no es señalable en el código escrito | Pérdida parcial de 12 puntos | Los tres patrones están decididos en la sección 11 con su archivo de destino. El código se escribe para exhibirlos. Al cerrar F5 se verifica que los tres archivos existen y contienen lo prometido |

---

## 16. Pendientes de confirmación

Elementos que este documento no fija porque requieren una decisión o un dato que el equipo debe
aportar:

No queda ningún pendiente abierto. Todos los elementos que este documento dejó sin fijar fueron
resueltos por el equipo:

| # | Elemento | Resolución |
|---|---|---|
| 1 | Repositorio | `https://github.com/ottonlucena/examen-transversal-app-moviles` |
| 2 | Coautoría de Valeria Gómez | Correo aportado por el equipo y configurado en la línea `Co-authored-by` de los commits. Pendiente de **verificar** en GitHub que la vinculación funciona, según R-07 |
| 3 | Reparto de trabajo | Confirmado según la sección 13 |
| 4 | Entorno de demostración | AVD `Pixel_8_API_34`, verificado en el equipo de desarrollo |

La verificación del punto 2 no es un trámite: si GitHub no vincula el correo con la cuenta de
Valeria, la coautoría aparece en el mensaje del commit pero ella no figura como contribuyente, y el
requisito de la modalidad grupal queda incumplido sin que nada lo advierta. Se comprueba en F0 con
el primer commit y se vuelve a comprobar en F9.
