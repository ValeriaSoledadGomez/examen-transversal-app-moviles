/**
 * PATRON FACHADA. Ver BRIEF.md, sección 11.
 *
 * Tras una única funcion publica, obtenerClimaPara, esconde: consulta de cache,
 * construccion de la URL, timeout, reintento, adaptacion de la respuesta cruda al
 * modelo de dominio y traduccion del código WMO. Ninguna pantalla sabe nada de eso.
 *
 * REGLA INNEGOCIABLE (AGENTS.md, sección 7): un fallo aquí NUNCA impide guardar un
 * avistamiento. Por eso esta funcion no lanza: devuelve null y la razón.
 */

import type { ClimaRegistrado, RespuestaOpenMeteo } from '@/modelos/clima';
import { obtenerJson } from '@/servicios/clienteHttp';
import { guardarEnCache, obtenerDeCache } from '@/servicios/cacheClima';
import { traducirCodigoClima } from '@/utilidades/tablaClima';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const CAMPOS = 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code';

export type ResultadoClima = {
  clima: ClimaRegistrado | null;
  /** Mensaje en español listo para mostrar. null cuando todo fue bien. */
  error: string | null;
  /** true cuando se sirvio desde la cache y no se toco la red. */
  desdeCache: boolean;
};

function construirUrl(latitud: number, longitud: number): string {
  return `${BASE_URL}?latitude=${latitud}&longitude=${longitud}&current=${CAMPOS}`;
}

/**
 * PATRON ADAPTADOR: traduce la interfaz externa que no controlamos
 * (nombres de Open-Meteo, weather_code numérico) a la interfaz que la
 * aplicación necesita.
 */
function adaptarRespuesta(respuesta: RespuestaOpenMeteo): ClimaRegistrado {
  const actual = respuesta.current;
  const traduccion = traducirCodigoClima(actual.weather_code);

  return {
    temperaturaC: actual.temperature_2m,
    humedadRelativa: actual.relative_humidity_2m,
    vientoKmh: actual.wind_speed_10m,
    codigoClima: actual.weather_code,
    descripcion: traduccion.descripcion,
    icono: traduccion.icono,
    obtenidoEn: new Date().toISOString(),
  };
}

function esRespuestaValida(valor: unknown): valor is RespuestaOpenMeteo {
  if (typeof valor !== 'object' || valor === null) return false;
  const actual = (valor as { current?: unknown }).current;
  if (typeof actual !== 'object' || actual === null) return false;

  const campos = actual as Record<string, unknown>;
  return (
    typeof campos.temperature_2m === 'number' &&
    typeof campos.relative_humidity_2m === 'number' &&
    typeof campos.wind_speed_10m === 'number' &&
    typeof campos.weather_code === 'number'
  );
}

/**
 * Obtiene el clima para unas coordenadas. No lanza nunca.
 * Se guardan las coordenadas del GPS, no las que devuelve Open-Meteo: la API
 * responde con las de la celda de grilla mas cercana, que no son las enviadas.
 */
export async function obtenerClimaPara(
  latitud: number,
  longitud: number,
): Promise<ResultadoClima> {
  const cacheado = await obtenerDeCache(latitud, longitud);
  if (cacheado) {
    return { clima: cacheado, error: null, desdeCache: true };
  }

  try {
    const crudo = await obtenerJson(construirUrl(latitud, longitud));

    if (!esRespuestaValida(crudo)) {
      return {
        clima: null,
        error: 'El servicio de clima devolvió datos que no se pudieron interpretar.',
        desdeCache: false,
      };
    }

    const clima = adaptarRespuesta(crudo);
    await guardarEnCache(latitud, longitud, clima);

    return { clima, error: null, desdeCache: false };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    return {
      clima: null,
      error: `No se pudo obtener el clima: ${detalle.toLowerCase()}. Puedes guardar igual.`,
      desdeCache: false,
    };
  }
}
