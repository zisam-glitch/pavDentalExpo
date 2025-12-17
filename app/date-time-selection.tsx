import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { format, isBefore, isToday } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface DateTimeSelectionState {
  selectedDate: Date;
  availableSlots: string[];
  selectedSlot: string | null;
  loadingSlots: boolean;
  error: string | null;
}

interface DateTimeSelectionProps {
  dentistId?: number;
  dentistName?: string;
  onDateTimeSelect?: (date: Date, time: string) => void;
  buttonText?: string;
  buttonStyle?: any;
}

export default function DateTimeSelection(props?: DateTimeSelectionProps) {
  const params = useLocalSearchParams<{
    service: string;
    dentistId: string;
    dentistName: string;
    notes?: string;
  }>();
  
  // Use props if provided, otherwise fall back to route params
  const dentistId = props?.dentistId ?? (params.dentistId ? parseInt(params.dentistId, 10) : 0);
  const dentistName = props?.dentistName ?? params.dentistName;
  const service = params.service;
  const [state, setState] = useState<DateTimeSelectionState>({
    selectedDate: new Date(),
    availableSlots: [],
    selectedSlot: null,
    loadingSlots: false,
    error: null,
  });

  /* ---------- Generate next 30 weekdays ---------- */
  const dates = useMemo(() => {
    const result: Date[] = [];
    let d = new Date();

    while (result.length < 30) {
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        result.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return result;
  }, []);

  /* ---------- Fetch available slots ---------- */
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      // Skip if we don't have required data
      if (!dentistId || !dentistName) {
        console.log('Skipping slot fetch - missing dentist data');
        setState(prev => ({
          ...prev,
          availableSlots: [],
          loadingSlots: false,
          error: 'Dentist information is missing'
        }));
        return;
      }

      console.log('Fetching slots for dentist:', {
        dentistId,
        dentistName,
        date: state.selectedDate.toISOString().split('T')[0]
      });

      setState(prev => ({ ...prev, loadingSlots: true, selectedSlot: null, error: null }));

      try {
        // Get the selected date in YYYY-MM-DD format (local timezone)
        const selectedDate = new Date(state.selectedDate);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        console.log('Querying slots for date:', dateString);

        // Query using dentist_name to filter appointments for this date
        // We need to query a wider range to account for timezone differences
        const startOfDayUTC = new Date(`${dateString}T00:00:00Z`);
        const endOfDayUTC = new Date(`${dateString}T23:59:59Z`);
        
        const { data: bookedSlots, error } = await supabase
          .from('appointments')
          .select('start_at')
          .eq('dentist_name', dentistName)
          .gte('start_at', startOfDayUTC.toISOString())
          .lte('start_at', endOfDayUTC.toISOString())
          .in('status', ['pending', 'confirmed']);
          
        console.log('Database query result:', { bookedSlots, error });
        console.log('Query range:', { startOfDayUTC: startOfDayUTC.toISOString(), endOfDayUTC: endOfDayUTC.toISOString() });

        if (error) {
          console.error('Error fetching slots:', error);
          throw error;
        }

        console.log('Booked slots for selected day:', bookedSlots);
        if (bookedSlots && bookedSlots.length > 0) {
          bookedSlots.forEach(slot => {
            console.log(`Booked slot details: ${slot.start_at}`);
          });
        }

        // Generate all possible time slots (9 AM to 5 PM, every 30 minutes)
        const allSlots: string[] = [];
        for (let h = 9; h < 17; h++) {
          allSlots.push(`${h.toString().padStart(2, '0')}:00`);
          allSlots.push(`${h.toString().padStart(2, '0')}:30`);
        }

        const now = new Date();
        console.log('Current time:', now.toISOString());

        // Filter out booked slots and past times for today
        const available = allSlots.filter((slot) => {
          const [hours, minutes] = slot.split(':').map(Number);
          // Create slot time in UTC
          const slotTime = new Date(`${dateString}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00Z`);

          // Log each slot being checked
          console.log(`Checking slot ${slot} at ${slotTime.toISOString()}`);

          // Skip if the slot is in the past for today
          if (isToday(state.selectedDate) && isBefore(slotTime, now)) {
            console.log(`Skipping past slot: ${slot}`);
            return false;
          }

          // Check if the slot is booked
          const isBooked = bookedSlots?.some(booked => {
            const bookedTime = new Date(booked.start_at);
            // Compare in UTC
            const bookedHours = bookedTime.getUTCHours();
            const bookedMinutes = bookedTime.getUTCMinutes();
            const matches = bookedHours === hours && bookedMinutes === minutes;
            
            console.log(`Comparing slot ${slot} (${hours}:${minutes}) with booked time ${bookedTime.toISOString()} (UTC: ${bookedHours}:${bookedMinutes}) - Match: ${matches}`);
            
            return matches;
          });

          if (isBooked) {
            console.log(`Slot ${slot} is booked`);
          } else {
            console.log(`Slot ${slot} is available`);
          }

          return !isBooked;
        });

        console.log('Final available slots:', available);

        setState((prevState) => ({
          ...prevState,
          availableSlots: available,
          loadingSlots: false,
          error: available.length === 0 ? 'No available time slots for the selected date' : null
        }));
      } catch (error) {
        console.error('Error fetching slots:', error);
        setState((prevState) => ({
          ...prevState,
          error: `Failed to load slots: ${error instanceof Error ? error.message : 'Unknown error'}`,
          loadingSlots: false,
        }));
      }
    };

    fetchAvailableSlots();
  }, [state.selectedDate, dentistId, dentistName]); // Add dentistName to dependencies

  /* ---------- Refetch slots when screen gains focus ---------- */
  useFocusEffect(
    useCallback(() => {
      // Refetch slots when user returns to this screen
      if (dentistId && dentistName) {
        setState(prev => ({ ...prev, loadingSlots: true, error: null }));
        // Trigger a refetch by updating a dependency
        const timer = setTimeout(() => {
          setState(prev => ({ ...prev, selectedDate: new Date(prev.selectedDate) }));
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [dentistId, dentistName])
  );

  /* ---------- Handle Selection ---------- */
  const handleContinue = () => {
    if (!state.selectedSlot) {
      setState(prev => ({ ...prev, error: 'Please select a time slot' }));
      return;
    }
    
    // If onDateTimeSelect callback is provided (used as embedded component), call it
    if (props?.onDateTimeSelect) {
      props.onDateTimeSelect(state.selectedDate, state.selectedSlot);
      return;
    }
    
    // Navigate back to booking with selected date and time
    router.push({
      pathname: '/booking',
      params: {
        service,
        dentistId: params.dentistId,
        notes: params.notes || '',
        selectedDate: state.selectedDate.toISOString(),
        selectedTime: state.selectedSlot,
      },
    });
  };

  const handleDateSelect = (date: Date) => {
    setState((prevState) => ({ ...prevState, selectedDate: date }));
  };

  const handleSlotSelect = (slot: string) => {
    setState((prevState) => ({ ...prevState, selectedSlot: slot }));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back to Dentists</Text>
        </Pressable>

        <Text style={styles.title}>Select Date & Time</Text>
        <Text style={styles.subtitle}>Choose your preferred appointment time with {dentistName}</Text>

        {/* Dates */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
          {dates.map((d, i) => {
            const selected = d.toDateString() === state.selectedDate.toDateString();
            return (
              <Pressable
                key={i}
                style={[styles.dateBtn, selected && styles.selected]}
                onPress={() => handleDateSelect(d)}
              >
                <Text style={selected && styles.selectedText}>{format(d, 'EEE')}</Text>
                <Text style={[styles.dateNum, selected && styles.selectedText]}>{format(d, 'd')}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Slots */}
        <Text style={styles.label}>Available Time Slots</Text>

        {state.loadingSlots ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.slots}>
            {state.availableSlots.map((slot) => (
              <Pressable
                key={slot}
                style={[styles.slotBtn, state.selectedSlot === slot && styles.selected]}
                onPress={() => handleSlotSelect(slot)}
              >
                <Text style={state.selectedSlot === slot && styles.selectedText}>{slot}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {state.error && <Text style={styles.error}>{state.error}</Text>}
      </ScrollView>
      <Pressable 
        style={props?.buttonStyle || styles.continueBtn} 
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>{props?.buttonText || 'Continue to Notes'}</Text>
      </Pressable>
    </View>
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
    marginBottom: 16,
  },
  datesScroll: {
    marginBottom: 16,
  },
  label: { fontSize: 16, fontWeight: '600', marginVertical: 12 },
  dateBtn: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  dateNum: { fontSize: 18, fontWeight: 'bold' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotBtn: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  selected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  selectedText: { color: '#fff' },
  continueBtn: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: 'red', textAlign: 'center', marginTop: 8 },
});
