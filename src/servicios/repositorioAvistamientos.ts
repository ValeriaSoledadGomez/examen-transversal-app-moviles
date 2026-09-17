/**
 * PATRON FACHADA sobre AsyncStorage.
 * Unico archivo, junto a cacheClima.ts, que importa AsyncStorage
 * (AGENTS.md, sección 3).
 *
 * La coleccion se lee completa, se modifica en memoria y se escribe completa.
 * Es aceptable para el volumen de esta aplicación (decenas de avistamientos) y
 * evita estados intermedios inconsistentes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Avistamiento } from '@/modelos/avistamiento';

const CLAVE_ALMACEN = 'avistaves:avistamientos:v1';

function esAvistamiento(valor: unknown): valor is Avistamiento {
  if (typeof valor !== 'object' || valor === null) return false;
  const campos = valor as Record<string, unknown>;

  return (
    typeof campos.id === 'string' &&
    typeof campos.nombreAve === 'string' &&
    typeof campos.fotoNombreArchivo === 'string' &&
    typeof campos.latitud === 'number' &&
    typeof campos.longitud === 'number' &&
    typeof campos.fechaAvistamiento === 'string' &&
    typeof campos.cantidad === 'number'
  );
}

/**
 * Lee todos los avistamientos.
 * Un valor corrupto devuelve el arreglo vacio y registra el problema; no hace
 * caer la aplicación (AGENTS.md, sección 8).
 */
export async function leerAvistamientos(): Promise<Avistamiento[]> {
  const crudo = await AsyncStorage.getItem(CLAVE_ALMACEN);
  if (!crudo) return [];

  try {
    const analizado: unknown = JSON.parse(crudo);
    if (!Array.isArray(analizado)) {
      console.warn('[repositorio] El contenido almacenado no es una lista, se descarta');
      return [];
    }
    // Se descartan los registros que no cumplen la forma esperada en lugar de
    // dejar que rompan el listado más adelante.
    return analizado.filter(esAvistamiento);
  } catch (error) {
    console.warn('[repositorio] Contenido corrupto en el almacen, se descarta', error);
    return [];
  }
}

async function escribirTodos(avistamientos: Avistamiento[]): Promise<void> {
  await AsyncStorage.setItem(CLAVE_ALMACEN, JSON.stringify(avistamientos));
}

/** Añade un avistamiento y devuelve la coleccion resultante. */
export async function guardarAvistamiento(
  avistamiento: Avistamiento,
): Promise<Avistamiento[]> {
  const actuales = await leerAvistamientos();
  const siguientes = [avistamiento, ...actuales];
  await escribirTodos(siguientes);
  return siguientes;
}
