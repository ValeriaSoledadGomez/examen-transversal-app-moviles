/**
 * PATRON COMPUESTO. Ver BRIEF.md, sección 11.
 *
 * Esta tarjeta es un contenedor: compone la miniatura, los bloques de texto y el
 * componente InsigniaClima. Al mismo tiempo, desde la FlatList de src/app/index.tsx
 * es una hoja, tratada igual que se trataria a un Text. Esa uniformidad de
 * interfaz (recibir props y devolver elementos) es lo que permite anidar
 * componentes de forma recursiva hasta la jerarquia de vistas nativas.
 *
 * Envuelta en React.memo: al cambiar el criterio de ordenamiento se reordena el
 * arreglo, pero los datos de cada tarjeta no cambian y no hace falta volver a
 * renderizarlas (medida 3 de optimización, BRIEF.md sección 10).
 */

import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import InsigniaClima from '@/componentes/InsigniaClima';
import type { Avistamiento } from '@/modelos/avistamiento';
import { resolverUriFoto } from '@/servicios/servicioFotos';
import { colores, espaciado, radio, tipografia } from '@/tema/tema';
import { formatearCantidad, formatearFechaCorta } from '@/utilidades/formato';

type Props = {
  avistamiento: Avistamiento;
  onPress: (id: string) => void;
};

function TarjetaAvistamiento({ avistamiento, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${avistamiento.nombreAve}`}
      onPress={() => onPress(avistamiento.id)}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}>
      <Image
        // La ruta se reconstruye en cada lectura desde el nombre persistido.
        source={{ uri: resolverUriFoto(avistamiento.fotoNombreArchivo) }}
        style={estilos.miniatura}
        contentFit="cover"
        transition={150}
      />

      <View style={estilos.datos}>
        <Text style={estilos.nombre} numberOfLines={1}>
          {avistamiento.nombreAve}
        </Text>
        <Text style={estilos.fecha}>{formatearFechaCorta(avistamiento.fechaAvistamiento)}</Text>
        <Text style={estilos.cantidad}>{formatearCantidad(avistamiento.cantidad)}</Text>
        <InsigniaClima clima={avistamiento.clima} compacta />
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    gap: espaciado.md,
    backgroundColor: colores.superficie,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.sm,
  },
  presionada: {
    opacity: 0.7,
  },
  miniatura: {
    width: 88,
    height: 88,
    borderRadius: radio.sm,
    backgroundColor: colores.borde,
  },
  datos: {
    flex: 1,
    gap: espaciado.xs,
    justifyContent: 'center',
  },
  nombre: {
    ...tipografia.subtitulo,
    color: colores.texto,
  },
  fecha: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
  },
  cantidad: {
    ...tipografia.pie,
    color: colores.textoSecundario,
  },
});

export default memo(TarjetaAvistamiento);
