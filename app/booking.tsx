import StripePaymentModal from '@/components/StripePaymentModal';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Pricing constants
const APPOINTMENT_FEE = 19.99;
const ADDITIONAL_FEE = 5.00;

interface Dentist {
  id: number;
  name: string;
  specialty: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  image: any; // Consider using ImageSourcePropType from 'react-native' for better type safety
}

const serviceImages = {
  checkup: require('@/assets/images/services/checkup.png'),
  cleaning: require('@/assets/images/services/teethcleaning.png'),
  whitening: require('@/assets/images/services/whitening.png'),
  filling: require('@/assets/images/services/fillings.png'),
  extraction: require('@/assets/images/services/toothextraction.png'),
  other: require('@/assets/images/services/other.png'),
};

const SERVICES: Record<string, Service> = {
  checkup: {
    id: 'checkup',
    name: 'Dental Checkup',
    description: 'Comprehensive oral examination and cleaning',
    image: serviceImages.checkup
  },
  cleaning: {
    id: 'cleaning',
    name: 'Teeth Cleaning',
    description: 'Professional dental cleaning and polishing',
    image: serviceImages.cleaning
  },
  whitening: {
    id: 'whitening',
    name: 'Teeth Whitening',
    description: 'Brighten your smile with professional whitening',
    image: serviceImages.whitening
  },
  filling: {
    id: 'filling',
    name: 'Dental Fillings',
    description: 'Repair cavities and restore teeth',
    image: serviceImages.filling
  },
  extraction: {
    id: 'extraction',
    name: 'Tooth Extraction',
    description: 'Safe and gentle tooth removal',
    image: serviceImages.extraction
  },
  other: {
    id: 'other',
    name: 'Other',
    description: 'Other dental services',
    image: serviceImages.other
  },
};

