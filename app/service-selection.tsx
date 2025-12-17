import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const services = [
  { id: 'checkup', name: 'Dental Checkup', description: 'Comprehensive oral examination and cleaning' },
  { id: 'cleaning', name: 'Teeth Cleaning', description: 'Professional dental cleaning and polishing' },
  { id: 'whitening', name: 'Teeth Whitening', description: 'Brighten your smile with professional whitening' },
  { id: 'filling', name: 'Dental Fillings', description: 'Repair cavities and restore teeth' },
  { id: 'extraction', name: 'Tooth Extraction', description: 'Safe and gentle tooth removal' },
  { id: 'other', name: 'Other', description: 'Other dental services' },
];

export default function ServiceSelection() {
  const handleServiceSelect = (serviceId: string) => {
    router.push({
      pathname: '/dentist-selection',
      params: { service: serviceId }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>What can we help you with?</Text>
      <Text style={styles.subtitle}>Please select a service to book an appointment</Text>
      
      <View style={styles.servicesContainer}>
        {services.map((service) => (
          <Pressable
            key={service.id}
            style={styles.serviceCard}
            onPress={() => handleServiceSelect(service.id)}
          >
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
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
  servicesContainer: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
