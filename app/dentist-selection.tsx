import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Dentist {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  rating: number;
  image?: string;
}

export default function DentistSelection() {
  const { service } = useLocalSearchParams<{ service: string }>();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you would fetch this from your database
  const mockDentists: Dentist[] = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'General Dentistry', availability: 'Mon-Fri', rating: 4.9 },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Orthodontics', availability: 'Mon, Wed, Fri', rating: 4.8 },
    { id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatric Dentistry', availability: 'Tue, Thu, Sat', rating: 4.7 },
    { id: 4, name: 'Dr. Robert Wilson', specialty: 'Oral Surgery', availability: 'Mon, Tue, Thu', rating: 4.9 },
  ];

  const handleSelectDentist = (dentist: Dentist) => {
    router.push({
      pathname: '/appointment-notes',
      params: {
        service,
        dentistId: dentist.id.toString(),
        dentistName: dentist.name,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to Services</Text>
      </Pressable>

      <Text style={styles.title}>Select a Dentist</Text>
      <Text style={styles.subtitle}>Choose your preferred dentist for the appointment</Text>

      <View style={styles.dentistsContainer}>
        {mockDentists.map((dentist) => (
          <Pressable
            key={dentist.id}
            style={styles.dentistCard}
            onPress={() => handleSelectDentist(dentist)}
          >
            <View style={styles.dentistAvatar}>
              <Text style={styles.avatarText}>
                {dentist.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.dentistInfo}>
              <Text style={styles.dentistName}>{dentist.name}</Text>
              <Text style={styles.dentistSpecialty}>{dentist.specialty}</Text>
              <View style={styles.dentistMeta}>
                <Text style={styles.availability}>{dentist.availability}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>★ {dentist.rating}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 16,
    padding: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  dentistsContainer: {
    gap: 16,
  },
  dentistCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  dentistAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  dentistInfo: {
    flex: 1,
  },
  dentistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dentistSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dentistMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availability: {
    fontSize: 13,
    color: '#666',
  },
  ratingContainer: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
