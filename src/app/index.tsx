/**
 * TEMPORAL — Fase 0. Pantalla de verificación del entorno.
 *
 * No es ninguna de las tres pantallas de la aplicación. Existe para comprobar, antes de
 * construir nada encima, que el emulador entrega cámara, GPS, geocodificación, red y
 * escritura persistente de archivos. Desactiva los riesgos R-01, R-02, R-04, R-05 y R-06
 * del BRIEF en la primera fase, cuando todavía hay tiempo de reaccionar.
 *
 * Se elimina al cerrar la fase 1, junto con src/servicios/verificacionEntorno.ts.
 */

import { CameraView, useCameraPermissions } from 'expo-camera';
import { Directory, File, Paths } from 'expo-file-system';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  verificarClima,
  verificarGeocodificacion,
  verificarUbicacion,
} from '@/servicios/verificacionEntorno';
import { ALTO_MINIMO_PULSABLE, colores, espaciado, radio, tipografia } from '@/tema/tema';

type Linea = { etiqueta: string; estado: 'ok' | 'falla'; detalle: string };

export default function PantallaVerificacion() {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [ejecutando, setEjecutando] = useState(false);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [camaraLista, setCamaraLista] = useState(false);
  const [fotoPersistida, setFotoPersistida] = useState<string | null>(null);
  const [permisoCamara, solicitarPermisoCamara] = useCameraPermissions();
  const camaraRef = useRef<CameraView>(null);

  function agregar(etiqueta: string, estado: 'ok' | 'falla', detalle: string) {
    setLineas((previas) => [...previas, { etiqueta, estado, detalle }]);
  }

  async function verificarSensores() {
    setEjecutando(true);
    setLineas([]);

    try {
      const ubicacion = await verificarUbicacion();
      agregar('GPS', ubicacion.ok ? 'ok' : 'falla', ubicacion.detalle);

      if (!ubicacion.ok) return;

      const [latitudTexto, longitudTexto] = ubicacion.detalle.split(', ');
      const latitud = Number(latitudTexto);
      const longitud = Number(longitudTexto);

      try {
        const direccion = await verificarGeocodificacion(latitud, longitud);
        agregar('Geocodificación inversa', direccion.ok ? 'ok' : 'falla', direccion.detalle);
      } catch (error) {
        agregar('Geocodificación inversa', 'falla', describirError(error));
      }

      try {
        const clima = await verificarClima(latitud, longitud);
        agregar('Open-Meteo', clima.ok ? 'ok' : 'falla', clima.detalle);
      } catch (error) {
        agregar('Open-Meteo', 'falla', describirError(error));
      }
    } catch (error) {
      agregar('GPS', 'falla', describirError(error));
    } finally {
      setEjecutando(false);
    }
  }

  async function abrirCamara() {
    if (!permisoCamara?.granted) {
      const respuesta = await solicitarPermisoCamara();
      if (!respuesta.granted) {
        agregar('Cámara', 'falla', 'Permiso de cámara denegado');
        return;
      }
    }
    setCamaraLista(false);
    setCamaraAbierta(true);
  }

  async function dispararYPersistir() {
    try {
      const captura = await camaraRef.current?.takePictureAsync({ quality: 0.7 });
      setCamaraAbierta(false);

      if (!captura?.uri) {
        agregar('Cámara', 'falla', 'La captura no devolvió ningún archivo');
        return;
      }
      agregar('Cámara', 'ok', 'Captura realizada en el directorio de caché');

      // Comprobación de RF-05: el archivo de caché debe sobrevivir en el
      // directorio de documentos, que el sistema no vacía.
      const carpetaFotos = new Directory(Paths.document, 'fotos');
      if (!carpetaFotos.exists) {
        carpetaFotos.create();
      }

      const archivoCapturado = new File(captura.uri);
      await archivoCapturado.move(carpetaFotos);

      setFotoPersistida(archivoCapturado.uri);
      agregar(
        'Persistencia de la foto',
        'ok',
        `${archivoCapturado.name} (${Math.round((archivoCapturado.size ?? 0) / 1024)} kB)`,
      );
    } catch (error) {
      setCamaraAbierta(false);
      agregar('Cámara', 'falla', describirError(error));
    }
  }

  if (camaraAbierta) {
    return (
      <View style={estilos.contenedorCamara}>
        <CameraView
          ref={camaraRef}
          style={estilos.camara}
          facing="back"
          onCameraReady={() => setCamaraLista(true)}
        />
        <View style={estilos.controlesCamara}>
          <Pressable
            style={[estilos.boton, estilos.botonSecundario]}
            onPress={() => setCamaraAbierta(false)}>
            <Text style={estilos.textoBotonSecundario}>Cancelar</Text>
          </Pressable>
          {/*
            El disparo queda bloqueado hasta onCameraReady. Sin esta espera el sensor
            todavía no entrega imagen y takePictureAsync devuelve un JPEG en negro.
            La documentación de expo-camera lo exige de forma explícita.
          */}
          <Pressable
            style={[estilos.boton, !camaraLista && estilos.botonDeshabilitado]}
            onPress={dispararYPersistir}
            disabled={!camaraLista}>
            <Text style={estilos.textoBoton}>
              {camaraLista ? 'Disparar' : 'Preparando cámara'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Text style={estilos.titulo}>Verificación del entorno</Text>
      <Text style={estilos.parrafo}>
        Fase 0. Comprueba que el emulador entrega cámara, GPS, geocodificación, red y escritura
        persistente antes de construir la aplicación.
      </Text>

      <Pressable
        style={[estilos.boton, ejecutando && estilos.botonDeshabilitado]}
        onPress={verificarSensores}
        disabled={ejecutando}>
        {ejecutando ? (
          <ActivityIndicator color={colores.textoSobrePrimario} />
        ) : (
          <Text style={estilos.textoBoton}>Verificar GPS, dirección y clima</Text>
        )}
      </Pressable>

      <Pressable style={[estilos.boton, estilos.botonSecundario]} onPress={abrirCamara}>
        <Text style={estilos.textoBotonSecundario}>Probar cámara y persistencia</Text>
      </Pressable>

      {lineas.map((linea, indice) => (
        <View key={`${linea.etiqueta}-${indice}`} style={estilos.fila}>
          <Text style={[estilos.estado, linea.estado === 'ok' ? estilos.ok : estilos.falla]}>
            {linea.estado === 'ok' ? 'OK' : 'FALLA'}
          </Text>
          <View style={estilos.filaTexto}>
            <Text style={estilos.etiqueta}>{linea.etiqueta}</Text>
            <Text style={estilos.detalle}>{linea.detalle}</Text>
          </View>
        </View>
      ))}

      {fotoPersistida ? (
        <View style={estilos.bloqueFoto}>
          <Text style={estilos.etiqueta}>Foto leída desde el directorio de documentos</Text>
          <Image source={{ uri: fotoPersistida }} style={estilos.miniatura} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function describirError(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido';
}

const estilos = StyleSheet.create({
  contenido: {
    padding: espaciado.md,
    gap: espaciado.sm,
  },
  titulo: {
    ...tipografia.titulo,
    color: colores.texto,
  },
  parrafo: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    marginBottom: espaciado.sm,
  },
  boton: {
    minHeight: ALTO_MINIMO_PULSABLE,
    backgroundColor: colores.primario,
    borderRadius: radio.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaciado.md,
  },
  botonSecundario: {
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.primario,
  },
  botonDeshabilitado: {
    backgroundColor: colores.deshabilitado,
  },
  textoBoton: {
    ...tipografia.cuerpoFuerte,
    color: colores.textoSobrePrimario,
  },
  textoBotonSecundario: {
    ...tipografia.cuerpoFuerte,
    color: colores.primario,
  },
  fila: {
    flexDirection: 'row',
    gap: espaciado.sm,
    backgroundColor: colores.superficie,
    borderRadius: radio.sm,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.sm,
    marginTop: espaciado.xs,
  },
  filaTexto: {
    flex: 1,
  },
  estado: {
    ...tipografia.etiqueta,
    width: 56,
  },
  ok: {
    color: colores.exito,
  },
  falla: {
    color: colores.error,
  },
  etiqueta: {
    ...tipografia.cuerpoFuerte,
    color: colores.texto,
  },
  detalle: {
    ...tipografia.pie,
    color: colores.textoSecundario,
  },
  bloqueFoto: {
    marginTop: espaciado.md,
    gap: espaciado.sm,
  },
  miniatura: {
    width: '100%',
    height: 240,
    borderRadius: radio.md,
    backgroundColor: colores.borde,
  },
  contenedorCamara: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camara: {
    flex: 1,
  },
  controlesCamara: {
    flexDirection: 'row',
    gap: espaciado.md,
    padding: espaciado.md,
    backgroundColor: colores.fondo,
  },
});
