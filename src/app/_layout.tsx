/**
 * Disposicion raiz. Monta el stack de navegación (RF-06) y el proveedor del
 * estado compartido de avistamientos (patron Observador).
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProveedorAvistamientos } from '@/contexto/ContextoAvistamientos';
import { colores } from '@/tema/tema';

export default function DisposicionRaiz() {
  return (
    <ProveedorAvistamientos>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.primario },
          headerTintColor: colores.textoSobrePrimario,
          headerTitleStyle: { fontWeight: '600' },
          headerBackTitle: 'Atras',
          contentStyle: { backgroundColor: colores.fondo },
        }}>
        <Stack.Screen name="index" options={{ title: 'Avistamientos' }} />
        <Stack.Screen name="registro" options={{ title: 'Nuevo avistamiento' }} />
        <Stack.Screen name="avistamiento/[id]" options={{ title: 'Detalle' }} />
      </Stack>
    </ProveedorAvistamientos>
  );
}
