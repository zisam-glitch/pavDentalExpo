import { supabase } from '../lib/supabase';

export interface Timeslot {
  id?: string;
  dentist_name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get available time slots for a specific dentist and date
export const getAvailableTimeSlots = async (dentist: string, date: string) => {
  const { data, error } = await supabase
    .from('timeslots')
    .select('*')
    .eq('dentist_name', dentist)
    .eq('date', date)
    .eq('is_available', true)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Add a new time slot (admin only)
export const addTimeSlot = async (timeslot: Omit<Timeslot, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('timeslots')
    .insert([timeslot])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a time slot (admin only)
export const updateTimeSlot = async (id: string, updates: Partial<Timeslot>) => {
  const { data, error } = await supabase
    .from('timeslots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a time slot (admin only)
export const deleteTimeSlot = async (id: string) => {
  const { error } = await supabase
    .from('timeslots')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
