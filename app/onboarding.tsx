import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { Link, router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function OnboardingScreen() {
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        router.replace('/home');
      }
    });
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ header: () => null }} />
      <Image
        style={styles.image}
        source={require('../assets/images/onboarding.png')}
      />
      <View style={styles.ctaRow}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.heading} >See a Dentist by Video
          </ThemedText>
          <ThemedText style={styles.subHeading}>Book a video appointment with a Dentist, and get a prescription if you need one.
          </ThemedText>
        </View>
        <Link href="/register-email" style={styles.primaryCta}>
          <ThemedText style={styles.ctaText} type="link">Get Started</ThemedText>
        </Link>
        <ThemedText style={styles.time}>
          Our dentists and specialists are available every day between 06:00 - 24:00
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    alignItems: 'center',
    gap: 12,
  },
  image: {
    flex: 1,
    width: "100%"
  },
  ctaRow: {
    padding: 16
  },
  textContainer: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 30,
    lineHeight: 40,
    paddingTop: 20,
    paddingBottom: 10,
    fontFamily: 'YouSans-Bold',
    color: "#36200e"
  },
  subHeading: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 20,
    paddingBottom: 10,

    fontFamily: 'YouSans-Regular'
  },

  primaryCta: {
    backgroundColor: "#925927",
    paddingVertical: 14,
    borderRadius: 6,

  },
  ctaText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
    textAlign: "center",
    fontFamily: 'YouSans-Medium'
  },

  time: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 300,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 60,
    fontFamily: 'YouSans-Regular'

  },

});
