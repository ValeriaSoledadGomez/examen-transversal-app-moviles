/**
 * Campo de formulario con su mensaje de validación propio.
 *
 * RF-01 exige avisar con un mensaje claro cual campo falta: el error se muestra
 * junto al campo afectado, no solo como alerta global.
 */

import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { ALTO_MINIMO_PULSABLE, colores, espaciado, radio, tipografia } from '@/tema/tema';

type Props = {
  etiqueta: string;
  valor: string;
  onCambiar: (valor: string) => void;
  marcadorPosicion?: string;
  error?: string;
  ayuda?: string;
  multilinea?: boolean;
  tipoTeclado?: KeyboardTypeOptions;
  soloLectura?: boolean;
};

export default function CampoTexto({
  etiqueta,
  valor,
  onCambiar,
  marcadorPosicion,
  error,
  ayuda,
  multilinea = false,
  tipoTeclado = 'default',
  soloLectura = false,
}: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>

      <TextInput
        accessibilityLabel={etiqueta}
        value={valor}
        onChangeText={onCambiar}
        placeholder={marcadorPosicion}
        placeholderTextColor={colores.deshabilitado}
        multiline={multilinea}
        keyboardType={tipoTeclado}
        editable={!soloLectura}
        style={[
          estilos.entrada,
          multilinea && estilos.entradaMultilinea,
          soloLectura && estilos.entradaSoloLectura,
          Boolean(error) && estilos.entradaConError,
        ]}
      />

      {error ? (
        <Text style={estilos.error}>{error}</Text>
      ) : ayuda ? (
        <Text style={estilos.ayuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.xs,
  },
  etiqueta: {
    ...tipografia.etiqueta,
    color: colores.texto,
  },
  entrada: {
    ...tipografia.cuerpo,
    minHeight: ALTO_MINIMO_PULSABLE,
    color: colores.texto,
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.sm,
  },
  entradaMultilinea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  entradaSoloLectura: {
    backgroundColor: colores.fondo,
    color: colores.textoSecundario,
  },
  entradaConError: {
    borderColor: colores.error,
  },
  error: {
    ...tipografia.pie,
    color: colores.error,
  },
  ayuda: {
    ...tipografia.pie,
    color: colores.textoSecundario,
  },
});
