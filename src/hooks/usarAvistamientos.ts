/** Suscripcion al estado compartido de avistamientos (patron Observador). */

import { useContext } from 'react';

import { ContextoAvistamientos, type EstadoAvistamientos } from '@/contexto/ContextoAvistamientos';

export function usarAvistamientos(): EstadoAvistamientos {
  const contexto = useContext(ContextoAvistamientos);

  if (!contexto) {
    throw new Error('usarAvistamientos debe usarse dentro de ProveedorAvistamientos');
  }

  return contexto;
}
