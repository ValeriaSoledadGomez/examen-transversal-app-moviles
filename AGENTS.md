# AGENTS.md — Reglas técnicas del repositorio AvistAves

Reglas obligatorias para cualquier persona o agente que escriba código en este repositorio. El
análisis, las decisiones y el plan están en `BRIEF.md`; este documento define **cómo** se escribe el
código que implementa ese plan.

Ante una contradicción entre este documento y una costumbre personal, manda este documento.

> Advertencia heredada de la plantilla de Expo: el SDK cambia entre versiones mayores. Ante
> cualquier duda sobre una API, consultar la documentación **versionada** en
> `https://docs.expo.dev/versions/v57.0.0/`, no una respuesta de memoria ni un tutorial antiguo.

---

## 1. Stack

Todas las versiones de esta tabla fueron verificadas contra el registro de npm y contra el archivo
`bundledNativeModules.json` del paquete `expo@57.0.23`, que es la fuente que usa `npx expo install`
para resolver las versiones compatibles con el SDK.

### Base

| Paquete | Versión | Para qué sirve |
|---|---|---|
| `expo` | `~57.0.23` | Núcleo del framework. Aporta el sistema de módulos nativos, el servidor de desarrollo, el empaquetador y la configuración de la aplicación |
| `react` | `19.2.3` | Motor de componentes y de estado |
| `react-native` | `0.86.3` | Capa que traduce el árbol de componentes a vistas nativas de Android |
| `typescript` | `~6.0.3` | Tipado estático |
| `@types/react` | `~19.2.2` | Definiciones de tipos de React |

### Navegación

| Paquete | Versión | Para qué sirve |
|---|---|---|
| `expo-router` | `~57.0.21` | Router basado en archivos. Deriva las rutas de la carpeta `src/app/`. Cumple RF-06 |
| `react-native-screens` | `~4.26.0` | Contenedores de pantalla nativos que usa el stack por debajo |
| `react-native-safe-area-context` | `~5.7.0` | Márgenes seguros frente a la barra de estado y la barra de gestos |
| `expo-linking` | `~57.0.10` | Resolución de esquemas de URL que el router necesita |
| `expo-constants` | `~57.0.18` | Acceso a la configuración de `app.json` en tiempo de ejecución |

### Periféricos y datos

| Paquete | Versión | Para qué sirve |
|---|---|---|
| `expo-camera` | `~57.0.5` | Componente `CameraView` y permisos de cámara. RF-01 |
| `expo-location` | `~57.0.18` | Posición GPS, permisos de ubicación y `reverseGeocodeAsync`. RF-01 y RF-04 |
| `expo-file-system` | `~57.0.7` | API `File`, `Directory` y `Paths`. Mueve la fotografía del directorio de caché al de documentos. RF-05 |
| `@react-native-async-storage/async-storage` | `2.2.0` | Almacén clave-valor persistente para los avistamientos y la caché de clima. RF-05 |
| `expo-image` | `~57.0.5` | Componente de imagen con caché en memoria y en disco, y marcador de posición durante la decodificación |
| `@expo/vector-icons` | `^15.0.2` | Íconos. Se usa el conjunto MaterialCommunityIcons para los estados del clima |
| `expo-status-bar` | `~57.0.1` | Control de la barra de estado |

### Traídas por la plantilla

La plantilla `default` de Expo SDK 57 instala además estos paquetes. **No se desinstalan**: varios
son dependencias del propio `expo-router` y quitarlos rompería la navegación. No se usan de forma
directa en nuestro código salvo que este documento diga lo contrario.

| Paquete | Por qué está |
|---|---|
| `@expo/ui`, `expo-symbols`, `expo-glass-effect` | Dependencias directas de `expo-router` |
| `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler` | Animaciones y gestos que usa el stack de navegación |
| `expo-splash-screen`, `expo-system-ui`, `expo-font` | Arranque, tema del sistema y tipografías |
| `react-native-web`, `react-dom` | Soporte web de la plantilla. Fuera del alcance de esta entrega, pero inofensivo |
| `expo-device`, `expo-web-browser` | Sin uso en este proyecto |

### Reglas de instalación

- **Siempre** `npx expo install <paquete>`. Nunca `npm install <paquete>` a secas: `expo install`
  resuelve la versión que corresponde al SDK instalado, y `npm install` trae la última publicada,
  que puede pertenecer a otro SDK y romper la compilación nativa.
