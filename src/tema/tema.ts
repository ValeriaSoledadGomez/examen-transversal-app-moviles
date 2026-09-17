/**
 * Tokens de diseño de AvistAves.
 *
 * Único lugar del proyecto donde se escriben colores, espaciados y tamaños.
 * Ningún componente define un literal de color por su cuenta (ver AGENTS.md, sección 4).
 *
 * Criterio: la aplicación se usa al aire libre, con una mano y con sol sobre la pantalla.
 * De ahí el contraste alto, los cuerpos de texto grandes y las áreas pulsables amplias.
 */

export const colores = {
  /** Verde bosque. Acciones principales y barras de navegación. */
  primario: '#1B4332',
  primarioClaro: '#2D6A4F',
  /** Ámbar. Solo para destacar el dato del clima, nunca para acciones. */
  acento: '#B7791F',

  fondo: '#F7F5F0',
  superficie: '#FFFFFF',
  borde: '#D8D3C8',

  /** Contraste sobre fondo claro: 14.8:1. Legible bajo sol directo. */
  texto: '#1A1A1A',
  /** Contraste sobre fondo claro: 5.9:1. Supera el mínimo de 4.5:1. */
  textoSecundario: '#565044',
  textoSobrePrimario: '#FFFFFF',

  error: '#9B2226',
  exito: '#2D6A4F',
  advertencia: '#B7791F',

  deshabilitado: '#B5AFA2',
} as const;

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const tipografia = {
  titulo: { fontSize: 28, fontWeight: '700' },
  subtitulo: { fontSize: 20, fontWeight: '600' },
  cuerpo: { fontSize: 17, fontWeight: '400' },
  cuerpoFuerte: { fontSize: 17, fontWeight: '600' },
  etiqueta: { fontSize: 15, fontWeight: '600' },
  pie: { fontSize: 13, fontWeight: '400' },
} as const;

export const radio = {
  sm: 6,
  md: 12,
  lg: 20,
} as const;

/**
 * Alto mínimo de cualquier elemento pulsable.
 * Regla de uso en terreno con una mano (AGENTS.md, prohibición 16).
 */
export const ALTO_MINIMO_PULSABLE = 48;
