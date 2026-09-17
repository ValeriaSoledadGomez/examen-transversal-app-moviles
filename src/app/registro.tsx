/**
 * RF-01 y RF-02. Formulario de registro de un avistamiento.
 *
 * Regla que gobierna esta pantalla: el clima es un dato deseable, no un
 * requisito. El boton de guardar permanece habilitado mientras la consulta de
 * clima esta en curso, y un fallo de red nunca impide registrar.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BotonPrimario from '@/componentes/BotonPrimario';
import CampoTexto from '@/componentes/CampoTexto';
import CapturadorFoto from '@/componentes/CapturadorFoto';
import InsigniaClima from '@/componentes/InsigniaClima';
import { usarAvistamientos } from '@/hooks/usarAvistamientos';
import { usarClima } from '@/hooks/usarClima';
import { usarUbicacionActual } from '@/hooks/usarUbicacionActual';
import {
  crearAvistamiento,
  crearBorradorVacio,
  hayErrores,
  validarBorrador,
  type ErroresValidacion,
} from '@/modelos/avistamiento';
import { guardarFotoPermanente, resolverUriFoto } from '@/servicios/servicioFotos';
import { colores, espaciado, radio, tipografia } from '@/tema/tema';
import {
  formatearCoordenadas,
  isoAFechaTexto,
  isoAHoraTexto,
  textosAIso,
} from '@/utilidades/formato';

export default function PantallaRegistro() {
  const router = useRouter();
  const { agregar } = usarAvistamientos();
  const ubicacion = usarUbicacionActual();

  const [borrador, setBorrador] = useState(crearBorradorVacio);
  const [fechaTexto, setFechaTexto] = useState(() => isoAFechaTexto(new Date().toISOString()));
  const [horaTexto, setHoraTexto] = useState(() => isoAHoraTexto(new Date().toISOString()));
  const [cantidadTexto, setCantidadTexto] = useState('1');
  const [errores, setErrores] = useState<ErroresValidacion>({});
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [guardandoFoto, setGuardandoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  const clima = usarClima(
    ubicacion.coordenadas?.latitud ?? null,
    ubicacion.coordenadas?.longitud ?? null,
  );

  async function alCapturarFoto(uriEnCache: string) {
    setCamaraAbierta(false);
    setGuardandoFoto(true);
    setErrorFoto(null);

    try {
      // El archivo se mueve de la cache a documentos de inmediato: si se quedara
      // en cache, el sistema podria borrarlo y RF-05 se rompe en silencio.
      const nombreArchivo = await guardarFotoPermanente(uriEnCache);
      setBorrador((previo) => ({ ...previo, fotoNombreArchivo: nombreArchivo }));
      setErrores((previos) => ({ ...previos, foto: undefined }));
    } catch (causa) {
      console.warn('[registro] No se pudo persistir la foto', causa);
      setErrorFoto('No se pudo guardar la fotografía. Intenta tomarla de nuevo.');
    } finally {
      setGuardandoFoto(false);
    }
  }

  async function guardar() {
    const fechaIso = textosAIso(fechaTexto, horaTexto);
    const cantidad = Number(cantidadTexto);

    const candidato = {
      ...borrador,
      latitud: ubicacion.coordenadas?.latitud ?? null,
      longitud: ubicacion.coordenadas?.longitud ?? null,
      precisionMetros: ubicacion.coordenadas?.precisionMetros ?? null,
      direccion: ubicacion.direccion,
      clima: clima.clima,
      fechaAvistamiento: fechaIso ?? '',
      cantidad: Number.isInteger(cantidad) ? cantidad : Number.NaN,
    };

    const encontrados = validarBorrador(candidato);
    setErrores(encontrados);

    if (hayErrores(encontrados)) {
      return;
    }

    setGuardando(true);
    setErrorGuardado(null);

    try {
      await agregar(crearAvistamiento(candidato));

      Alert.alert('Avistamiento guardado', 'El registro quedó guardado en tu dispositivo.');
      // replace y no push: el formulario no debe quedar en la pila, o el boton
      // atras desde el listado lo reabriria (CA-06.4).
      router.replace('/');
    } catch (causa) {
      console.warn('[registro] Falló el guardado', causa);
      setErrorGuardado('No se pudo guardar el avistamiento. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  if (camaraAbierta) {
    return (
      <CapturadorFoto
        onCapturada={(uri) => void alCapturarFoto(uri)}
        onCancelar={() => setCamaraAbierta(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <BloqueFotografia
          nombreArchivo={borrador.fotoNombreArchivo}
          guardando={guardandoFoto}
          error={errorFoto ?? errores.foto}
          onAbrirCamara={() => setCamaraAbierta(true)}
        />

        <BloqueUbicacion ubicacion={ubicacion} error={errores.ubicacion} />

        <BloqueClima clima={clima} hayCoordenadas={ubicacion.coordenadas !== null} />

        <CampoTexto
          etiqueta="Nombre del ave"
          valor={borrador.nombreAve}
          onCambiar={(valor) => setBorrador((previo) => ({ ...previo, nombreAve: valor }))}
          marcadorPosicion="Ej: zorzal, o no identificada"
          ayuda='Si no lograste identificarla, escribe "no identificada" y sigue adelante.'
          error={errores.nombreAve}
        />

        <View style={estilos.fila}>
          <View style={estilos.columna}>
            <CampoTexto
              etiqueta="Fecha"
              valor={fechaTexto}
              onCambiar={setFechaTexto}
              marcadorPosicion="DD/MM/AAAA"
              tipoTeclado="numbers-and-punctuation"
              error={errores.fecha}
            />
          </View>
          <View style={estilos.columna}>
            <CampoTexto
              etiqueta="Hora"
              valor={horaTexto}
              onCambiar={setHoraTexto}
              marcadorPosicion="HH:MM"
              tipoTeclado="numbers-and-punctuation"
            />
          </View>
        </View>

        <CampoTexto
          etiqueta="Cantidad de ejemplares"
          valor={cantidadTexto}
          onCambiar={(valor) => setCantidadTexto(valor.replace(/[^0-9]/g, ''))}
          tipoTeclado="number-pad"
          error={errores.cantidad}
        />

        <CampoTexto
          etiqueta="Notas"
          valor={borrador.notas}
          onCambiar={(valor) => setBorrador((previo) => ({ ...previo, notas: valor }))}
          marcadorPosicion="Comportamiento, entorno, lo que quieras recordar"
          ayuda="Opcional."
          multilinea
        />

        {errorGuardado ? <Text style={estilos.errorGuardado}>{errorGuardado}</Text> : null}

        <View style={estilos.acciones}>
          <BotonPrimario
            titulo="Guardar avistamiento"
            icono="content-save-outline"
            onPress={() => void guardar()}
            cargando={guardando}
          />
          <BotonPrimario
            titulo="Cancelar"
            variante="secundario"
            onPress={() => router.back()}
            deshabilitado={guardando}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BloqueFotografia({
  nombreArchivo,
  guardando,
  error,
  onAbrirCamara,
}: {
  nombreArchivo: string | null;
  guardando: boolean;
  error?: string;
  onAbrirCamara: () => void;
}) {
  return (
    <View style={estilos.bloque}>
      <Text style={estilos.tituloBloque}>Fotografía</Text>

      {guardando ? (
        <View style={estilos.marcoFoto}>
          <ActivityIndicator color={colores.primario} />
          <Text style={estilos.textoSecundario}>Guardando la fotografía</Text>
        </View>
      ) : nombreArchivo ? (
        <Image
          source={{ uri: resolverUriFoto(nombreArchivo) }}
          style={estilos.vistaPrevia}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={estilos.marcoFoto}>
          <MaterialCommunityIcons name="camera-outline" size={40} color={colores.textoSecundario} />
          <Text style={estilos.textoSecundario}>Todavía no hay fotografía</Text>
        </View>
      )}

      {error ? <Text style={estilos.errorBloque}>{error}</Text> : null}

      <BotonPrimario
        titulo={nombreArchivo ? 'Repetir foto' : 'Tomar foto'}
        icono="camera"
        variante={nombreArchivo ? 'secundario' : 'primario'}
        onPress={onAbrirCamara}
        deshabilitado={guardando}
      />
    </View>
  );
}

function BloqueUbicacion({
  ubicacion,
  error,
}: {
  ubicacion: ReturnType<typeof usarUbicacionActual>;
  error?: string;
}) {
  return (
    <View style={estilos.bloque}>
      <Text style={estilos.tituloBloque}>Ubicación</Text>

      {!ubicacion.permisoConcedido ? (
        <View style={estilos.avisoPermiso}>
          <Text style={estilos.textoSecundario}>
            AvistAves necesita tu ubicación para registrar dónde viste el ave y consultar el clima
            del lugar. No se comparte con nadie ni se usa en segundo plano.
          </Text>
          <BotonPrimario
            titulo={ubicacion.permisoBloqueado ? 'Abrir ajustes' : 'Permitir ubicación'}
            icono={ubicacion.permisoBloqueado ? 'cog-outline' : 'map-marker'}
            variante="secundario"
            onPress={() =>
              ubicacion.permisoBloqueado
                ? void Linking.openSettings()
                : void ubicacion.solicitarPermiso()
            }
          />
        </View>
      ) : ubicacion.cargando ? (
        <View style={estilos.filaEstado}>
          <ActivityIndicator color={colores.primario} />
          <Text style={estilos.textoSecundario}>Obteniendo ubicación</Text>
        </View>
      ) : ubicacion.error ? (
        <View style={estilos.avisoPermiso}>
          <Text style={estilos.errorBloque}>{ubicacion.error}</Text>
          <BotonPrimario
            titulo="Reintentar"
            icono="refresh"
            variante="secundario"
            onPress={() => void ubicacion.capturar()}
          />
        </View>
      ) : ubicacion.coordenadas ? (
        <View style={estilos.datosUbicacion}>
          <Text style={estilos.direccion}>
            {ubicacion.direccion ?? 'Dirección no disponible para este punto'}
          </Text>
          {/* Las coordenadas son solo lectura: el usuario nunca las escribe. */}
          <Text style={estilos.coordenadas}>
            {formatearCoordenadas(
              ubicacion.coordenadas.latitud,
              ubicacion.coordenadas.longitud,
            )}
          </Text>
          <BotonPrimario
            titulo="Actualizar ubicación"
            icono="crosshairs-gps"
            variante="secundario"
            onPress={() => void ubicacion.capturar()}
          />
        </View>
      ) : null}

      {error ? <Text style={estilos.errorBloque}>{error}</Text> : null}
    </View>
  );
}

