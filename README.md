# AvistAves

Aplicación móvil para que los voluntarios de la Red de Observadores de Aves registren avistamientos
en terreno: qué ave vieron, dónde, con qué evidencia fotográfica y bajo qué condiciones climáticas.

Examen transversal de Desarrollo de Aplicaciones Móviles, Instituto Profesional San Sebastián.

---

## Qué hace

Tres pantallas:

- **Listado.** Todos los avistamientos, del más reciente al más antiguo, con miniatura, nombre,
  fecha y temperatura registrada. Se puede ordenar por fecha, nombre o cantidad. Cuando no hay
  registros, muestra un estado vacío con acceso directo al formulario.
- **Registro.** Formulario que captura la fotografía con la cámara del dispositivo, obtiene las
  coordenadas por GPS de forma automática y consulta el clima del momento. Valida antes de guardar
  y señala cada campo faltante junto al campo afectado.
- **Detalle.** Fotografía en tamaño grande, todos los datos del avistamiento, el clima en formato
  legible y la ubicación traducida a una dirección entendible.

Los avistamientos y sus fotografías sobreviven al cierre de la aplicación. Si la API del clima no
responde, el avistamiento se guarda igual, sin clima: un problema de conexión nunca impide registrar.

---

## Stack

| Componente | Versión | Para qué |
|---|---|---|
| Expo | `~57.0.23` | Núcleo del framework, módulos nativos y servidor de desarrollo |
| React Native | `0.86.3` | Traducción del árbol de componentes a vistas nativas |
| React | `19.2.3` | Motor de componentes y de estado |
| TypeScript | `~6.0.3` | Tipado estático |
| Expo Router | `~57.0.21` | Navegación basada en archivos |
| expo-camera | `~57.0.5` | Captura fotográfica |
| expo-location | `~57.0.18` | GPS y geocodificación inversa |
| expo-file-system | `~57.0.7` | Persistencia de los archivos de fotografía |
| AsyncStorage | `2.2.0` | Persistencia de los datos |

Todas las versiones corresponden al Expo SDK 57 y están verificadas contra el archivo
`bundledNativeModules.json` del paquete `expo`, que es la fuente que consulta `npx expo install`.

**API del clima:** [Open-Meteo](https://open-meteo.com/en/docs), gratuita y sin clave de acceso.

---

## Requisitos

- Node.js 20 o superior
- Android Studio con un dispositivo virtual (AVD) configurado, o un teléfono Android con Expo Go
- El AVD debe usar una **imagen con Google APIs**. Las imágenes AOSP no incluyen el proveedor de
  ubicación de Google y la captura de coordenadas no funcionará.

---

## Instalación y ejecución

```bash
git clone https://github.com/ottonlucena/examen-transversal-app-moviles.git
cd examen-transversal-app-moviles
npm install
npx expo start
```

Con el servidor levantado:

- **En el emulador:** pulsar `a` en la terminal, o `npx expo start --android`.
- **En un teléfono físico:** instalar **Expo Go** desde Google Play y escanear el código QR. El
  teléfono y el computador deben estar en la misma red. Si la red bloquea la conexión entre
  dispositivos, usar `npx expo start --tunnel`.

### Simular la ubicación en el emulador

```bash
adb emu geo fix -70.6693 -33.4489
```

El comando recibe **primero la longitud y después la latitud**, al revés del orden habitual. El
emulador descarta el envío si en ese instante nadie está escuchando el proveedor GPS, de modo que
conviene repetirlo mientras se prueba la captura de ubicación.

Si la aplicación muestra "Cannot connect to Expo CLI" en el emulador, mapear el puerto:

```bash
adb reverse tcp:8081 tcp:8081
```

### Otros comandos

| Acción | Comando |
|---|---|
| Revisar tipos | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Diagnóstico de dependencias | `npx expo-doctor` |
| Limpiar la caché del empaquetador | `npx expo start --clear` |

Las dependencias se instalan siempre con `npx expo install`, nunca con `npm install <paquete>`:
`expo install` resuelve la versión que corresponde al SDK, mientras que `npm install` trae la última
publicada, que puede pertenecer a otro SDK y romper la compilación nativa.

---

## Estructura del proyecto

```
src/
├── app/                      Rutas de Expo Router, una pantalla por archivo
│   ├── _layout.tsx           Stack raíz y proveedor del estado compartido
│   ├── index.tsx             Listado de avistamientos
│   ├── registro.tsx          Formulario de registro
│   └── avistamiento/[id].tsx Detalle de un avistamiento
├── modelos/                  Tipos del dominio y validaciones puras
├── servicios/                Única capa autorizada a usar bibliotecas externas y la red
├── hooks/                    Estado y orquestación
├── contexto/                 Estado compartido entre pantallas
├── componentes/              Presentación pura
├── utilidades/               Funciones puras: formato, traducción de códigos, ordenamiento
└── tema/                     Colores, tipografía y espaciados
```

La regla que sostiene la arquitectura: **una pantalla nunca llama directamente a un periférico, a la
red ni al almacenamiento.** Habla con un hook, el hook habla con un servicio, y el servicio es el
único que conoce la biblioteca externa. Las dos excepciones existen porque `CameraView` es un
componente y `useForegroundPermissions` es un hook, y ninguno de los dos puede invocarse desde fuera
del árbol de React; ambas están documentadas y acotadas en `AGENTS.md`.

---

## Documentación del proyecto

| Documento | Contenido |
|---|---|
| [INFORME.md](INFORME.md) | Informe técnico: arquitectura del framework, patrones de diseño, comparación de frameworks, medidas de optimización, demostración y declaración del uso de IA |
| [BRIEF.md](BRIEF.md) | Análisis y plan: criterios de aceptación, modelo de datos, contrato con la API, matriz de estados, permisos y riesgos |
| [AGENTS.md](AGENTS.md) | Reglas técnicas: stack, comandos, arquitectura, convenciones y definición de terminado |

---

## Equipo

- Otton Lucena
- Valeria Gómez
