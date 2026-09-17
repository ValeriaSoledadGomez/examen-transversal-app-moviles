/**
 * RF-03. Listado de avistamientos.
 *
 * Suscriptor del contexto (patron Observador): no pide datos ni sabe que existe
 * AsyncStorage. Cuando el formulario guarda, esta pantalla se actualiza sola.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import EstadoCarga from '@/componentes/EstadoCarga';
import EstadoError from '@/componentes/EstadoError';
import EstadoVacio from '@/componentes/EstadoVacio';
import SelectorOrden from '@/componentes/SelectorOrden';
import TarjetaAvistamiento from '@/componentes/TarjetaAvistamiento';
import { usarAvistamientos } from '@/hooks/usarAvistamientos';
import { colores, espaciado } from '@/tema/tema';
import { ordenarAvistamientos, type ClaveOrden } from '@/utilidades/estrategiasOrden';

export default function PantallaListado() {
  const router = useRouter();
  const { avistamientos, cargando, error, reintentar } = usarAvistamientos();
  const [orden, setOrden] = useState<ClaveOrden>('fecha');

  // Se calcula una sola vez por cambio de datos o de criterio, no en cada
  // renderizado (medida 3 de optimización, BRIEF.md sección 10).
  const ordenados = useMemo(
    () => ordenarAvistamientos(avistamientos, orden),
    [avistamientos, orden],
  );

  function irAlRegistro() {
    router.push('/registro');
  }

  function irAlDetalle(id: string) {
    router.push(`/avistamiento/${id}`);
  }

  // Orden de evaluacion obligatorio (AGENTS.md, sección 5):
  // cargando, error, vacio, datos.
  if (cargando) {
    return <EstadoCarga mensaje="Cargando avistamientos" />;
  }

  if (error) {
    return (
      <EstadoError
        titulo="No se pudo cargar el listado"
        mensaje={error}
        onReintentar={reintentar}
      />
    );
  }

  if (avistamientos.length === 0) {
    return (
      <View style={estilos.contenedor}>
        <EstadoVacio
          titulo="Aún no hay avistamientos"
          mensaje="Registra el primero cuando veas un ave en terreno. Necesitarás una foto y la ubicación."
          textoAccion="Registrar avistamiento"
          onAccion={irAlRegistro}
        />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <FlatList
        data={ordenados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TarjetaAvistamiento avistamiento={item} onPress={irAlDetalle} />
        )}
        ListHeaderComponent={
          <View style={estilos.cabecera}>
            <SelectorOrden seleccionada={orden} onCambiar={setOrden} />
          </View>
        }
        contentContainerStyle={estilos.lista}
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
        removeClippedSubviews
      />

      {/* Acceso directo y permanente al formulario, como exige RF-03. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Registrar un avistamiento"
        onPress={irAlRegistro}
        style={({ pressed }) => [estilos.botonFlotante, pressed && estilos.botonPresionado]}>
        <MaterialCommunityIcons name="plus" size={32} color={colores.textoSobrePrimario} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  lista: {
    padding: espaciado.md,
    paddingBottom: 96,
  },
  cabecera: {
    marginBottom: espaciado.md,
  },
  separador: {
    height: espaciado.sm,
  },
  botonFlotante: {
    position: 'absolute',
    right: espaciado.md,
    bottom: espaciado.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  botonPresionado: {
    opacity: 0.8,
  },
});
