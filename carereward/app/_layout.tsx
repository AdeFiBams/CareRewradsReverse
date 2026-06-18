import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadSession, isLoading } = useAuthStore();

  useEffect(() => {
    loadSession().finally(() => SplashScreen.hideAsync());
  }, []);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)"  options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)"  options={{ animation: 'fade' }} />
        <Stack.Screen name="opportunity/[id]" options={{ headerShown: true, title: 'Opportunity', presentation: 'card' }} />
        <Stack.Screen name="claim/[id]"       options={{ headerShown: true, title: 'Claim Detail', presentation: 'card' }} />
        <Stack.Screen name="points/index"     options={{ headerShown: true, title: 'My Points',    presentation: 'card' }} />
        <Stack.Screen name="points/redeem"    options={{ headerShown: true, title: 'Redeem Points', presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
