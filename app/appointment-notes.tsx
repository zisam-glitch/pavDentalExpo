import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AppointmentNotes() {
  const params = useLocalSearchParams<{
    service: string;
    dentistId: string;
    dentistName: string;
  }>();
  const { service, dentistId } = params;
  const [notes, setNotes] = useState('');

  const handleContinue = () => {
    // Navigate to date-time-selection screen
    router.push({
      pathname: '/date-time-selection',
      params: {
        service,
        dentistId: dentistId,
        dentistName: params.dentistName || '',
        notes,
      },
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>How can we help you?</Text>
        <View style={styles.divider}></View>

        <Text style={styles.subtitle}>
          For example, describe your symptoms and how long you have had them.
        </Text>

        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={8}
            placeholder=""
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'YouSans-Bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  divider: {
    width: 40,
    borderBottomWidth: 3,
    borderBottomColor: '#E6E6E6',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'YouSans-Regular',
    color: '#666666',
    marginTop: 12,
    marginBottom: 24,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    borderRadius: 6,
    padding: 16,
    fontSize: 16,
    fontFamily: 'YouSans-Regular',
    color: '#1A1A1A',
    minHeight: 100,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#925927',
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontFamily: 'YouSans-Medium',
    fontSize: 16,
  },
});
