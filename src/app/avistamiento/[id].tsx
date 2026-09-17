/**
 * RF-04. Detalle de un avistamiento.
 *
 * Recibe solo el id por parametro de ruta y lee el avistamiento del contexto.
 * No se pasan objetos por parametros de navegación: los parametros de URL son
 * cadenas y serializar un avistamiento completo ahi seria fragil.
 *
 * El clima NO se vuelve a consultar: es el dato historico del momento en que se
 * registro el avistamiento.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import BotonPrimario from '@/componentes/BotonPrimario';
import EstadoError from '@/componentes/EstadoError';
import { usarAvistamientos } from '@/hooks/usarAvistamientos';
import { resolverUriFoto } from '@/servicios/servicioFotos';
import { obtenerDireccion } from '@/servicios/servicioUbicacion';
import { colores, espaciado, radio, tipografia } from '@/tema/tema';
import {
  formatearCantidad,
  formatearCoordenadas,
  formatearFechaLarga,
  formatearHumedad,
  formatearTemperatura,
  formatearViento,
} from '@/utilidades/formato';

export default function PantallaDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { obtenerPorId } = usarAvistamientos();
  const avistamiento = obtenerPorId(id);

  const [direccionResuelta, setDireccionResuelta] = useState<string | null>(
    avistamiento?.direccion ?? null,
  );

  // La dirección se resolvio y persistio al guardar. Si aquella vez fallo, se
  // intenta una sola vez mas aquí, con las coordenadas como respaldo final.
  useEffect(() => {
    if (!avistamiento || direccionResuelta) return;

    let vigente = true;
    void obtenerDireccion(avistamiento.latitud, avistamiento.longitud).then((direccion) => {
      if (vigente) setDireccionResuelta(direccion);
    });

    return () => {
      vigente = false;
    };
  }, [avistamiento, direccionResuelta]);

  if (!avistamiento) {
    return (
      <EstadoError
        titulo="No se encontro el avistamiento"
        mensaje="Es posible que haya sido eliminado."
        textoAccion="Volver al listado"
        onReintentar={() => router.replace('/')}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: avistamiento.nombreAve }} />

      <Image
        source={{ uri: resolverUriFoto(avistamiento.fotoNombreArchivo) }}
        style={estilos.fotografia}
        contentFit="cover"
        transition={200}
      />

      <Text style={estilos.nombre}>{avistamiento.nombreAve}</Text>
      <Text style={estilos.fecha}>{formatearFechaLarga(avistamiento.fechaAvistamiento)}</Text>

      <Dato icono="counter" etiqueta="Cantidad" valor={formatearCantidad(avistamiento.cantidad)} />

      <View style={estilos.bloque}>
        <Text style={estilos.tituloBloque}>Ubicación</Text>
        {/* RF-04: la ubicacion se presenta en formato entendible para una
            persona. Las coordenadas quedan como dato secundario. */}
        <Text style={estilos.valorPrincipal}>
          {direccionResuelta ?? 'No se pudo determinar la dirección de este punto'}
        </Text>
        <Text style={estilos.valorSecundario}>
          {formatearCoordenadas(avistamiento.latitud, avistamiento.longitud)}
          {avistamiento.precisionMetros !== null
            ? ` · precisión de ${Math.round(avistamiento.precisionMetros)} metros`
            : ''}
        </Text>
      </View>

      <View style={estilos.bloque}>
        <Text style={estilos.tituloBloque}>Clima registrado</Text>

        {avistamiento.clima ? (
          <View style={estilos.tarjetaClima}>
            <View style={estilos.encabezadoClima}>
              <MaterialCommunityIcons
                name={avistamiento.clima.icono as keyof typeof MaterialCommunityIcons.glyphMap}
                size={44}
                color={colores.acento}
              />
              <View style={estilos.textoClima}>
                {/* Se muestra la descripcion, nunca el weather_code crudo. */}
                <Text style={estilos.descripcionClima}>{avistamiento.clima.descripcion}</Text>
                <Text style={estilos.temperaturaClima}>
                  {formatearTemperatura(avistamiento.clima.temperaturaC)}
                </Text>
              </View>
            </View>

            <View style={estilos.medidasClima}>
              <Medida
                etiqueta="Humedad"
                valor={formatearHumedad(avistamiento.clima.humedadRelativa)}
              />
              <Medida etiqueta="Viento" valor={formatearViento(avistamiento.clima.vientoKmh)} />
            </View>
          </View>
        ) : (
          <View style={estilos.sinClima}>
            <MaterialCommunityIcons
              name="cloud-off-outline"
              size={28}
              color={colores.textoSecundario}
            />
            <Text style={estilos.valorSecundario}>
              No se pudo obtener el clima en el momento del registro.
            </Text>
          </View>
        )}
      </View>

      {avistamiento.notas ? (
        <View style={estilos.bloque}>
          <Text style={estilos.tituloBloque}>Notas</Text>
          <Text style={estilos.valorPrincipal}>{avistamiento.notas}</Text>
        </View>
      ) : null}

      <View style={estilos.acciones}>
        <BotonPrimario
          titulo="Volver al listado"
          icono="arrow-left"
          variante="secundario"
          onPress={() => router.back()}
        />
      </View>
    </ScrollView>
  );
}

