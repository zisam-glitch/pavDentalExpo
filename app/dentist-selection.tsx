import ArrowIcon from '@/assets/icons/arrow';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Dentist {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  rating: number;
  image: string;
}

export default function DentistSelection() {
  const { service } = useLocalSearchParams<{ service: string }>();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you would fetch this from your database
  const mockDentists: Dentist[] = [
    {
      id: 1,
      name: 'Dr Hassan Bhojani',
      specialty: 'General Dentistry',
      availability: 'Mon-Fri',
      rating: 4.9,
      image: 'https://res.cloudinary.com/dv5noi9zl/image/upload/v1764609933/1000025959_5_du0uls.jpg'
    },
    {
      id: 2,
      name: 'Dr Cosimo Meucci',
      specialty: 'Orthodontics',
      availability: 'Mon, Wed, Fri',
      rating: 4.8,
      image: 'https://res.cloudinary.com/dv5noi9zl/image/upload/v1764609934/1000025960_4_lhingy.jpg'
    }
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
      <Text style={styles.title}>Select a Dentist</Text>

      <View >
        {mockDentists.map((dentist, index) => (
          <Pressable
            key={dentist.id}
            style={[
              styles.servicesCta,
              index === mockDentists.length - 1 && styles.lastServiceItem
            ]}
            onPress={() => handleSelectDentist(dentist)}
          >
            <View style={styles.serviceContent}>
              <Image
                source={{ uri: dentist.image }}
                style={styles.serviceImage}
                resizeMode="contain"
              />
              <View style={
                styles.serviceCtaContent
              }>
                <Text style={styles.servicesCtaText}>{dentist.name}</Text>
                <ArrowIcon size={32} color="#925A27" />
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

  title: {
    fontSize: 24,
    fontFamily: 'YouSans-Medium',
    marginBottom: 20,
  },
  serviceCtaContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,

  },
  lastServiceItem: {
    borderBottomWidth: 0,
  },
  serviceImage: {
    width: 50,
    height: 50,
    marginRight: 5,
    borderRadius: 50,
  },

  servicesCta: {
    width: '100%',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e4e4e4ff',
  },
  servicesCtaText: {
    color: '#563212',
    fontFamily: 'YouSans-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },


});
