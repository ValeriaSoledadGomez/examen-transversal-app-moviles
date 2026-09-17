/**
 * Tipos del clima registrado junto a un avistamiento.
 *
 * El clima es un dato historico: se captura en el momento del registro y no se
 * vuelve a consultar. Ver BRIEF.md, sección 7.
 */

/** Respuesta cruda de Open-Meteo. No se usa fuera de la capa de servicios. */
export type RespuestaOpenMeteo = {
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
};

/** Clima ya traducido al dominio de la aplicación. Es lo que se persiste. */
export type ClimaRegistrado = {
  temperaturaC: number;
  humedadRelativa: number;
  vientoKmh: number;
  /** Código WMO crudo. Se conserva para poder recalcular la traduccion. */
  codigoClima: number;
  descripcion: string;
  /** Nombre de glifo de MaterialCommunityIcons. */
  icono: string;
  obtenidoEn: string;
};
