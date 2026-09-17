/** Funciones puras de presentación. Sin efectos secundarios. */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "16 de septiembre de 2026, 21:45" */
export function formatearFechaLarga(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Fecha no válida';

  const hora = String(fecha.getHours()).padStart(2, '0');
  const minuto = String(fecha.getMinutes()).padStart(2, '0');
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}, ${hora}:${minuto}`;
}

/** "16 sep 2026, 21:45". Versión compacta para el listado. */
export function formatearFechaCorta(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Sin fecha';

  const mes = MESES[fecha.getMonth()].slice(0, 3);
  const hora = String(fecha.getHours()).padStart(2, '0');
  const minuto = String(fecha.getMinutes()).padStart(2, '0');
  return `${fecha.getDate()} ${mes} ${fecha.getFullYear()}, ${hora}:${minuto}`;
}

export function formatearTemperatura(grados: number): string {
  return `${Math.round(grados)} grados`;
}

export function formatearHumedad(porcentaje: number): string {
  return `${Math.round(porcentaje)} por ciento`;
}

export function formatearViento(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

/** Las coordenadas son dato secundario: la ubicación principal es la dirección. */
export function formatearCoordenadas(latitud: number, longitud: number): string {
  return `${latitud.toFixed(4)}, ${longitud.toFixed(4)}`;
}

export function formatearCantidad(cantidad: number): string {
  return cantidad === 1 ? '1 ejemplar' : `${cantidad} ejemplares`;
}

/**
 * Conversion entre el ISO que se persiste y los campos editables del formulario.
 *
 * RF-01 pide que la fecha sea automática pero editable. Se resuelve con dos
 * campos de texto en lugar de un selector nativo para no añadir una dependencia
 * fuera de las listadas en AGENTS.md.
 */

export function isoAFechaTexto(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

export function isoAHoraTexto(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';

  const hora = String(fecha.getHours()).padStart(2, '0');
  const minuto = String(fecha.getMinutes()).padStart(2, '0');
  return `${hora}:${minuto}`;
}

/** Devuelve null si el texto no forma una fecha válida. */
export function textosAIso(fechaTexto: string, horaTexto: string): string | null {
  const partesFecha = fechaTexto.split('/');
  const partesHora = horaTexto.split(':');

  if (partesFecha.length !== 3 || partesHora.length !== 2) return null;

  const dia = Number(partesFecha[0]);
  const mes = Number(partesFecha[1]);
  const anio = Number(partesFecha[2]);
  const hora = Number(partesHora[0]);
  const minuto = Number(partesHora[1]);

  if ([dia, mes, anio, hora, minuto].some((n) => !Number.isInteger(n))) return null;
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59) return null;

  const fecha = new Date(anio, mes - 1, dia, hora, minuto);
  if (Number.isNaN(fecha.getTime())) return null;

  // Rechaza fechas imposibles como el 31 de febrero, que Date desplazaria.
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes - 1) return null;

  return fecha.toISOString();
}
