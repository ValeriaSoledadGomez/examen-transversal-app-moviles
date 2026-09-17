/**
 * ÚNICA EXCEPCION a la regla de que los componentes no tocan bibliotecas externas
 * (AGENTS.md, sección 3), y lo es por una razón técnica: CameraView es un
 * componente, no una funcion, y no puede envolverse en un servicio.
 *
 * Su alcance esta acotado a propósito: monta la vista de cámara, dispara y
 * entrega el URI resultante por callback. NO mueve el archivo, NO lo persiste y
 * NO conoce el modelo Avistamiento. Eso ocurre en servicioFotos.ts.
 *
 * RF-01: la foto se toma con la cámara en el momento. No existe ninguna ruta en
 * esta interfaz que permita elegir una imagen de la galeria.
 */

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BotonPrimario from '@/componentes/BotonPrimario';
import { ALTO_MINIMO_PULSABLE, colores, espaciado, tipografia } from '@/tema/tema';

type Props = {
  /** Recibe el URI en cache. Quien lo recibe debe persistirlo de inmediato. */
  onCapturada: (uriEnCache: string) => void;
  onCancelar: () => void;
};

export default function CapturadorFoto({ onCapturada, onCancelar }: Props) {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [lista, setLista] = useState(false);
  const [disparando, setDisparando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const camaraRef = useRef<CameraView>(null);

  // Estado 1: el permiso todavía se esta consultando. Vista neutra, sin parpadeo.
  if (!permiso) {
    return <View style={estilos.contenedorNeutro} />;
  }

  // Estado 2 y 3: denegado solicitable, o denegado de forma permanente.
  if (!permiso.granted) {
    const bloqueado = !permiso.canAskAgain;

    return (
      <View style={estilos.contenedorPermiso}>
        <MaterialCommunityIcons name="camera-off-outline" size={56} color={colores.primario} />
        <Text style={estilos.tituloPermiso}>Necesitamos la cámara</Text>
        <Text style={estilos.textoPermiso}>
          AvistAves necesita la cámara para que puedas fotografiar el ave en el momento del
          avistamiento. La fotografía se guarda solo en tu dispositivo.
        </Text>

        <View style={estilos.accionesPermiso}>
          {bloqueado ? (
            <BotonPrimario
              titulo="Abrir ajustes"
              icono="cog-outline"
              onPress={() => void Linking.openSettings()}
            />
          ) : (
            <BotonPrimario
              titulo="Permitir cámara"
              icono="camera"
              onPress={() => void solicitarPermiso()}
            />
          )}
          <BotonPrimario titulo="Volver" variante="secundario" onPress={onCancelar} />
        </View>
      </View>
    );
  }

  async function disparar() {
    setDisparando(true);
    setError(null);

    try {
      const captura = await camaraRef.current?.takePictureAsync({ quality: 0.7 });

      if (!captura?.uri) {
        setError('La cámara no devolvió ninguna fotografía. Intenta de nuevo.');
        return;
      }

      onCapturada(captura.uri);
    } catch (causa) {
      console.warn('[CapturadorFoto] Falló la captura', causa);
      setError('No se pudo tomar la fotografía. Intenta de nuevo.');
    } finally {
      setDisparando(false);
    }
  }

  return (
    <View style={estilos.contenedorCamara}>
      <CameraView
        ref={camaraRef}
        style={estilos.camara}
        facing="back"
        // La documentacion de expo-camera exige esperar onCameraReady antes de
        // disparar. El obturador queda bloqueado hasta entonces.
        onCameraReady={() => setLista(true)}
      />

      {error ? (
        <View style={estilos.avisoError}>
          <Text style={estilos.textoError}>{error}</Text>
        </View>
      ) : null}

      <View style={estilos.controles}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancelar la captura"
          onPress={onCancelar}
          style={estilos.botonCancelar}>
          <Text style={estilos.textoCancelar}>Cancelar</Text>
        </Pressable>

        <View style={estilos.botonDisparo}>
          <BotonPrimario
            titulo={lista ? 'Tomar foto' : 'Preparando cámara'}
            icono={lista ? 'camera' : undefined}
            onPress={() => void disparar()}
            cargando={disparando}
            deshabilitado={!lista}
          />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedorNeutro: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedorCamara: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camara: {
    flex: 1,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    padding: espaciado.md,
    backgroundColor: colores.fondo,
  },
  botonCancelar: {
    minHeight: ALTO_MINIMO_PULSABLE,
    paddingHorizontal: espaciado.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCancelar: {
    ...tipografia.cuerpoFuerte,
    color: colores.textoSecundario,
  },
  botonDisparo: {
    flex: 1,
  },
  avisoError: {
    backgroundColor: colores.error,
    padding: espaciado.sm,
  },
  textoError: {
    ...tipografia.cuerpo,
    color: colores.textoSobrePrimario,
    textAlign: 'center',
  },
  contenedorPermiso: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.sm,
    backgroundColor: colores.fondo,
  },
  tituloPermiso: {
    ...tipografia.subtitulo,
    color: colores.texto,
    textAlign: 'center',
  },
  textoPermiso: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  accionesPermiso: {
    alignSelf: 'stretch',
    marginTop: espaciado.lg,
    gap: espaciado.sm,
  },
});
