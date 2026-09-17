/**
 * Entidad central del dominio. Ver el modelo de datos en BRIEF.md, sección 4.
 */

import type { ClimaRegistrado } from '@/modelos/clima';

export type Avistamiento = {
  id: string;
  nombreAve: string;
  /**
   * Nombre del archivo, NO la ruta absoluta ni el URI de la cámara.
   * La ruta se reconstruye en cada lectura desde Paths.document, porque la ruta
   * del directorio de documentos pertenece al sistema y no esta garantizada
   * entre instalaciones. Ver AGENTS.md, sección 8.
   */
  fotoNombreArchivo: string;
  latitud: number;
  longitud: number;
  precisionMetros: number | null;
  /** ISO 8601. Momento del avistamiento, editable por el usuario. */
  fechaAvistamiento: string;
  cantidad: number;
  notas: string;
  /** null cuando la API fallo. Nunca impide guardar. */
  clima: ClimaRegistrado | null;
  /** Dirección legible resuelta al guardar. null si no se pudo resolver. */
  direccion: string | null;
  /** ISO 8601. Momento en que se pulso guardar. */
  fechaCreacion: string;
};

/** Datos del formulario antes de convertirse en Avistamiento. */
export type BorradorAvistamiento = {
  nombreAve: string;
  fotoNombreArchivo: string | null;
  latitud: number | null;
  longitud: number | null;
  precisionMetros: number | null;
  fechaAvistamiento: string;
  cantidad: number;
  notas: string;
  clima: ClimaRegistrado | null;
  direccion: string | null;
};

/** Campos que la validación puede señalar. */
export type CampoAvistamiento = 'foto' | 'ubicacion' | 'nombreAve' | 'fecha' | 'cantidad';

export type ErroresValidacion = Partial<Record<CampoAvistamiento, string>>;

/**
 * Válida un borrador. Funcion pura: no toca estado ni servicios.
 * Devuelve un objeto vacio cuando el borrador es válido.
 */
export function validarBorrador(borrador: BorradorAvistamiento): ErroresValidacion {
  const errores: ErroresValidacion = {};

  if (!borrador.fotoNombreArchivo) {
    errores.foto = 'Falta la fotografía. Toma una foto del ave antes de guardar.';
  }

  if (borrador.latitud === null || borrador.longitud === null) {
    errores.ubicacion = 'Falta la ubicación. Pulsa "Actualizar ubicación" para capturarla.';
  }

  if (!borrador.nombreAve.trim()) {
    errores.nombreAve = 'Falta el nombre del ave. Si no la identificaste, escribe "no identificada".';
  }

  if (!borrador.fechaAvistamiento || Number.isNaN(Date.parse(borrador.fechaAvistamiento))) {
    errores.fecha = 'La fecha del avistamiento no es válida.';
  }

  if (!Number.isInteger(borrador.cantidad) || borrador.cantidad < 1) {
    errores.cantidad = 'La cantidad debe ser un número entero de 1 o mas.';
  }

  return errores;
}

export function hayErrores(errores: ErroresValidacion): boolean {
  return Object.keys(errores).length > 0;
}

/** Convierte un borrador validado en la entidad que se persiste. */
export function crearAvistamiento(borrador: BorradorAvistamiento): Avistamiento {
  if (
    !borrador.fotoNombreArchivo ||
    borrador.latitud === null ||
    borrador.longitud === null
  ) {
    throw new Error('No se puede crear un avistamiento sin fotografía ni ubicación');
  }

  const ahora = new Date().toISOString();

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    nombreAve: borrador.nombreAve.trim(),
    fotoNombreArchivo: borrador.fotoNombreArchivo,
    latitud: borrador.latitud,
    longitud: borrador.longitud,
    precisionMetros: borrador.precisionMetros,
    fechaAvistamiento: borrador.fechaAvistamiento,
    cantidad: borrador.cantidad,
    notas: borrador.notas.trim(),
    clima: borrador.clima,
    direccion: borrador.direccion,
    fechaCreacion: ahora,
  };
}

export function crearBorradorVacio(): BorradorAvistamiento {
  return {
    nombreAve: '',
    fotoNombreArchivo: null,
    latitud: null,
    longitud: null,
    precisionMetros: null,
    fechaAvistamiento: new Date().toISOString(),
    cantidad: 1,
    notas: '',
    clima: null,
    direccion: null,
  };
}
