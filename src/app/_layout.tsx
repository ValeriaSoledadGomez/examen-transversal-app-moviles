import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colores } from '@/tema/tema';

export default function DisposicionRaiz() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.primario },
          headerTintColor: colores.textoSobrePrimario,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colores.fondo },
        }}>
        <Stack.Screen name="index" options={{ title: 'Avistamientos' }} />
      </Stack>
    </>
  );
}
