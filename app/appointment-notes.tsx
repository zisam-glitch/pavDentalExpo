import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
  <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Additional Notes</Text>
      <Text style={styles.subtitle}>
        Add any special requests or notes for your appointment (optional)
      </Text>

      <View style={styles.notesContainer}>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={8}
          placeholder="Type your notes here..."
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
          placeholderTextColor="#999"
        />
      </View>
    </ScrollView>

    <View style={styles.footer}>
      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue to Booking</Text>
      </Pressable>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'YouSans-Bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'YouSans-Regular',
    color: '#666666',
    marginBottom: 24,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'YouSans-Regular',
    color: '#1A1A1A',
    minHeight: 180,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#1A73E8',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontFamily: 'YouSans-Medium',
    fontSize: 16,
  },
});