function Dato({ icono, etiqueta, valor }: { icono: string; etiqueta: string; valor: string }) {
  return (
    <View style={estilos.dato}>
      <MaterialCommunityIcons
        name={icono as keyof typeof MaterialCommunityIcons.glyphMap}
        size={22}
        color={colores.primarioClaro}
      />
      <Text style={estilos.etiquetaDato}>{etiqueta}</Text>
      <Text style={estilos.valorDato}>{valor}</Text>
    </View>
  );
}

function Medida({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.medida}>
      <Text style={estilos.etiquetaMedida}>{etiqueta}</Text>
      <Text style={estilos.valorMedida}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: espaciado.md,
    gap: espaciado.md,
    paddingBottom: espaciado.xxl,
  },
  fotografia: {
    width: '100%',
    height: 300,
    borderRadius: radio.md,
    backgroundColor: colores.borde,
  },
  nombre: {
    ...tipografia.titulo,
    color: colores.texto,
  },
  fecha: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    marginTop: -espaciado.sm,
  },
  dato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    backgroundColor: colores.superficie,
    borderRadius: radio.sm,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.sm,
  },
  etiquetaDato: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    flex: 1,
  },
  valorDato: {
    ...tipografia.cuerpoFuerte,
    color: colores.texto,
  },
  bloque: {
    gap: espaciado.xs,
  },
  tituloBloque: {
    ...tipografia.etiqueta,
    color: colores.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valorPrincipal: {
    ...tipografia.cuerpo,
    color: colores.texto,
  },
  valorSecundario: {
    ...tipografia.pie,
    color: colores.textoSecundario,
    flexShrink: 1,
  },
  tarjetaClima: {
    backgroundColor: colores.superficie,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
    gap: espaciado.md,
  },
  encabezadoClima: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  textoClima: {
    flex: 1,
  },
  descripcionClima: {
    ...tipografia.subtitulo,
    color: colores.texto,
  },
  temperaturaClima: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
  },
  medidasClima: {
    flexDirection: 'row',
    gap: espaciado.md,
  },
  medida: {
    flex: 1,
    backgroundColor: colores.fondo,
    borderRadius: radio.sm,
    padding: espaciado.sm,
  },
  etiquetaMedida: {
    ...tipografia.pie,
    color: colores.textoSecundario,
  },
  valorMedida: {
    ...tipografia.cuerpoFuerte,
    color: colores.texto,
  },
  sinClima: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    backgroundColor: colores.superficie,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
  },
  acciones: {
    marginTop: espaciado.md,
  },
});
