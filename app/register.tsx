import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if all required fields are filled
  const isFormValid = name.trim() !== '' &&
    email.trim() !== '' && // Email is still required but comes from register-email
    phone.trim() !== '' &&
    password.trim() !== '' &&
    address.trim() !== '' &&
    postcode.trim() !== '' &&
    acceptTerms &&
    acceptPrivacy;

  const params = useLocalSearchParams<{ email: string }>();

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
    } else {
      // If no email is provided, redirect back to email entry
      router.replace('/register-email');
    }
  }, [params.email]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Personal details</ThemedText>
      <View style={styles.divider}></View>

      <View style={styles.form}>
        <TextInput
          placeholder="Full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <TextInput
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          autoCapitalize="sentences"
        />
        <TextInput
          placeholder="Postcode"
          value={postcode}
          onChangeText={setPostcode}
          style={styles.input}
          autoCapitalize="characters"
        />
        <View style={styles.checkbox}>
          <Checkbox
            value={marketingEmails}
            onValueChange={setMarketingEmails}
            label="I want to receive dental advice and information from Pav Dental."
            style={styles.toggleRow}
          />
          <Checkbox
            value={acceptTerms}
            onValueChange={setAcceptTerms}
            label="I accept the terms and conditions."
            style={styles.toggleRow}
          />
          <Checkbox
            value={acceptPrivacy}
            onValueChange={setAcceptPrivacy}
            label="I have taken note of the privacy policy."
            style={styles.toggleRow}
          />
        </View>
      </View>

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryCta, (loading || !isFormValid) && styles.ctaDisabled]}
          disabled={loading || !isFormValid}
          onPress={async () => {
            try {
              setError(null);
              if (!acceptPrivacy || !acceptTerms) {
                setError('You must accept the privacy policy and terms to continue');
                return;
              }
              setLoading(true);
              const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                  data: {
                    name: name.trim(),
                    phone: phone.trim(),
                    address: address.trim(),
                    postcode: postcode.trim(),
                    marketing_emails: marketingEmails,
                    accept_privacy: acceptPrivacy,
                    accept_terms: acceptTerms,
                  }
                },
              });
              if (error) {
                setError(error.message);
                return;
              }
              router.replace('/home');
            } catch (e: any) {
              setError(e?.message ?? 'Registration failed');
            } finally {
              setLoading(false);
            }
          }}>
          <ThemedText style={[styles.ctaText, (loading || !isFormValid) && styles.ctaTextDisabled]} type="link">
            {loading ? 'Registering…' : 'Register'}
          </ThemedText>
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
  form: {
    gap: 12,
  },
  checkbox: {
    paddingVertical: 15,
    gap: 16,
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
  altLink: {
    alignSelf: 'center',
    marginTop: 4,
  },
  error: {
    color: 'crimson',
    fontFamily: 'YouSans-Regular',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaTextDisabled: {
    opacity: 0.8,
  },
});
