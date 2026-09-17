/**
 * PATRON COMPUESTO: este componente agrupa icono, titulo, texto y boton, y desde
 * fuera se usa como si fuera una hoja. Ver BRIEF.md, sección 11.
 *
 * RF-03 exige un estado vacio diseñado, no una pantalla en blanco.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import BotonPrimario from '@/componentes/BotonPrimario';
import { colores, espaciado, tipografia } from '@/tema/tema';

type Props = {
  titulo: string;
  mensaje: string;
  textoAccion: string;
  onAccion: () => void;
};

export default function EstadoVacio({ titulo, mensaje, textoAccion, onAccion }: Props) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.circulo}>
        <MaterialCommunityIcons name="bird" size={64} color={colores.primarioClaro} />
      </View>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.mensaje}>{mensaje}</Text>
      <View style={estilos.accion}>
        <BotonPrimario titulo={textoAccion} onPress={onAccion} icono="plus" />
      </View>
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
  circulo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaciado.md,
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
    maxWidth: 320,
  },
  accion: {
    marginTop: espaciado.lg,
    alignSelf: 'stretch',
  },
});
