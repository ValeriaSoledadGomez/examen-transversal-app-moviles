/**
 * Criterios de ordenamiento del listado (RF-03).
 *
 * Cada criterio es una funcion de comparacion intercambiable: la pantalla no
 * conoce como se ordena, solo elige una clave. Añadir un criterio nuevo es
 * añadir una entrada a este objeto, sin tocar el listado.
 */

import type { Avistamiento } from '@/modelos/avistamiento';

export type ClaveOrden = 'fecha' | 'nombre' | 'cantidad';

export type OpcionOrden = {
  clave: ClaveOrden;
  etiqueta: string;
  comparar: (a: Avistamiento, b: Avistamiento) => number;
};

export const OPCIONES_ORDEN: OpcionOrden[] = [
  {
    clave: 'fecha',
    etiqueta: 'Fecha',
    // Del mas reciente al mas antiguo. Es el orden por defecto que exige RF-03.
    comparar: (a, b) =>
      Date.parse(b.fechaAvistamiento) - Date.parse(a.fechaAvistamiento),
  },
  {
    clave: 'nombre',
    etiqueta: 'Nombre',
    comparar: (a, b) =>
      a.nombreAve.localeCompare(b.nombreAve, 'es', { sensitivity: 'base' }),
  },
  {
    clave: 'cantidad',
    etiqueta: 'Cantidad',
    // De mayor a menor: al observador le interesa primero el avistamiento grande.
    comparar: (a, b) => b.cantidad - a.cantidad,
  },
];

export function ordenarAvistamientos(
  avistamientos: Avistamiento[],
  clave: ClaveOrden,
): Avistamiento[] {
  const opcion = OPCIONES_ORDEN.find((o) => o.clave === clave) ?? OPCIONES_ORDEN[0];
  // Copia antes de ordenar: sort muta, y mutar el estado rompe el renderizado.
  return [...avistamientos].sort(opcion.comparar);
}