- No se actualiza el SDK de Expo durante el desarrollo de esta entrega.
- No se agrega ninguna dependencia que no esté en las tablas anteriores sin proponerlo antes y sin
  agregarla aquí.

---

## 2. Comandos del proyecto

### Estado de la creación inicial

El proyecto **ya está creado** en la raíz del repositorio. Esta sección queda como registro de cómo
se hizo, por si hubiera que rehacerlo.

La raíz del repositorio no estaba vacía (ya contenía `BRIEF.md`, `AGENTS.md`, `CLAUDE.md` y
`.gitignore`) y `create-expo-app` exige un directorio vacío, de modo que el proyecto se generó aparte
y se trasladó:

```bash
cd ~/Escritorio
npx create-expo-app@latest avistaves-tmp --template default
rsync -a --exclude node_modules --exclude .git --exclude .gitignore \
      --exclude README.md --exclude LICENSE --exclude AGENTS.md --exclude CLAUDE.md \
      avistaves-tmp/ EXAMEN-TRANSVERSAL-APP-MOVILES/
rm -rf avistaves-tmp
cd EXAMEN-TRANSVERSAL-APP-MOVILES && npm install
```

**Las exclusiones de `AGENTS.md` y `CLAUDE.md` no son opcionales.** La plantilla de Expo trae sus
propias versiones de ambos archivos y sobrescribe las nuestras sin avisar. El `.gitignore` de la
plantilla también se excluye: el nuestro cubre cosas que la plantilla no conoce.

La plantilla `default` ya viene con Expo Router y TypeScript configurados, y coloca las rutas en
**`src/app/`**, no en `app/`. Trae pantallas de ejemplo (`index.tsx`, `explore.tsx`), componentes de
demostración en `src/components/` y hooks en `src/hooks/`: todo eso se elimina por completo antes
del primer commit de código propio y se reemplaza por la estructura de `BRIEF.md`.

La plantilla configura en `tsconfig.json` el alias `@/*` apuntando a `src/*`. Se usa siempre en las
importaciones: `@/servicios/servicioClima`, no rutas relativas con `../../`.

### Trabajo diario

| Acción | Comando |
|---|---|
| Instalar dependencias | `npm install` |
| Agregar una dependencia | `npx expo install <paquete>` |
| Levantar el servidor de desarrollo | `npx expo start` |
| Levantar y abrir en el emulador | `npx expo start --android` |
| Abrir en el emulador con el servidor ya corriendo | Pulsar `a` en la terminal |
| Limpiar la caché del empaquetador | `npx expo start --clear` |
| Revisar tipos | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Diagnóstico de dependencias | `npx expo-doctor` |

### Emulador de Android

| Acción | Comando |
|---|---|
| Listar los AVD disponibles | `~/Android/Sdk/emulator/emulator -list-avds` |
| Arrancar el AVD del proyecto | `~/Android/Sdk/emulator/emulator -avd Pixel_8_API_34 &` |
| Verificar que el dispositivo está conectado | `adb devices` |
| Fijar la ubicación simulada | `adb emu geo fix <longitud> <latitud>` |
| Restablecer los permisos de la aplicación | `adb shell pm reset-permissions` |
| Ver los registros de la aplicación | `npx expo start` y leer la terminal, o `adb logcat` |

**AVD de la demostración: `Pixel_8_API_34`.** Ya existe en este equipo y cumple las dos condiciones
que el proyecto necesita, verificadas en su `config.ini`: imagen `google_apis_playstore` de
Android 14, que incluye el proveedor de ubicación de Google, y cámara trasera `virtualscene`. El
otro AVD disponible, `Pixel_6_API_33`, también sirve como respaldo, pero tiene la mitad de memoria
(2 GB frente a 4 GB).

Dos advertencias sobre el emulador:

1. `adb emu geo fix` recibe **primero la longitud y después la latitud**, al revés del orden en que
   se escriben normalmente las coordenadas. Para Santiago: `adb emu geo fix -70.6693 -33.4489`.
2. Si hubiera que crear un AVD nuevo, debe usar una imagen **con Google APIs**. Las imágenes AOSP no
   incluyen el proveedor de ubicación de Google y `getCurrentPositionAsync` puede no resolver nunca.
   La cámara trasera debe quedar configurada como `VirtualScene` o `Webcam0`.

### Compilación

