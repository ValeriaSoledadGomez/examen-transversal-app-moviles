/**
 * Traduccion del código WMO que devuelve Open-Meteo a texto en español y a un
 * icono. Tabla completa en BRIEF.md, sección 7.
 *
 * Los nombres de icono pertenecen al conjunto MaterialCommunityIcons de
 * @expo/vector-icons y estan verificados contra el mapa de glifos del paquete.
 *
 * Regla de AGENTS.md: el número crudo no se muestra NUNCA en la interfaz.
 */

export type TraduccionClima = {
  descripcion: string;
  icono: string;
};

const TABLA: Record<number, TraduccionClima> = {
  0: { descripcion: 'Despejado', icono: 'weather-sunny' },
  1: { descripcion: 'Mayormente despejado', icono: 'weather-sunny' },
  2: { descripcion: 'Parcialmente nublado', icono: 'weather-partly-cloudy' },
  3: { descripcion: 'Nublado', icono: 'weather-cloudy' },
  45: { descripcion: 'Niebla', icono: 'weather-fog' },
  48: { descripcion: 'Niebla con escarcha', icono: 'weather-fog' },
  51: { descripcion: 'Llovizna ligera', icono: 'weather-rainy' },
  53: { descripcion: 'Llovizna moderada', icono: 'weather-rainy' },
  55: { descripcion: 'Llovizna intensa', icono: 'weather-rainy' },
  56: { descripcion: 'Llovizna helada ligera', icono: 'weather-snowy-rainy' },
  57: { descripcion: 'Llovizna helada intensa', icono: 'weather-snowy-rainy' },
  61: { descripcion: 'Lluvia ligera', icono: 'weather-rainy' },
  63: { descripcion: 'Lluvia moderada', icono: 'weather-pouring' },
  65: { descripcion: 'Lluvia intensa', icono: 'weather-pouring' },
  66: { descripcion: 'Lluvia helada ligera', icono: 'weather-snowy-rainy' },
  67: { descripcion: 'Lluvia helada intensa', icono: 'weather-snowy-rainy' },
  71: { descripcion: 'Nevada ligera', icono: 'weather-snowy' },
  73: { descripcion: 'Nevada moderada', icono: 'weather-snowy' },
  75: { descripcion: 'Nevada intensa', icono: 'weather-snowy-heavy' },
  77: { descripcion: 'Granos de nieve', icono: 'weather-snowy' },
  80: { descripcion: 'Chubascos ligeros', icono: 'weather-rainy' },
  81: { descripcion: 'Chubascos moderados', icono: 'weather-pouring' },
  82: { descripcion: 'Chubascos violentos', icono: 'weather-pouring' },
  85: { descripcion: 'Chubascos de nieve ligeros', icono: 'weather-snowy' },
  86: { descripcion: 'Chubascos de nieve intensos', icono: 'weather-snowy-heavy' },
  95: { descripcion: 'Tormenta eléctrica', icono: 'weather-lightning' },
  96: { descripcion: 'Tormenta con granizo ligero', icono: 'weather-hail' },
  99: { descripcion: 'Tormenta con granizo intenso', icono: 'weather-hail' },
};

const DESCONOCIDO: TraduccionClima = {
  descripcion: 'Condicion desconocida',
  icono: 'weather-cloudy',
};

/** Un código no contemplado devuelve el valor de respaldo, nunca undefined. */
export function traducirCodigoClima(codigo: number): TraduccionClima {
  return TABLA[codigo] ?? DESCONOCIDO;
}
