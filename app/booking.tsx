import StripePaymentModal from '@/components/StripePaymentModal';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
}

const SERVICES: Record<string, Service> = {
  checkup: { id: 'checkup', name: 'Dental Checkup', description: 'Comprehensive oral examination and cleaning' },
  cleaning: { id: 'cleaning', name: 'Teeth Cleaning', description: 'Professional dental cleaning and polishing' },
  whitening: { id: 'whitening', name: 'Teeth Whitening', description: 'Brighten your smile with professional whitening' },
  filling: { id: 'filling', name: 'Dental Fillings', description: 'Repair cavities and restore teeth' },
  extraction: { id: 'extraction', name: 'Tooth Extraction', description: 'Safe and gentle tooth removal' },
  other: { id: 'other', name: 'Other', description: 'Other dental services' },
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
        '1': { id: 1, name: 'Dr. Sarah Johnson', specialty: 'General Dentistry' },
        '2': { id: 2, name: 'Dr. Michael Chen', specialty: 'Orthodontics' },
        '3': { id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatric Dentistry' },
        '4': { id: 4, name: 'Dr. Robert Wilson', specialty: 'Oral Surgery' },
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
        amount_paid: APPOINTMENT_FEE + ADDITIONAL_FEE,
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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Pressable 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to Services</Text>
      </Pressable>
      
      <Text style={styles.title}>Book an Appointment</Text>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{selectedService.name}</Text>
        <Text style={styles.serviceDescription}>{selectedService.description}</Text>
      </View>

      {/* Dentist Info */}
      <View style={styles.section}>
        <Text style={styles.label}>Dentist</Text>
        {selectedDentist ? (
          <View style={styles.dentistInfoCard}>
            <Text style={styles.dentistName}>{selectedDentist.name}</Text>
            <Text style={styles.dentistSpecialty}>{selectedDentist.specialty}</Text>
            <Pressable 
              style={styles.changeDentistButton}
              onPress={() => router.push({
                pathname: '/dentist-selection',
                params: { service: serviceId }
              })}
            >
              <Text style={styles.changeDentistText}>Change Dentist</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.errorText}>No dentist selected</Text>
        )}
      </View>

      {/* Date & Time Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Date & Time</Text>
        {selectedDate && selectedSlot ? (
          <View style={styles.dateTimeInfoCard}>
            <Text style={styles.dateTimeText}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={styles.dateTimeText}>{selectedSlot}</Text>
            <Pressable 
              style={styles.changeDateTimeButton}
              onPress={() => router.push({
                pathname: '/date-time-selection',
                params: { 
                  service: serviceId,
                  dentistId: dentistId,
                  dentistName: selectedDentist?.name
                }
              })}
            >
              <Text style={styles.changeDateTimeText}>Change Date & Time</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable 
            style={[styles.selectButton, !selectedDentist && styles.disabledButton]}
            onPress={() => selectedDentist && router.push({
              pathname: '/date-time-selection',
              params: { 
                service: serviceId,
                dentistId: dentistId,
                dentistName: selectedDentist.name
              }
            })}
            disabled={!selectedDentist}
          >
            <Text style={styles.selectButtonText}>
              {selectedDentist ? 'Select Date & Time' : 'Please select a dentist first'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <Text style={styles.notesText}>
          {userNotes || 'No additional notes provided'}
        </Text>
        <Pressable 
          style={styles.editNotesButton}
          onPress={() => router.push({
            pathname: '/appointment-notes',
            params: { 
              service: serviceId,
              dentistId,
              notes: userNotes
            }
          })}
        >
          <Text style={styles.editNotesText}>
            {userNotes ? 'Edit Notes' : 'Add Notes'}
          </Text>
        </Pressable>
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Pricing Section */}
      <View style={styles.pricingSection}>
        <Text style={styles.pricingTitle}>Price Summary</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Appointment Fee</Text>
          <Text style={styles.priceValue}>£{APPOINTMENT_FEE.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Additional Fees</Text>
          <Text style={styles.priceValue}>£{ADDITIONAL_FEE.toFixed(2)}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>£{(APPOINTMENT_FEE + ADDITIONAL_FEE).toFixed(2)}</Text>
        </View>
      </View>

      {/* Confirm with Bank Card Button */}
      <Pressable
        style={[styles.bookButton, (!selectedDentist || !selectedSlot) && styles.disabledButton]}
        onPress={handleOpenPayment}
        disabled={!selectedDentist || !selectedSlot || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.bookButtonText}>💳 Confirm with Bank Card</Text>
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
    </ScrollView>
  );
}

// ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
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
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  bookButtonText: {
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
    borderRadius: 6,
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pricingSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 15,
    color: '#666',
  },
  priceValue: {
    fontSize: 15,
    color: '#1a1a1a',
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
});