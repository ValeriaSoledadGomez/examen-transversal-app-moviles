/**
 * Boton de accion. Alto minimo de 48 puntos para uso en terreno con una mano.
 * Se deshabilita solo mientras corre una operacion asincrona, con su propio
 * indicador, para que no exista el doble disparo.
 */

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ALTO_MINIMO_PULSABLE, colores, espaciado, radio, tipografia } from '@/tema/tema';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  cargando?: boolean;
  deshabilitado?: boolean;
  icono?: string;
};

export default function BotonPrimario({
  titulo,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  icono,
}: Props) {
  const esSecundario = variante === 'secundario';
  const inactivo = deshabilitado || cargando;
  const colorContenido = esSecundario ? colores.primario : colores.textoSobrePrimario;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.base,
        esSecundario ? estilos.secundario : estilos.primario,
        inactivo && (esSecundario ? estilos.secundarioInactivo : estilos.primarioInactivo),
        pressed && !inactivo && estilos.presionado,
      ]}>
      {cargando ? (
        <ActivityIndicator color={colorContenido} />
      ) : (
        <View style={estilos.contenido}>
          {icono ? (
            <MaterialCommunityIcons
              name={icono as keyof typeof MaterialCommunityIcons.glyphMap}
              size={22}
              color={inactivo ? colores.deshabilitado : colorContenido}
            />
          ) : null}
          <Text
            style={[
              estilos.texto,
              { color: inactivo ? colores.deshabilitado : colorContenido },
            ]}>
            {titulo}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: ALTO_MINIMO_PULSABLE,
    borderRadius: radio.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
  },
  primario: {
    backgroundColor: colores.primario,
  },
  secundario: {
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.primario,
  },
  primarioInactivo: {
    backgroundColor: colores.borde,
  },
  secundarioInactivo: {
    borderColor: colores.borde,
  },
  presionado: {
    opacity: 0.75,
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  texto: {
    ...tipografia.cuerpoFuerte,
    textAlign: 'center',
  },
});
