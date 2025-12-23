import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';

export const unstable_settings = {
  anchor: 'onboarding',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    'YouSans-Regular': require('../assets/fonts/YouSans-Regular.ttf'),
    'YouSans-Medium': require('../assets/fonts/YouSans-Medium.ttf'),
    'YouSans-Bold': require('../assets/fonts/YouSans-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
              initialRouteName="onboarding"
              screenOptions={{
                headerShown: false,
                headerShadowVisible: false,
                headerBackground: () => (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#FFFFFF',
                      borderBottomWidth: 3,
                      borderBottomColor: '#E6E6E6',
                    }}
                  />
                ),
                headerLeft: () => (
                  <Pressable onPress={() => router.back()} hitSlop={12} style={{ paddingLeft: 8, paddingRight: 30 }}>
                    <MaterialIcons name="west" size={22} color="#000" />
                  </Pressable>
                ),
                headerTitleStyle: {
                  fontFamily: 'YouSans-Regular',
                  fontSize: 18,
                },
              }}
            >
              <Stack.Screen name="onboarding" options={{ headerShown: true }} />
              <Stack.Screen name="login" options={{ title: 'Pav Dental', headerShown: true }} />
              <Stack.Screen name="register-email" options={{ title: 'Pav Dental', headerShown: true }} />
              <Stack.Screen name="register" options={{ title: 'Pav Dental', headerShown: true }} />
              <Stack.Screen name="home" options={{ headerShown: true }} />
              <Stack.Screen name="service-selection" options={{ title: 'Select Service', headerShown: true }} />
              <Stack.Screen name="dentist-selection" options={{ title: 'Select Dentist', headerShown: true }} />
              <Stack.Screen name="date-time-selection" options={{ title: 'Select Date & Time', headerShown: true }} />
              <Stack.Screen name="appointment-notes" options={{ title: 'Appointment Notes', headerShown: true }} />
              <Stack.Screen name="booking" options={{ title: 'Book Appointment', headerShown: true }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
