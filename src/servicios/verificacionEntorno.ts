/**
 * TEMPORAL — Fase 0.
 *
 * Comprueba que el emulador entrega cámara, GPS y red antes de construir la aplicación
 * encima. Existe para desactivar los riesgos R-01, R-02 y R-04 del BRIEF en la primera
 * fase y no en la cuarta, cuando ya no habría tiempo de reaccionar.
 *
 * Este archivo se elimina al cerrar la fase 1. No forma parte de la arquitectura final.
 */

import * as Location from 'expo-location';

export type ResultadoVerificacion = {
  ok: boolean;
  detalle: string;
};

/** Pide el permiso de ubicación y obtiene una posición. */
export async function verificarUbicacion(): Promise<ResultadoVerificacion> {
  const permiso = await Location.requestForegroundPermissionsAsync();
  if (!permiso.granted) {
    return { ok: false, detalle: 'Permiso de ubicación denegado' };
  }

  // Accuracy.High es obligatorio, no una preferencia de calidad: Balanced se resuelve
  // por el proveedor fused (red y wifi), que el emulador no alimenta, y la promesa no
  // resuelve nunca. High engancha el proveedor GPS, que es al que llega `adb emu geo fix`.
  const posicion = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    ok: true,
    detalle: `${posicion.coords.latitude.toFixed(4)}, ${posicion.coords.longitude.toFixed(4)}`,
  };
}

/** Traduce unas coordenadas a una dirección legible (RF-04). */
export async function verificarGeocodificacion(
  latitud: number,
  longitud: number,
): Promise<ResultadoVerificacion> {
  const resultados = await Location.reverseGeocodeAsync({ latitude: latitud, longitude: longitud });
  const primero = resultados[0];

  if (!primero) {
    return { ok: false, detalle: 'Sin resultados de geocodificación' };
  }

  const partes = [primero.street, primero.city, primero.region].filter(Boolean);
  return { ok: true, detalle: partes.join(', ') || 'Dirección sin detalle' };
}

/** Consulta Open-Meteo con las coordenadas obtenidas del GPS (RF-02). */
export async function verificarClima(
  latitud: number,
  longitud: number,
): Promise<ResultadoVerificacion> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    return { ok: false, detalle: `La API respondió ${respuesta.status}` };
  }

  const datos = (await respuesta.json()) as {
    current: { temperature_2m: number; relative_humidity_2m: number; weather_code: number };
  };

  return {
    ok: true,
    detalle:
      `${datos.current.temperature_2m} grados, ` +
      `${datos.current.relative_humidity_2m} por ciento de humedad, ` +
      `código ${datos.current.weather_code}`,
  };
}
