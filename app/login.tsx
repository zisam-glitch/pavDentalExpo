import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email || '';

  useEffect(() => {
    if (!email) {
      // If no email is provided, redirect back to email entry
      router.replace('/register-email');
    }
  }, [email]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Please enter your password</ThemedText>
      <View style={styles.divider}></View>
      <ThemedText style={styles.subTitle}>Please enter the password associated with {email}</ThemedText>
      <View style={styles.form}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { marginTop: 16 }]}
          secureTextEntry
          autoFocus
        />
      </View>

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}


      <View style={styles.footer}>
        <Pressable
          disabled={loading || !password.trim()}
          style={[styles.primaryCta, loading && { opacity: 0.7 }]}
          onPress={async () => {
            try {
              setError(null);
              setLoading(true);
              const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
              });
              if (error) {
                setError(error.message);
                return;
              }
              router.replace('/home');
            } catch (e: any) {
              setError(e?.message ?? 'Login failed');
            } finally {
              setLoading(false);
            }
          }}>
          <ThemedText style={styles.ctaText} type="link">{loading ? 'Logging in…' : 'Login'}</ThemedText>
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
    fontSize: 23,
    lineHeight: 26,
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
    opacity: 1,
  },
  ctaText: {
    fontFamily: 'YouSans-Medium',
    color: '#fff',
  },
  altLink: {
    alignSelf: 'center',
    marginTop: 4,
  },
  emailDisplay: {
    fontSize: 16,
    fontFamily: 'YouSans-Medium',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  error: {
    color: 'crimson',
    textAlign: 'center',
  },
});
