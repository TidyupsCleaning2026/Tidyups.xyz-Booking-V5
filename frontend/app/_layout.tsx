import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from "expo-status-bar";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { useAppFonts } from "@/src/hooks/use-app-fonts";
import { AppErrorBoundary, ErrorFallback } from "@/src/components/ErrorBoundary";

LogBox.ignoreAllLogs(true);

SplashScreen.preventAutoHideAsync();

// Expo Router route-level error boundary: catches render errors thrown by any
// screen in this segment and shows a recoverable fallback instead of crashing.
export function ErrorBoundary({ retry }: { error: Error; retry: () => Promise<void> }) {
  return <ErrorFallback onRetry={retry} />;
}

export default function RootLayout() {
  const [iconsLoaded, iconError] = useIconFonts();
  const [fontsLoaded, fontError] = useAppFonts();

  const ready = (iconsLoaded || iconError) && (fontsLoaded || fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <StatusBar style="dark" />
          <AppErrorBoundary>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FAFAF9" } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="quote" options={{ presentation: "card" }} />
              <Stack.Screen name="success" options={{ gestureEnabled: false }} />
              <Stack.Screen name="admin" />
              <Stack.Screen name="leads" options={{ gestureEnabled: false }} />
              <Stack.Screen name="privacy" />
            </Stack>
          </AppErrorBoundary>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
