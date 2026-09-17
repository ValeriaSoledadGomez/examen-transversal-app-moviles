/**
 * Consulta del clima para unas coordenadas.
 *
 * Nunca expone un estado que bloquee el guardado: el error es informativo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ClimaRegistrado } from '@/modelos/clima';
import { obtenerClimaPara } from '@/servicios/servicioClima';

export type EstadoClima = {
  clima: ClimaRegistrado | null;
  cargando: boolean;
  error: string | null;
  desdeCache: boolean;
  reintentar: () => void;
};

export function usarClima(latitud: number | null, longitud: number | null): EstadoClima {
  const [clima, setClima] = useState<ClimaRegistrado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [desdeCache, setDesdeCache] = useState(false);
  const consultadoPara = useRef<string | null>(null);

  const consultar = useCallback(async (lat: number, lon: number) => {
    setCargando(true);
    setError(null);

    const resultado = await obtenerClimaPara(lat, lon);

    setClima(resultado.clima);
    setError(resultado.error);
    setDesdeCache(resultado.desdeCache);
    setCargando(false);
  }, []);

  useEffect(() => {
    if (latitud === null || longitud === null) return;

    // Evita reconsultar las mismas coordenadas en cada renderizado.
    const firma = `${latitud},${longitud}`;
    if (consultadoPara.current === firma) return;

    consultadoPara.current = firma;
    void consultar(latitud, longitud);
  }, [latitud, longitud, consultar]);

  const reintentar = useCallback(() => {
    if (latitud === null || longitud === null) return;
    consultadoPara.current = null;
    void consultar(latitud, longitud);
  }, [latitud, longitud, consultar]);

  return { clima, cargando, error, desdeCache, reintentar };
}
