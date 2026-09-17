/** Estado de error con salida. Un error sin reintento es un callejon sin salida. */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import BotonPrimario from '@/componentes/BotonPrimario';
import { colores, espaciado, tipografia } from '@/tema/tema';

type Props = {
  titulo: string;
  mensaje: string;
  onReintentar?: () => void;
  textoAccion?: string;
};

export default function EstadoError({
  titulo,
  mensaje,
  onReintentar,
  textoAccion = 'Reintentar',
}: Props) {
  return (
    <View style={estilos.contenedor}>
      <MaterialCommunityIcons name="alert-circle-outline" size={56} color={colores.error} />
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.mensaje}>{mensaje}</Text>
      {onReintentar ? (
        <View style={estilos.accion}>
          <BotonPrimario titulo={textoAccion} onPress={onReintentar} icono="refresh" />
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.sm,
  },
  titulo: {
    ...tipografia.subtitulo,
    color: colores.texto,
    textAlign: 'center',
  },
  mensaje: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  accion: {
    marginTop: espaciado.md,
    alignSelf: 'stretch',
  },
});