**Entorno de ejecución: Expo Go.** La aplicación usa solo módulos del SDK de Expo, que Expo Go trae
incorporados, de modo que no hace falta un build de desarrollo y el ciclo de trabajo es recargar en
lugar de recompilar. Consecuencia a tener presente: en Expo Go los diálogos de permiso los presenta
Expo Go, no nuestra aplicación, así que los textos de justificación configurados en `app.json` no se
ven. Nuestras propias pantallas de explicación previa (sección 6) sí se ven, y son las que evalúa la
pauta.

| Acción | Comando | Nota |
|---|---|---|
| Build de desarrollo local | `npx expo run:android` | Genera el proyecto nativo en `android/` y compila con Gradle. Requiere el SDK de Android y JDK 17 o superior. Solo si hiciera falta código nativo; para esta entrega no debería hacer falta |
| APK instalable en la nube | `eas build -p android --profile preview` | Requiere `npm install -g eas-cli` y una cuenta de Expo. **Opcional.** No es un entregable de este examen y no se intenta antes del congelamiento del código |

---

## 3. Reglas de arquitectura

### La regla central

**Una pantalla nunca llama directamente a un periférico, a la red ni al almacenamiento.**

El flujo obligatorio es siempre el mismo:

```
Pantalla (src/app/)  →  Hook (src/hooks/)  →  Servicio (src/servicios/)  →  Biblioteca externa
```

### Qué va en cada capa

| Capa | Carpeta | Responsabilidad | Prohibido |
|---|---|---|---|
| Rutas y pantallas | `src/app/` | Componer componentes, decidir qué se muestra según el estado que entrega un hook, navegar | Importar `expo-camera`, `expo-location`, `expo-file-system`, `AsyncStorage` o llamar a `fetch` |
| Hooks | `src/hooks/` | Sostener estado, orquestar llamadas a servicios, exponer `cargando`, `error` y datos | Contener JSX, o conocer los detalles de una biblioteca externa |
| Servicios | `src/servicios/` | Única capa autorizada a importar bibliotecas externas y a llamar a la red | Contener JSX, o guardar estado de interfaz |
| Componentes | `src/componentes/` | Presentación. Reciben props y devuelven JSX | Llamar a un servicio, leer de AsyncStorage o pedir permisos |
| Modelos | `src/modelos/` | Tipos del dominio y validaciones puras | Importar cualquier cosa que no sea otro modelo |
| Utilidades | `src/utilidades/` | Funciones puras: formato, traducción de códigos, criterios de ordenamiento | Efectos secundarios de cualquier tipo |
| Tema | `src/tema/` | Colores, tipografías, espaciados y tamaños | Lógica |

### Dónde vive exactamente cada acceso externo

| Acceso | Archivo autorizado | Nadie más lo importa |
|---|---|---|
| Cámara (`expo-camera`) | `src/componentes/CapturadorFoto.tsx` para el componente `CameraView`, y `src/servicios/servicioFotos.ts` para el archivo resultante | `expo-camera` |
| Ubicación y geocodificación (`expo-location`) | `src/servicios/servicioUbicacion.ts` | `expo-location` |
| Sistema de archivos (`expo-file-system`) | `src/servicios/servicioFotos.ts` | `expo-file-system` |
| Almacenamiento (`AsyncStorage`) | `src/servicios/repositorioAvistamientos.ts` y `src/servicios/cacheClima.ts` | `@react-native-async-storage/async-storage` |
| Red (`fetch`) | `src/servicios/clienteHttp.ts` | `fetch` |
| API de clima | `src/servicios/servicioClima.ts`, que usa `clienteHttp` y `cacheClima` | La URL de Open-Meteo |

`CapturadorFoto.tsx` es la única excepción a la regla de que los componentes no tocan bibliotecas
externas, y lo es por una razón técnica: `CameraView` es un componente, no una función, y no puede
envolverse en un servicio. Su alcance está acotado: monta la vista de cámara, dispara y entrega el
URI resultante por callback. **No** mueve el archivo, **no** lo persiste y **no** conoce el modelo
`Avistamiento`. Todo eso ocurre en `servicioFotos.ts`.

### Cómo se verifica que la regla se cumple

```bash
grep -rn "expo-camera\|expo-location\|expo-file-system\|async-storage" src/app/ src/componentes/
```

La única línea que puede aparecer es la importación de `expo-camera` en `CapturadorFoto.tsx`.
Cualquier otro resultado es una violación de la arquitectura que hay que corregir antes de dar la
tarea por terminada.

