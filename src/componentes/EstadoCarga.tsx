/** Estado de carga. Nunca una pantalla en blanco (AGENTS.md, sección 5). */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, tipografia } from '@/tema/tema';

export default function EstadoCarga({ mensaje }: { mensaje: string }) {
  return (
    <View style={estilos.contenedor}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={estilos.mensaje}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  mensaje: {
    ...tipografia.cuerpo,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});
