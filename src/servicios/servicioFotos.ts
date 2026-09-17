/**
 * PATRON FACHADA sobre expo-file-system.
 * Unico archivo del proyecto que importa expo-file-system (AGENTS.md, sección 3).
 *
 * Implementa el requisito de persistencia de RF-05. Las cuatro reglas, con su
 * justificacion completa, estan en BRIEF.md sección 4:
 *
 * 1. NUNCA se persiste el URI que devuelve la cámara: vive en el directorio de
 *    cache y el sistema operativo puede eliminarlo cuando necesite espacio.
 * 2. El archivo se MUEVE al directorio de documentos inmediatamente tras la captura.
 * 3. Se persiste SOLO el nombre del archivo, nunca la ruta absoluta: la ruta del
 *    directorio de documentos pertenece al sistema y no esta garantizada entre
 *    instalaciones.
 * 4. NUNCA se guarda la imagen en base64 dentro de AsyncStorage.
 */

import { Directory, File, Paths } from 'expo-file-system';

const CARPETA_FOTOS = 'fotos';

function carpetaDestino(): Directory {
  const carpeta = new Directory(Paths.document, CARPETA_FOTOS);
  if (!carpeta.exists) {
    carpeta.create();
  }
  return carpeta;
}

/**
 * Mueve la foto recien capturada desde la cache al directorio de documentos y
 * devuelve SOLO su nombre de archivo, que es lo que se persiste.
 *
 * En SDK 57 move() devuelve Promise<void>: hay que esperarlo. Verificado en
 * node_modules/expo-file-system/build/internal/NativeFileSystem.types.d.ts.
 */
export async function guardarFotoPermanente(uriDeCache: string): Promise<string> {
  const destino = carpetaDestino();
  const archivo = new File(uriDeCache);

  if (!archivo.exists) {
    throw new Error('La fotografía capturada ya no está disponible');
  }

  await archivo.move(destino);
  return archivo.name;
}

/**
 * Reconstruye la ruta absoluta a partir del nombre persistido.
 * Se llama en cada lectura, nunca se guarda el resultado.
 */
export function resolverUriFoto(nombreArchivo: string): string {
  return new File(Paths.document, CARPETA_FOTOS, nombreArchivo).uri;
}