---

## 4. Convenciones de código y de nombres

### Idioma

- **El dominio se nombra en español.** `Avistamiento`, `nombreAve`, `obtenerUbicacionActual`,
  `guardarAvistamiento`, `TarjetaAvistamiento`, `cantidadEjemplares`.
- Las APIs de las bibliotecas se usan con su nombre original, en inglés. No se traducen
  `useState`, `FlatList` ni `getCurrentPositionAsync`.
- Los comentarios, los mensajes de commit y todo el texto de la interfaz van en español.
- Sin emojis, ni en el código ni en la interfaz ni en la documentación. Los íconos se resuelven con
  `@expo/vector-icons`.

### Nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes y tipos | PascalCase | `TarjetaAvistamiento`, `ClimaRegistrado` |
| Funciones y variables | camelCase | `obtenerClimaPara`, `avistamientosOrdenados` |
| Hooks | `usar` + sustantivo, camelCase | `usarAvistamientos`, `usarUbicacionActual` |
| Servicios | `servicio` + dominio, o `repositorio` + entidad | `servicioClima.ts`, `repositorioAvistamientos.ts` |
| Constantes de módulo | MAYÚSCULAS con guion bajo | `TIEMPO_ESPERA_MS`, `VIGENCIA_CACHE_MS` |
| Archivos de componentes | PascalCase, extensión `.tsx` | `EstadoVacio.tsx` |
| Archivos de servicios, hooks y utilidades | camelCase, extensión `.ts` | `servicioFotos.ts` |
| Archivos de ruta | minúsculas, según Expo Router | `index.tsx`, `registro.tsx`, `[id].tsx` |
| Claves de AsyncStorage | `avistaves:<dominio>:v<n>` | `avistaves:avistamientos:v1` |

### Estilo

- Componentes de función con hooks. Nada de componentes de clase.
- Un componente exportado por archivo, como exportación por defecto.
- Estilos con `StyleSheet.create` al final del archivo. Nada de objetos de estilo en línea, salvo un
  valor que dependa del estado en tiempo de ejecución.
- Todo color, espaciado y tamaño de fuente sale de `src/tema/tema.ts`. Ningún literal de color
  suelto en un componente.
- Importaciones con el alias `@/`, no con rutas relativas del tipo `../../`.
- Sin `any`. Si un tipo no se conoce, se usa `unknown` y se estrecha.
- Sin números mágicos: los tiempos de espera, las vigencias y los límites son constantes con nombre.
- Todo `catch` hace algo con el error: lo registra, lo convierte en estado de error o lo degrada de
  forma deliberada y documentada. Un `catch` vacío no pasa revisión.

---

## 5. Patrón obligatorio para toda operación asíncrona

Ninguna pantalla puede quedar sin sus tres estados. Esta regla no admite excepciones: es lo que
evalúa el indicador de interfaces intuitivas, y es la diferencia entre una aplicación y una demo.

### Forma del estado

Todo hook que hace algo asíncrono expone, como mínimo:

```ts
{
  datos: T | null,
  cargando: boolean,
  error: string | null,
  reintentar: () => void
}
```

`reintentar` es obligatorio siempre que el error sea recuperable. Un error sin salida es un callejón
sin salida para el usuario.

### Orden de evaluación en la pantalla

Siempre en este orden, sin saltarse ninguno:

```
1. cargando        → <EstadoCarga />        nunca una pantalla en blanco
2. error           → <EstadoError />        con mensaje en español y botón de reintentar
3. datos vacíos    → <EstadoVacio />        con ícono, título, explicación y acción
4. datos           → el contenido real
```

### Reglas adicionales

- Toda espera visible dura como máximo un tiempo acotado y conocido. Si una operación puede colgarse
  (GPS, red), lleva su propio timeout. No existen los indicadores de actividad infinitos.
- Un botón que dispara una operación asíncrona se deshabilita mientras la operación corre y muestra
  su propio indicador. Nunca se permite un doble disparo.
- Los mensajes de error son en español, describen qué pasó y qué puede hacer el usuario. "Error:
  undefined" no es un mensaje de error.
- Un fallo en un dato accesorio (clima, dirección) no genera un estado de error de pantalla
  completa: genera un aviso local y la pantalla sigue usable.
- Las tres pantallas deben tener sus tres estados verificados en el emulador antes de darse por
  terminadas. La matriz completa, operación por operación, está en la sección 8 de `BRIEF.md`.