export default function BookingScreen() {
  const {
    service: serviceId,
    dentistId,
    notes = '',
    selectedDate: selectedDateParam,
    selectedTime: selectedTimeParam
  } = useLocalSearchParams<{
    service: string;
    dentistId: string;
    notes?: string;
    selectedDate?: string;
    selectedTime?: string;
  }>();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const userNotes = notes || '';

  // Set selected service and dentist from route params
  useEffect(() => {
    console.log('BookingScreen useEffect - Route params:', { serviceId, dentistId, notes, selectedDateParam, selectedTimeParam });

    if (!serviceId || !SERVICES[serviceId]) {
      // If no valid service is provided, redirect to service selection
      router.replace('/service-selection');
      return;
    }

    setSelectedService(SERVICES[serviceId]);

    // Set selected dentist if dentistId is provided
    if (dentistId) {
      console.log('Received dentistId from route:', dentistId, 'type:', typeof dentistId);

      // Create mock dentists with string keys to match the route parameter type
      const mockDentists: Record<string, Dentist> = {
        '1': { id: 1, name: 'Dr Hassan Bhojani', specialty: 'General Dentistry' },
        '2': { id: 2, name: 'Dr Cosimo Meucci', specialty: 'Orthodontics' },

      };

      // Find the dentist with matching ID
      const dentist = mockDentists[dentistId];

      if (dentist) {
        console.log('Found dentist:', dentist);
        setSelectedDentist(dentist);
      } else {
        console.error('Dentist not found for ID:', dentistId);
        console.log('Available dentists:', Object.values(mockDentists).map(d => ({ id: d.id, name: d.name })));
        setError('Dentist not found. Please select a different dentist.');
      }
    } else {
      console.log('No dentistId provided in route params');
    }

    // Set selected date and time if provided from date-time-selection screen
    if (selectedDateParam) {
      setSelectedDate(new Date(selectedDateParam));
    }
    if (selectedTimeParam) {
      setSelectedSlot(selectedTimeParam);
    }
  }, [serviceId, dentistId, selectedDateParam, selectedTimeParam]);

  const handleDateTimeSelect = (date: Date, time: string) => {
    console.log('Date and time selected:', { date, time });
    setSelectedDate(date);
    setSelectedSlot(time);
  };

  const handleOpenPayment = () => {
    if (!selectedDentist || !selectedSlot || !selectedService || !selectedDate) {
      setError('Please select all required fields');
      return;
    }
    setError(null);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    await handleBookAppointment();
  };

  const handleBookAppointment = async () => {
    if (!selectedDentist || !selectedSlot || !selectedService || !selectedDate) {
      setError('Please select all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const [hours, minutes] = selectedSlot.split(':').map(Number);
      // Create appointment time in UTC
      const dateYear = selectedDate.getFullYear();
      const dateMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dateDay = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
      const appointmentTime = new Date(`${dateString}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00Z`);

      // Verify slot is still available before booking
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('dentist_name', selectedDentist.name)
        .eq('start_at', appointmentTime.toISOString())
        .in('status', ['pending', 'confirmed']);

      if (existingAppointments && existingAppointments.length > 0) {
        setError('This time slot was just booked by another patient. Please select a different time.');
        setSelectedSlot(null);
        return;
      }

      console.log('Booking appointment with:', {
        patient_id: user.id,
        dentist_name: selectedDentist.name,
        start_at: appointmentTime.toISOString(),
        status: 'confirmed',
        notes: userNotes,
        service_type: selectedService.id,
        service_name: selectedService.name,
      });

      const { error } = await supabase.from('appointments').insert({
        patient_id: user.id,
        dentist_name: selectedDentist.name,
        start_at: appointmentTime.toISOString(),
        status: 'confirmed',
        notes: userNotes,
        service_type: selectedService.id,
        service_name: selectedService.name,
      });

      if (error) {
        // Handle duplicate booking constraint error
        if (error.code === '23505') {
          setError('This time slot was just booked by another patient. Please select a different time.');
          setSelectedSlot(null);
          return;
        }
        throw error;
      }

      router.replace('/home');
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedService) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#925927" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Booking</Text>
      <View style={styles.divider}></View>
      <View style={styles.ctaRow}>
        <View style={styles.servicesCtaTop}>
          <View style={styles.serviceContent}>
            <Image
              source={selectedService.image}
              style={styles.serviceImage}
              resizeMode="contain"
            />
            <View style={styles.serviceCtaContent}>
              <View>
                <ThemedText style={styles.servicesCtaText}>Reason for contact</ThemedText>
                <ThemedText style={styles.servicesCtaTextdesc}>{selectedService.name}</ThemedText>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.servicesCta}>
          <View style={styles.serviceContent}>
            <Image
              source={require('../assets/images/services/video.png')}
              style={styles.serviceImage2}
              resizeMode="contain"
            />
            <View style={styles.serviceCtaContent}>
              <View>
                <ThemedText style={styles.servicesCtaText}>Video appointment</ThemedText>
                <ThemedText style={styles.servicesCtaTextdesc}>
                  {selectedDentist ? `With ${selectedDentist.name}` : 'Select a dentist'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.servicesCtaBottom}>
          <View style={styles.serviceContent}>
            <Image
              source={require('../assets/images/services/clock.png')}
              style={styles.serviceImage2}
              resizeMode="contain"
            />
            <View style={styles.serviceCtaContentBottom}>
              <View>
                <ThemedText style={styles.servicesCtaText}>{selectedDate!.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}, {selectedSlot} </ThemedText>
                <ThemedText style={styles.servicesCtaText}>Bangladesh Time UTC+06:00</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View>

        <View style={styles.total}>
          <ThemedText style={styles.totalCtaText}>Total</ThemedText>
          <ThemedText style={styles.totalCtaText}>£{(APPOINTMENT_FEE + ADDITIONAL_FEE).toFixed(2)}</ThemedText>
        </View>
        <Text style={styles.label2}>This amount will be debited after your consultation. It includes a €8 additional fee.</Text>


      </View>
      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Pricing Section */}
      <View style={styles.pricingSection}>
        <Text style={styles.pricingTitle}>How is this total calculated?</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Appointment Fee</Text>
          <Text style={styles.priceValue}>£{APPOINTMENT_FEE.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Additional Fees</Text>
          <Text style={styles.priceValue}>£{ADDITIONAL_FEE.toFixed(2)}</Text>
        </View>
        <Text style={styles.pricingTitle2}>How is this total calculated?</Text>
      </View>

      <Text style={styles.ctaText}>By confirming my booking, I agree to receive healthcare by video appointment.</Text>

      {/* Confirm with Bank Card Button */}
      <Pressable
        style={[styles.bookButton, (!selectedDentist || !selectedSlot) && styles.disabledButton]}
        onPress={handleOpenPayment}
        disabled={!selectedDentist || !selectedSlot || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.bookButtonText}> Confirm with Bank Card</Text>
        )}
      </Pressable>

      {/* Payment Modal */}
      <StripePaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        appointmentFee={APPOINTMENT_FEE}
        additionalFee={ADDITIONAL_FEE}
      />
      <Text style={styles.ctaText2}>Appointment prices are set by Assurance Maladie. For more information about billing, or in the event of a technical problem, please visit support.pavdental.com</Text>

    </ScrollView>
  );
}

// ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  divider: {
    width: 40,
    borderBottomWidth: 3,
    borderBottomColor: '#E6E6E6',
  },

  serviceInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'YouSans-Bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dentistList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dentistButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minWidth: '48%',
  },
  selectedDentist: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  dentistName: {
    fontWeight: '600',
  },
  dentistSpecialty: {
    color: '#666',
    fontSize: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  selectedDate: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  disabledDate: {
    opacity: 0.5,
  },
  dateText: {
    textAlign: 'center',
    fontSize: 12,
  },
  dateNumber: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: '#fff',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedSlot: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  slotText: {
    fontSize: 14,
  },
  selectedSlotText: {
    color: '#fff',
    fontWeight: '600',
  },
  noSlotsText: {
    color: '#666',
    fontStyle: 'italic',
  },
  notesText: {
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    minHeight: 100,
    color: '#333',
  },
  editNotesButton: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  editNotesText: {
    color: '#1A73E8',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#925927',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  bookButtonText: {
    fontFamily: 'YouSans-Bold',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  dentistInfoCard: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
  },
  changeDentistButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  changeDentistText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  dateTimeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  helperText: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  dateTimeInfoCard: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  changeDateTimeButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  changeDateTimeText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectButton: {
    padding: 16,
    backgroundColor: '#925927',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pricingSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 8,
    borderTopColor: '#E6E6E6',
    borderBottomColor: '#E6E6E6',
  },
  pricingTitle: {
    fontSize: 18,
    fontFamily: 'YouSans-Regular',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  pricingTitle2: {
    fontSize: 16,
    fontFamily: 'YouSans-Bold',
    fontWeight: '600',
    color: '#664600ff',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'YouSans-Regular',

  },
  priceValue: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'YouSans-Regular',

  },
  priceDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#007AFF',
  },

  ctaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    width: '100%',
  },
  mainctaText: {
    color: '#fff',
    fontFamily: 'YouSans-Bold',
    fontSize: 16,
    lineHeight: 22,
  },
  ctaText: {
    color: '#9b9b9bff',
    fontFamily: 'YouSans-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  ctaText2: {
    color: '#9b9b9bff',
    fontFamily: 'YouSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10
  },
  services: {
    paddingVertical: 45,
    paddingHorizontal: 20,
  },

  ctaRow: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',

  },
  servicesCta: {

    width: '100%',
  },
  servicesCtaBottom: {
    width: '100%',

  },
  servicesCtaTop: {
    width: '100%',

  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceCtaContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  serviceCtaContentBottom: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,

  },
  servicesCtaText: {
    color: '#563212',
    fontFamily: 'YouSans-Regular',
    fontSize: 15.5,
    lineHeight: 18,
  },
  servicesCtaTextdesc: {
    color: '#9b9b9bff',
    fontFamily: 'YouSans-Regular',
    fontSize: 15,
    textTransform: 'lowercase'
  },
  serviceImage: {
    width: 40,
    height: 40,
    marginRight: 0,
    borderRadius: 50,
  },
  serviceImage2: {
    width: 40,
    height: 40,
    marginRight: 0,
    borderRadius: 0,
  },
  total: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  totalCtaText: {
    color: '#563212',
    fontFamily: 'YouSans-Regular',
    fontSize: 17,
    lineHeight: 18,
  },
  label2: {
    padding: 15,
    backgroundColor: '#f8e4d2ff',
    fontSize: 14,
    fontFamily: 'YouSans-Regular',
    marginVertical: 12,
    borderRadius: 6,
  },
});