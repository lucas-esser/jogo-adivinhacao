import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#f4f7fb' }, headerTintColor: '#17324f', headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: '#f4f7fb' } }}>
        <Stack.Screen name="index" options={{ title: 'Jogo de Adivinhação' }} />
        <Stack.Screen name="ranking" options={{ title: 'Ranking' }} />
      </Stack>
    </>
  );
}
