/**
 * PATRON OBSERVADOR. Ver BRIEF.md, sección 11.
 *
 * El modelo de renderizado de React es publicacion y suscripcion: un componente
 * que lee un estado queda suscrito a el, y cuando ese estado cambia React
 * notifica a todos los suscriptores volviendolos a renderizar. La Context API
 * generaliza el mecanismo a un arbol completo: el proveedor publica y cada
 * useContext es una suscripcion.
 *
 * Consecuencia observable en esta aplicación: cuando el formulario guarda un
 * avistamiento, NO le habla al listado. Solo cambia el estado del proveedor, y
 * el listado se actualiza porque estaba suscrito. Lo mismo ocurre con el detalle.
 */

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Avistamiento } from '@/modelos/avistamiento';
import * as repositorio from '@/servicios/repositorioAvistamientos';

export type EstadoAvistamientos = {
  avistamientos: Avistamiento[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
  agregar: (avistamiento: Avistamiento) => Promise<void>;
  obtenerPorId: (id: string) => Avistamiento | undefined;
};

export const ContextoAvistamientos = createContext<EstadoAvistamientos | null>(null);

export function ProveedorAvistamientos({ children }: { children: ReactNode }) {
  const [avistamientos, setAvistamientos] = useState<Avistamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      setAvistamientos(await repositorio.leerAvistamientos());
    } catch (causa) {
      console.warn('[ContextoAvistamientos] Falló la lectura', causa);
      setError('No se pudieron leer los avistamientos guardados.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const agregar = useCallback(async (avistamiento: Avistamiento) => {
    // Se publica lo que devuelve el repositorio, no una versión optimista:
    // así el estado en memoria y el almacen no pueden divergir.
    setAvistamientos(await repositorio.guardarAvistamiento(avistamiento));
  }, []);

  const obtenerPorId = useCallback(
    (id: string) => avistamientos.find((a) => a.id === id),
    [avistamientos],
  );

  const valor = useMemo<EstadoAvistamientos>(
    () => ({
      avistamientos,
      cargando,
      error,
      reintentar: () => void cargar(),
      agregar,
      obtenerPorId,
    }),
    [avistamientos, cargando, error, cargar, agregar, obtenerPorId],
  );

  return (
    <ContextoAvistamientos.Provider value={valor}>{children}</ContextoAvistamientos.Provider>
  );
}
