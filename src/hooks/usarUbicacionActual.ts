/**
 * Captura de la ubicación y su dirección legible, con los tres estados que
 * exige AGENTS.md sección 5: cargando, error y datos.
 *
 * Este archivo importa expo-location, y es una de las DOS excepciones
 * documentadas a la regla de arquitectura (AGENTS.md, sección 3). El motivo es
 * técnico: useForegroundPermissions es un hook y solo puede invocarse desde el
 * arbol de React, así que no cabe dentro de un servicio. El alcance esta
 * acotado al estado del permiso: obtener la posicion y resolver la dirección
 * siguen pasando por servicioUbicacion.ts.
 */

import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import {
  obtenerDireccion,
  obtenerUbicacionActual,
  type Coordenadas,
} from '@/servicios/servicioUbicacion';

export type EstadoUbicacion = {
  coordenadas: Coordenadas | null;
  direccion: string | null;
  cargando: boolean;
  error: string | null;
  permisoConcedido: boolean;
  /** true cuando el sistema ya no permite volver a pedir el permiso. */
  permisoBloqueado: boolean;
  solicitarPermiso: () => Promise<void>;
  capturar: () => Promise<void>;
};

export function usarUbicacionActual(): EstadoUbicacion {
  const [permiso, solicitarPermisoExpo] = Location.useForegroundPermissions();
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [direccion, setDireccion] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capturar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const posicion = await obtenerUbicacionActual();
      setCoordenadas(posicion);

      // La dirección se resuelve después y sin bloquear: es un dato accesorio.
      setDireccion(await obtenerDireccion(posicion.latitud, posicion.longitud));
    } catch (causa) {
      const detalle = causa instanceof Error ? causa.message : 'Error desconocido';
      setError(`No se pudo obtener la ubicación. ${detalle}.`);
    } finally {
      setCargando(false);
    }
  }, []);

  const solicitarPermiso = useCallback(async () => {
    const respuesta = await solicitarPermisoExpo();
    if (respuesta.granted) {
      await capturar();
    }
  }, [solicitarPermisoExpo, capturar]);

  // RF-01: la ubicación se captura automaticamente al abrir el formulario.
  useEffect(() => {
    if (permiso?.granted && !coordenadas && !cargando && !error) {
      void capturar();
    }
  }, [permiso?.granted, coordenadas, cargando, error, capturar]);

  return {
    coordenadas,
    direccion,
    cargando,
    error,
    permisoConcedido: permiso?.granted ?? false,
    // Tres estados, no dos: denegado pero solicitable no es lo mismo que
    // denegado de forma permanente, que solo se resuelve en los ajustes.
    permisoBloqueado: permiso !== null && !permiso.granted && !permiso.canAskAgain,
    solicitarPermiso,
    capturar,
  };
}