---

## 6. Reglas de permisos

- Todo permiso se solicita **en el momento en que se necesita**, no al arrancar la aplicación.
- Antes del diálogo del sistema, la pantalla muestra una explicación propia de para qué se necesita
  el permiso. El usuario decide informado.
- Se usan los hooks de permisos de Expo: `useCameraPermissions` de `expo-camera` y
  `useForegroundPermissions` de `expo-location`. No se llaman las funciones imperativas
  directamente desde una pantalla.
- Se distinguen **tres** estados, no dos: concedido, denegado pero solicitable de nuevo, y denegado
  de forma permanente. El tercero no puede resolverse con otra solicitud: hay que ofrecer un botón
  que abra los ajustes de la aplicación.
- **Rechazar un permiso nunca cierra ni congela la aplicación.** Degrada una función concreta, lo
  comunica en español y deja el resto de la pantalla usable.
- No se solicita ubicación en segundo plano. La aplicación no la necesita.
- Los textos de justificación de cada permiso están redactados en la sección 9 de `BRIEF.md` y se
  usan tal cual.

---

## 7. Reglas de la API del clima

- La URL, los parámetros y los campos que se guardan están fijados en la sección 7 de `BRIEF.md`.
  No se cambian sin actualizar ese documento.
- **La consulta de clima nunca bloquea el guardado de un avistamiento.** Esta es la regla más
  importante de esta sección. Cualquier implementación en la que un fallo de red impida guardar es
  incorrecta, por muy elegante que sea.
- Toda petición pasa por `clienteHttp.ts`, con timeout de 6 segundos por `AbortController` y un
  único reintento tras 1 segundo, solo ante error de red o timeout. Un `4xx` no se reintenta.
- Antes de salir a la red se consulta `cacheClima.ts`. Clave: coordenadas redondeadas a dos
  decimales. Vigencia: 15 minutos, justificada por el campo `current.interval: 900` de la respuesta
  de la API.
- El `weather_code` se traduce con la tabla de `src/utilidades/tablaClima.ts`. **Nunca se muestra el
  número en la interfaz.** Un código no contemplado devuelve "Condición desconocida" con el ícono
  `weather-cloudy`, jamás `undefined` ni una pantalla rota.
- El clima se guarda como dato histórico del momento del registro. **No se vuelve a consultar al
  abrir el detalle.**
- Un fallo de clima produce `clima: null` en el avistamiento y un aviso informativo, nunca un error
  bloqueante.
- El botón de guardar permanece habilitado mientras la consulta de clima está en curso.
- Se guardan las coordenadas del GPS, no las que devuelve Open-Meteo: la API responde con las de la
  celda de grilla más cercana, que no son las que se enviaron.

---

## 8. Reglas de persistencia y de archivos de fotos

### AsyncStorage

- Solo `repositorioAvistamientos.ts` y `cacheClima.ts` lo importan.
- Claves con el formato `avistaves:<dominio>:v<n>`. El sufijo de versión no es opcional.
- Toda lectura pasa por `JSON.parse` dentro de un `try/catch`. Un valor corrupto devuelve el valor
  por defecto (arreglo vacío) y registra el problema; no hace caer la aplicación.
- La colección se lee completa, se modifica en memoria y se escribe completa. Es aceptable para el
  volumen de esta aplicación y evita estados intermedios inconsistentes.

### Fotografías

Estas cuatro reglas implementan el requisito de persistencia de RF-05 y están justificadas en la
sección 4 de `BRIEF.md`:

1. **Nunca se persiste el URI que devuelve `takePictureAsync`.** Ese archivo vive en el directorio de
   caché y el sistema operativo puede eliminarlo.
2. Inmediatamente después de la captura, `servicioFotos.ts` **mueve** el archivo a
   `<Paths.document>/fotos/` con la API `File` de `expo-file-system`. En SDK 57, `move()` y
   `copy()` devuelven `Promise<void>`: **hay que esperarlos con `await`**. Varios ejemplos de la
   documentación genérica los muestran como llamadas síncronas; verificado contra
   `node_modules/expo-file-system/build/internal/NativeFileSystem.types.d.ts`. En cambio `exists`
   es una propiedad booleana y `create()` sí es síncrono.
3. **Se persiste solo el nombre del archivo**, nunca la ruta absoluta. La ruta se reconstruye en
   cada lectura concatenando `Paths.document` con el nombre, porque la ruta del directorio de
   documentos pertenece al sistema y no está garantizada entre instalaciones.