function BloqueClima({
  clima,
  hayCoordenadas,
}: {
  clima: ReturnType<typeof usarClima>;
  hayCoordenadas: boolean;
}) {
  if (!hayCoordenadas) return null;

  return (
    <View style={estilos.bloque}>
      <Text style={estilos.tituloBloque}>Clima del momento</Text>

      {clima.cargando ? (
        <View style={estilos.filaEstado}>
          <ActivityIndicator color={colores.primario} />
          <Text style={estilos.textoSecundario}>Consultando el clima</Text>
        </View>
      ) : clima.error ? (
        <View style={estilos.avisoPermiso}>
          <Text style={estilos.textoSecundario}>{clima.error}</Text>
          <BotonPrimario
            titulo="Reintentar"
            icono="refresh"
            variante="secundario"
            onPress={clima.reintentar}
          />
        </View>
      ) : (
        <View style={estilos.filaEstado}>
          <InsigniaClima clima={clima.clima} />
          {clima.desdeCache ? <Text style={estilos.pie}>Dato reciente de esta zona</Text> : null}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.md,
    gap: espaciado.lg,
    paddingBottom: espaciado.xxl,
  },
  bloque: {
    gap: espaciado.sm,
  },
  tituloBloque: {
    ...tipografia.etiqueta,
    color: colores.texto,
  },
  marcoFoto: {
    height: 200,
    borderRadius: radio.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
  },
  vistaPrevia: {
    height: 240,
    borderRadius: radio.md,
    backgroundColor: colores.borde,
  },
  filaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    flexWrap: 'wrap',
  },
  avisoPermiso: {
    gap: espaciado.sm,
    backgroundColor: colores.superficie,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
  },
  datosUbicacion: {
    gap: espaciado.sm,
    backgroundColor: colores.superficie,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
  },
  direccion: {
    ...tipografia.cuerpoFuerte,
    color: colores.texto,
  },
  coordenadas: {
    ...tipografia.pie,
    color: colores.textoSecundario,
  },
  textoSecundario: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    flexShrink: 1,
  },
  pie: {
    ...tipografia.pie,
    color: colores.textoSecundario,
  },
  errorBloque: {
    ...tipografia.pie,
    color: colores.error,
  },
  errorGuardado: {
    ...tipografia.cuerpo,
    color: colores.error,
  },
  fila: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  columna: {
    flex: 1,
  },
  acciones: {
    gap: espaciado.sm,
    marginTop: espaciado.sm,
  },
});
