import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';

export default function RegisterEmailScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>What's your email?</ThemedText>
      <View style={styles.divider}></View>
      <ThemedText style={styles.subTitle}>We need to verify who you are.</ThemedText>
      <ThemedText style={styles.subTitle}>Enter your email below, and we will send you a code by email that verifies your email. This check makes our service safer.</ThemedText>

      <View style={styles.form}>
        <TextInput
          placeholder="hello@pavdental.com"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      <View style={styles.footer}>
        <Pressable
          disabled={loading || !email.trim()}
          style={[styles.primaryCta, (loading || !email.trim()) && { opacity: 0.5 }]}
          onPress={async () => {
            try {
              setError(null);
              setLoading(true);
              // Best-effort existence check: try sending a magic link without creating user.
              const { error } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: { shouldCreateUser: false },
              });
              if (error) {
                // If user not found -> go to full registration
                router.replace({
                  pathname: '/register',
                  params: { email: email.trim() } as { email: string }
                });
              } else {
                // Existing user -> go to password screen
                router.replace({ pathname: '/login', params: { email: email.trim() } });
              }
            } catch (e: any) {
              setError(e?.message ?? 'Unable to continue');
            } finally {
              setLoading(false);
            }
          }}>
          <ThemedText style={styles.ctaText} type="link">{loading ? 'Checking…' : 'Continue'}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 25,
    lineHeight: 28,
    fontFamily: 'YouSans-Bold',
    paddingBottom: 6,
  },
  divider: {
    width: 40,
    borderBottomWidth: 3,
    borderBottomColor: '#E6E6E6',
  },
  subTitle: {
    paddingTop: 6,
    fontFamily: 'YouSans-Regular',
  },
  form: {
    gap: 12,
    marginTop: 12,
  },
  input: {
    height: 58,
    fontSize: 18,
    fontFamily: 'YouSans-Regular',
    paddingHorizontal: 4,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#636363',
    backgroundColor: 'white',
  },
  footer: {
    marginTop: 'auto',
  },
  primaryCta: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#925927',
  },
  ctaText: {
    fontFamily: 'YouSans-Medium',
    color: '#fff',

  },
  error: {
    color: 'crimson',
    fontFamily: 'YouSans-Regular',

  },
});