4. **Nunca se guarda una imagen en base64 dentro de AsyncStorage.** Los binarios van al sistema de
   archivos; la base de datos guarda la referencia.

Si se implementa el borrado de avistamientos, debe eliminar también el archivo de la fotografía.

### Verificación obligatoria

Cualquier tarea que toque fotografías o persistencia no está terminada hasta haber ejecutado esta
secuencia en el emulador:

1. Registrar un avistamiento con fotografía.
2. Cerrar la aplicación y matarla desde la bandeja de recientes.
3. Reabrirla y comprobar que el avistamiento y su fotografía siguen ahí, sin recuadros rotos.

---

## 9. Definición de terminado

Una tarea está terminada cuando **todas** estas condiciones se cumplen. No hay terminado parcial.

1. El código compila: `npx tsc --noEmit` pasa sin errores.
2. La aplicación **se ejecutó en el emulador** y quien hizo la tarea **vio funcionar** el
   comportamiento nuevo. Que compile no es que funcione.
3. Los criterios de aceptación correspondientes de la sección 3 de `BRIEF.md` están verificados uno
   por uno, no supuestos.
4. Los tres estados (carga, error, vacío) de toda operación asíncrona que la tarea introduce están
   implementados y **se probaron provocando el fallo**, no solo el camino feliz. Para el clima, eso
   significa probar con el modo avión activado.
5. Si la tarea toca permisos, se probaron los tres escenarios: conceder, denegar y denegar de forma
   permanente.
6. Si la tarea toca fotografías o persistencia, se ejecutó la secuencia de verificación de la
   sección 8.
7. No hay violaciones de la regla de arquitectura: el `grep` de la sección 3 no devuelve nada
   inesperado.
8. No quedan `console.log` de depuración, código comentado ni archivos temporales.
9. Todo texto visible para el usuario está en español y sin emojis.
10. Si la tarea implementa una de las medidas de optimización o uno de los patrones de diseño, el
    archivo prometido en las secciones 10 y 11 de `BRIEF.md` existe y contiene lo prometido.

---

## 10. Prohibido

1. Llamar a un periférico, a la red o al almacenamiento desde un archivo de `src/app/` o de
   `src/componentes/`, con la única excepción documentada de `CapturadorFoto.tsx`.
2. Usar la galería o un selector de imágenes para obtener la fotografía. RF-01 exige captura con la
   cámara en el momento, y `expo-image-picker` no permite demostrar el origen del archivo.
3. Persistir el URI de caché de la cámara, la ruta absoluta de la foto, o la imagen en base64 dentro
   de AsyncStorage.
4. Mostrar el `weather_code` como número en cualquier parte de la interfaz.
5. Mostrar la ubicación únicamente como coordenadas en la pantalla de detalle. RF-04 exige
   `reverseGeocodeAsync`.
6. Bloquear el guardado de un avistamiento por un fallo de red, de la API del clima o de la
   geocodificación.
7. Dejar una operación asíncrona sin sus estados de carga, error y vacío.
8. Dejar un indicador de actividad sin timeout que pueda girar de forma indefinida.
9. Dejar un mensaje de error en inglés, o que muestre el objeto de error crudo al usuario.
10. Escribir un `catch` vacío o que solo silencie el error.
11. Usar `any` en TypeScript.
12. Escribir un color, un espaciado o un tamaño de fuente como literal suelto en un componente, en
    lugar de tomarlo de `src/tema/tema.ts`.
13. Agregar una dependencia que no esté en la sección 1 sin proponerlo antes.
14. Instalar un paquete de Expo con `npm install` en lugar de `npx expo install`.
15. Actualizar el SDK de Expo durante el desarrollo de esta entrega.
16. Escribir un área pulsable de menos de 48 puntos de alto. La aplicación se usa en terreno, con una
    mano.
17. Usar emojis en el código, en la interfaz o en la documentación.
18. Versionar archivos de configuración local del editor, `node_modules/`, la carpeta `android/`
    generada, credenciales, o cualquier archivo con datos personales. El `.gitignore` de la raíz ya
    los cubre: si hay que excluir algo nuevo, se agrega ahí y no se deja al criterio de cada uno.
19. Hacer `commit` o `push` sin que el equipo lo pida de forma explícita.
20. Dar una tarea por terminada sin haberla visto funcionar en el emulador.
