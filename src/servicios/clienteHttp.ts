/**
 * MEDIDA DE OPTIMIZACION 2 de 2: timeout con AbortController y un único reintento.
 * Ver BRIEF.md, sección 10.
 *
 * Por que importa: una petición sin timeout en una red movil deficiente puede
 * quedarse colgada mas de un minuto antes de que el sistema la corte. Abortarla
 * a los 6 segundos libera el socket y la interfaz de inmediato.
 *
 * Por que UN solo reintento y solo ante fallo de red: repetir una petición mal
 * formada (4xx) no la va a arreglar, solo gasta batería y datos del voluntario.
 *
 * Unico archivo del proyecto autorizado a llamar a fetch (AGENTS.md, sección 3).
 */

export const TIEMPO_ESPERA_MS = 6000;
export const ESPERA_ENTRE_INTENTOS_MS = 1000;
export const INTENTOS_MAXIMOS = 2;

export class ErrorHttp extends Error {
  readonly estado: number | null;
  readonly esReintentable: boolean;

  constructor(mensaje: string, estado: number | null, esReintentable: boolean) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.estado = estado;
    this.esReintentable = esReintentable;
  }
}

async function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

/** Una sola petición, abortada al vencer el tiempo de espera. */
async function peticionConTimeout(url: string): Promise<unknown> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_ESPERA_MS);

  try {
    const respuesta = await fetch(url, { signal: controlador.signal });

    if (!respuesta.ok) {
      // 5xx es un fallo del servidor y puede resolverse solo; 4xx no.
      const esReintentable = respuesta.status >= 500;
      throw new ErrorHttp(
        `El servicio respondió con estado ${respuesta.status}`,
        respuesta.status,
        esReintentable,
      );
    }

    return await respuesta.json();
  } catch (error) {
    if (error instanceof ErrorHttp) throw error;

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ErrorHttp('El servicio tardó demasiado en responder', null, true);
    }

    throw new ErrorHttp('No hay conexión con el servicio', null, true);
  } finally {
    clearTimeout(temporizador);
  }
}

/**
 * Petición GET con timeout y, ante fallo de red o timeout, un único reintento.
 * Costo maximo acotado: 6 s + 1 s + 6 s = 13 s.
 */
export async function obtenerJson(url: string): Promise<unknown> {
  let ultimoError: ErrorHttp | null = null;

  for (let intento = 1; intento <= INTENTOS_MAXIMOS; intento += 1) {
    try {
      return await peticionConTimeout(url);
    } catch (error) {
      ultimoError = error instanceof ErrorHttp
        ? error
        : new ErrorHttp('Error inesperado de red', null, false);

      if (!ultimoError.esReintentable || intento === INTENTOS_MAXIMOS) {
        throw ultimoError;
      }

      await esperar(ESPERA_ENTRE_INTENTOS_MS);
    }
  }

  throw ultimoError ?? new ErrorHttp('Error inesperado de red', null, false);
}
