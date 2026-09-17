/**
 * MEDIDA DE OPTIMIZACION 1 de 2: cache por ubicación con vencimiento de 15 minutos.
 * Ver BRIEF.md, sección 10.
 *
 * El vencimiento no es arbitrario. La propia respuesta de Open-Meteo declara
 * current.interval = 900 segundos: el dato se recalcula cada quince minutos, de
 * modo que consultar antes de ese plazo devuelve exactamente el mismo valor y la
 * petición no aporta información nueva.
 *
 * La clave redondea las coordenadas a 2 decimales, lo que agrupa en una misma
 * celda todo lo que ocurra en un radio aproximado de 1,1 km. Escenario real: un
 * voluntario que registra varios avistamientos durante una salida consume UNA
 * petición en lugar de una por avistamiento.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ClimaRegistrado } from '@/modelos/clima';

const CLAVE_ALMACEN = 'avistaves:cacheClima:v1';
export const VIGENCIA_CACHE_MS = 15 * 60 * 1000;
const DECIMALES_CELDA = 2;

type EntradaCache = {
  clima: ClimaRegistrado;
  guardadoEn: number;
};

type ContenidoCache = Record<string, EntradaCache>;

/** Coordenadas redondeadas a una celda de aproximadamente 1,1 km. */
export function calcularClaveCelda(latitud: number, longitud: number): string {
  return `${latitud.toFixed(DECIMALES_CELDA)},${longitud.toFixed(DECIMALES_CELDA)}`;
}

async function leerCache(): Promise<ContenidoCache> {
  try {
    const crudo = await AsyncStorage.getItem(CLAVE_ALMACEN);
    if (!crudo) return {};
    return JSON.parse(crudo) as ContenidoCache;
  } catch (error) {
    // Una cache corrupta se descarta: es un dato prescindible, no un fallo.
    console.warn('[cacheClima] No se pudo leer la cache, se ignora', error);
    return {};
  }
}

/** Devuelve el clima cacheado si sigue vigente, o null. */
export async function obtenerDeCache(
  latitud: number,
  longitud: number,
): Promise<ClimaRegistrado | null> {
  const cache = await leerCache();
  const entrada = cache[calcularClaveCelda(latitud, longitud)];

  if (!entrada) return null;
  if (Date.now() - entrada.guardadoEn > VIGENCIA_CACHE_MS) return null;

  return entrada.clima;
}

export async function guardarEnCache(
  latitud: number,
  longitud: number,
  clima: ClimaRegistrado,
): Promise<void> {
  try {
    const cache = await leerCache();
    cache[calcularClaveCelda(latitud, longitud)] = { clima, guardadoEn: Date.now() };
    await AsyncStorage.setItem(CLAVE_ALMACEN, JSON.stringify(cache));
  } catch (error) {
    // No poder cachear no debe romper nada: se pierde la optimización, no el dato.
    console.warn('[cacheClima] No se pudo guardar en la cache', error);
  }
}
