import ArrowIcon from '@/assets/icons/arrow';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// Map service IDs to their corresponding image paths
const serviceImages = {
  checkup: require('@/assets/images/services/checkup.png'),
  cleaning: require('@/assets/images/services/teethcleaning.png'),
  whitening: require('@/assets/images/services/whitening.png'),
  filling: require('@/assets/images/services/fillings.png'),
  extraction: require('@/assets/images/services/toothextraction.png'),
  other: require('@/assets/images/services/other.png'),
};

const services = [
  {
    id: 'checkup',
    name: 'Dental Checkup',
    description: 'Comprehensive oral examination and cleaning',
    image: serviceImages.checkup
  },
  {
    id: 'cleaning',
    name: 'Teeth Cleaning',
    description: 'Professional dental cleaning and polishing',
    image: serviceImages.cleaning
  },

  {
    id: 'filling',
    name: 'Dental Fillings',
    description: 'Repair cavities and restore teeth',
    image: serviceImages.filling
  },
  {
    id: 'extraction',
    name: 'Tooth Extraction',
    description: 'Safe and gentle tooth removal',
    image: serviceImages.extraction
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    description: 'Brighten your smile with professional whitening',
    image: serviceImages.whitening
  },
  {
    id: 'other',
    name: 'Others',
    description: 'Other dental services',
    image: serviceImages.other
  },
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
      <View>
        {services.map((service, index) => (
          <Pressable
            key={service.id}
            style={[styles.servicesCta,
            index === services.length - 1 && styles.lastServiceItem]}
            onPress={() => handleServiceSelect(service.id)}
          >
            <View style={styles.serviceContent}>
              <Image
                source={service.image}
                style={styles.serviceImage}
                resizeMode="contain"
              />
              <View style={
                styles.serviceCtaContent
              }>
                <Text style={styles.servicesCtaText}>{service.name}</Text>
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
  serviceImage: {
    width: 50,
    height: 50,
    marginRight: 5,
    borderRadius: 50,
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
