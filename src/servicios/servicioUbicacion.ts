/**
 * PATRON FACHADA sobre expo-location.
 * Unico archivo del proyecto que importa expo-location (AGENTS.md, sección 3).
 */

import * as Location from 'expo-location';

export const TIEMPO_ESPERA_GPS_MS = 15000;

export type Coordenadas = {
  latitud: number;
  longitud: number;
  precisionMetros: number | null;
};

export class ErrorUbicacion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorUbicacion';
  }
}

/**
 * Obtiene la posicion actual.
 *
 * Accuracy.High es OBLIGATORIO, no una preferencia de calidad. Con
 * Accuracy.Balanced la petición se resuelve por el proveedor fused de Google
 * Play Services, que usa red y wifi; en el emulador ese proveedor no recibe
 * datos y la promesa no resuelve nunca. Verificado con dumpsys location:
 * con Balanced el proveedor GPS queda en ProviderRequest[OFF].
 */
export async function obtenerUbicacionActual(): Promise<Coordenadas> {
  // Timeout propio: sin el, un GPS que no engancha deja un indicador girando
  // para siempre, que es justo lo que AGENTS.md prohibe.
  const conTimeout = new Promise<never>((_, rechazar) => {
    setTimeout(
      () => rechazar(new ErrorUbicacion('El GPS tardó demasiado en responder')),
      TIEMPO_ESPERA_GPS_MS,
    );
  });

  const posicion = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
    conTimeout,
  ]);

  return {
    latitud: posicion.coords.latitude,
    longitud: posicion.coords.longitude,
    precisionMetros: posicion.coords.accuracy ?? null,
  };
}

/**
 * Traduce coordenadas a una dirección legible (RF-04).
 * Devuelve null en lugar de lanzar: la dirección es un dato accesorio y su
 * ausencia no debe generar un error de pantalla completa.
 */
export async function obtenerDireccion(
  latitud: number,
  longitud: number,
): Promise<string | null> {
  try {
    const resultados = await Location.reverseGeocodeAsync({
      latitude: latitud,
      longitude: longitud,
    });

    const lugar = resultados[0];
    if (!lugar) return null;

    const codigoPostal = lugar.postalCode ?? null;

    /**
     * Limpia un fragmento devuelto por el geocodificador: le quita el codigo
     * postal si viene pegado y descarta lo que quede vacio o solo numerico.
     */
    function limpiar(valor: string | null | undefined): string | null {
      if (!valor) return null;

      let limpio = valor;
      if (codigoPostal) limpio = limpio.split(codigoPostal).join('');
      limpio = limpio.replace(/^[\s,]+|[\s,]+$/g, '').trim();

      if (limpio.length === 0 || /^\d+$/.test(limpio)) return null;
      return limpio;
    }

    // En Chile el geocodificador de Android devuelve streetNumber con el codigo
    // postal pegado detras ("23, 8370042"). Verificado en el emulador contra la
    // respuesta cruda. Se toma solo el primer fragmento, que es el numero real.
    const numeroVia = (lugar.streetNumber ?? '').split(',')[0].trim();
    const numeroValido = numeroVia && numeroVia !== codigoPostal ? numeroVia : null;

    const via = [lugar.street, numeroValido].filter(Boolean).join(' ').trim();
    const localidad = limpiar(lugar.city ?? lugar.district ?? lugar.subregion);
    const region = limpiar(lugar.region);

    const partes = [via || null, localidad, region].filter(
      (parte): parte is string => Boolean(parte),
    );

    if (partes.length === 0) return null;

    // Sin duplicados: el geocodificador repite valores con frecuencia.
    return [...new Set(partes)].join(', ');
  } catch (error) {
    console.warn('[servicioUbicacion] No se pudo resolver la dirección', error);
    return null;
  }
}
