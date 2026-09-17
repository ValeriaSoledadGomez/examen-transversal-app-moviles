/**
 * Presentación del clima. El weather_code crudo no aparece nunca aquí:
 * llega ya traducido a descripción e icono (AGENTS.md, sección 7).
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ClimaRegistrado } from '@/modelos/clima';
import { colores, espaciado, radio, tipografia } from '@/tema/tema';
import { formatearTemperatura } from '@/utilidades/formato';

type Props = {
  clima: ClimaRegistrado | null;
  compacta?: boolean;
};

export default function InsigniaClima({ clima, compacta = false }: Props) {
  // Un avistamiento sin clima muestra un indicador explicito, no un hueco.
  if (!clima) {
    return (
      <View style={[estilos.contenedor, estilos.sinDato]}>
        <MaterialCommunityIcons
          name="cloud-off-outline"
          size={compacta ? 18 : 22}
          color={colores.textoSecundario}
        />
        <Text style={[estilos.texto, estilos.textoSinDato]}>Sin clima</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <MaterialCommunityIcons
        // El nombre viene del dominio como cadena, porque se persiste en JSON.
        // El estrechamiento al tipo del glifo ocurre aquí, en el limite con la
        // biblioteca de iconos.
        name={clima.icono as keyof typeof MaterialCommunityIcons.glyphMap}
        size={compacta ? 18 : 22}
        color={colores.acento}
      />
      <Text style={estilos.texto}>
        {compacta
          ? formatearTemperatura(clima.temperaturaC)
          : `${formatearTemperatura(clima.temperaturaC)} · ${clima.descripcion}`}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
    backgroundColor: colores.fondo,
    borderRadius: radio.sm,
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.xs,
    alignSelf: 'flex-start',
  },
  sinDato: {
    backgroundColor: colores.fondo,
  },
  texto: {
    ...tipografia.etiqueta,
    color: colores.texto,
  },
  textoSinDato: {
    color: colores.textoSecundario,
    fontWeight: '400',
  },
});
