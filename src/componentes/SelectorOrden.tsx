/** Selector del criterio de ordenamiento del listado (RF-03). */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ALTO_MINIMO_PULSABLE, colores, espaciado, radio, tipografia } from '@/tema/tema';
import { OPCIONES_ORDEN, type ClaveOrden } from '@/utilidades/estrategiasOrden';

type Props = {
  seleccionada: ClaveOrden;
  onCambiar: (clave: ClaveOrden) => void;
};

export default function SelectorOrden({ seleccionada, onCambiar }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>Ordenar por</Text>
      <View style={estilos.grupo}>
        {OPCIONES_ORDEN.map((opcion) => {
          const activa = opcion.clave === seleccionada;

          return (
            <Pressable
              key={opcion.clave}
              accessibilityRole="radio"
              accessibilityState={{ selected: activa }}
              accessibilityLabel={`Ordenar por ${opcion.etiqueta}`}
              onPress={() => onCambiar(opcion.clave)}
              style={[estilos.opcion, activa && estilos.opcionActiva]}>
              <Text style={[estilos.textoOpcion, activa && estilos.textoOpcionActiva]}>
                {opcion.etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.xs,
  },
  etiqueta: {
    ...tipografia.pie,
    color: colores.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grupo: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  opcion: {
    flex: 1,
    minHeight: ALTO_MINIMO_PULSABLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.sm,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  opcionActiva: {
    borderColor: colores.primario,
    backgroundColor: colores.primario,
  },
  textoOpcion: {
    ...tipografia.etiqueta,
    color: colores.textoSecundario,
  },
  textoOpcionActiva: {
    color: colores.textoSobrePrimario,
  },
});
