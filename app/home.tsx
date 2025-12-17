import ArrowIcon from '@/assets/icons/arrow';
import Language from '@/assets/icons/language';
import Person from '@/assets/icons/person';
import Video from '@/assets/icons/video';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UpcomingAppointment {
  id: string;
  start_at: string;
  dentist_name: string;
  service_name: string;
  status: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading, fetchUser } = useAuthStore();
  const [upcomingAppointment, setUpcomingAppointment] = useState<UpcomingAppointment | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [canJoinCall, setCanJoinCall] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch upcoming appointment when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUpcomingAppointment();
    }, [user])
  );

  // Update countdown timer every minute
  useEffect(() => {
    if (!upcomingAppointment) {
      setCanJoinCall(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const appointmentTime = new Date(upcomingAppointment.start_at);
      const diffMs = appointmentTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      // Allow joining 10 minutes before until 30 minutes after appointment start
      const canJoin = diffMins <= 10 && diffMins >= -30;
      setCanJoinCall(canJoin);

      if (diffMs <= 0) {
        setTimeRemaining('Starting now!');
        return;
      }

      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;

      if (diffHours > 24) {
        const days = Math.floor(diffHours / 24);
        setTimeRemaining(`in ${days} day${days > 1 ? 's' : ''}`);
      } else if (diffHours > 0) {
        setTimeRemaining(`in ${diffHours}h ${remainingMins}m`);
      } else {
        setTimeRemaining(`in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // Update every 30 seconds for more responsive join button

    return () => clearInterval(interval);
  }, [upcomingAppointment]);

  const handleJoinCall = () => {
    if (!upcomingAppointment) return;
    router.push({
      pathname: '/video-call',
      params: {
        appointmentId: upcomingAppointment.id,
        dentistName: upcomingAppointment.dentist_name,
      },
    });
  };

  const fetchUpcomingAppointment = async () => {
    if (!user?.id) return;

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_at, dentist_name, service_name, status')
        .eq('patient_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .gte('start_at', now)
        .order('start_at', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching appointment:', error);
        return;
      }

      setUpcomingAppointment(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Stack.Screen options={{ header: () => null }} />

        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Person width={29} height={29} />
            {loading ? (
              <ActivityIndicator size="small" color="#000" style={styles.loader} />
            ) : (
              <ThemedText style={styles.headerTitle}>
                {user?.name}
              </ThemedText>
            )}
          </View>
          <MaterialIcons name="arrow-forward-ios" size={22} color="#000" />
        </View>

        <Image
          style={styles.image}
          source={require('../assets/images/hero.png')}
        />

        {/* Upcoming Appointment Timer */}
        {upcomingAppointment && (
          <View style={styles.appointmentBanner}>
            <View style={styles.appointmentIconContainer}>
              <MaterialIcons name={canJoinCall ? 'videocam' : 'event'} size={28} color="#fff" />
            </View>
            <View style={styles.appointmentInfo}>
              <ThemedText style={styles.appointmentTitle}>
                {canJoinCall ? 'Ready to Join!' : 'Upcoming Appointment'}
              </ThemedText>
              <ThemedText style={styles.appointmentDetails}>
                {upcomingAppointment.service_name} with {upcomingAppointment.dentist_name}
              </ThemedText>
              {canJoinCall ? (
                <Pressable style={styles.joinCallButton} onPress={handleJoinCall}>
                  <MaterialIcons name="video-call" size={20} color="#fff" />
                  <ThemedText style={styles.joinCallButtonText}>Join Video Call</ThemedText>
                </Pressable>
              ) : (
                <View style={styles.timerContainer}>
                  <MaterialIcons name="schedule" size={18} color="#4CAF50" />
                  <ThemedText style={styles.timerText}>{timeRemaining}</ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.header}>
          <Link href="/service-selection" style={styles.primaryCta}>
            <View style={styles.ctaContent}>
              <View>
                <ThemedText style={styles.mainctaText} type="link">Talk to a dentist by video</ThemedText>
                <ThemedText style={styles.ctaText} type="link">Available in 1.5 hour</ThemedText>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={22} color="#fff" />
            </View>
          </Link>
        </View>
        <View style={styles.services}>
          <ThemedText style={styles.title}>
            Our services
          </ThemedText>
          <View style={styles.ctaRow}>
            <Link href="/booking" style={styles.servicesCtaTop}>
              <View style={styles.serviceContent}>
                <Video width={26} height={26} />
                <View style={styles.serviceCtaContent}>
                  <ThemedText style={styles.servicesCtaText} type="link">Orthodontics</ThemedText>
                  <ArrowIcon size={32} color="#925A27" />
                </View>
              </View>
            </Link>
            <Link href="/booking" style={styles.servicesCta}>
              <View style={styles.serviceContent}>
                <Video width={26} height={26} />
                <View style={styles.serviceCtaContent}>
                  <ThemedText style={styles.servicesCtaText} type="link">General dentist</ThemedText>
                  <ArrowIcon size={32} color="#925A27" />
                </View>
              </View>
            </Link>
            <Link href="/booking" style={styles.servicesCta}>
              <View style={styles.serviceContent}>
                <Video width={26} height={26} />
                <View style={styles.serviceCtaContent}>
                  <ThemedText style={styles.servicesCtaText} type="link">Endodontics</ThemedText>
                  <ArrowIcon size={32} color="#925A27" />
                </View>
              </View>
            </Link>
            <Link href="/booking" style={styles.servicesCta}>
              <View style={styles.serviceContent}>
                <Video width={26} height={26} />
                <View style={styles.serviceCtaContent}>
                  <ThemedText style={styles.servicesCtaText} type="link">Periodontist</ThemedText>
                  <ArrowIcon size={32} color="#925A27" />
                </View>
              </View>
            </Link>
            <Link href="/booking" style={styles.servicesCta}>
              <View style={styles.serviceContent}>
                <Video width={26} height={26} />
                <View style={styles.serviceCtaContent}>
                  <ThemedText style={styles.servicesCtaText} type="link">Pediatric dentist</ThemedText>
                  <ArrowIcon size={32} color="#925A27" />
                </View>
              </View>
            </Link>
            <Link href="/booking" style={styles.servicesCtaBottom}>
              <View style={styles.serviceContent}>
                <Video width={26} height={26} />
                <View style={styles.serviceCtaContentBottom}>
                  <ThemedText style={styles.servicesCtaText} type="link">Oral Surgeon</ThemedText>
                  <ArrowIcon size={32} color="#925A27" />
                </View>
              </View>
            </Link>
          </View>
        </View>
        <View style={styles.services}>
          <ThemedText style={styles.title}>
           Need a specific dentist?
          </ThemedText>
          <View style={styles.ctaRow}>
            <Link href="/booking" style={styles.servicesCtaTop}>
              <View style={styles.serviceContent}>
                <Language size={26}  />
                <View style={styles.serviceCtaContent}>
                  <ThemedText style={styles.servicesCtaText} type="link">Talk to a doctor in your language</ThemedText>
                  <ArrowIcon size={32} color="#925A27" />
                </View>
              </View>
            </Link>
            <Link href="/booking" style={styles.servicesCtaBottom}>
              <View style={styles.serviceContent}>
                <Video width={26} height={26} />
                <View style={styles.serviceCtaContentBottom}>
                  <ThemedText style={styles.servicesCtaText} type="link">Find our dental clinic</ThemedText>
                  <ArrowIcon size={32} color="#925A27" />
                </View>
              </View>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loader: {
    marginLeft: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    borderBottomWidth: 3,
    borderBottomColor: '#E6E6E6',
  },
  headerIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'YouSans-Medium',
    fontSize: 17,
    color: '#000',
  },

  image: {
    width: '100%',
    height: 180,
    objectFit: 'contain'
  },
  header: {
    paddingHorizontal: 20,
  },
  primaryCta: {
    borderRadius: 10,
    backgroundColor: '#925927',
    width: '100%',
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
    color: '#fff',
    fontFamily: 'YouSans-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  services: {
    paddingVertical: 45,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'YouSans-Medium',
    fontSize: 18,
    color: '#000',
    paddingBottom: 10,
  },
  ctaRow: {
  },
  servicesCta: {
    backgroundColor: '#FFF7EB',
    width: '100%',
    paddingHorizontal: 20,
  },
  servicesCtaBottom: {
    backgroundColor: '#FFF7EB',
    width: '100%',
    paddingHorizontal: 20,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  servicesCtaTop: {
    backgroundColor: '#FFF7EB',
    width: '100%',
    paddingHorizontal: 20,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  serviceCtaContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f8e4d2ff',
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
    fontSize: 16,
    lineHeight: 22,
  },
  // Appointment Banner Styles
  appointmentBanner: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  appointmentIconContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontFamily: 'YouSans-Bold',
    fontSize: 15,
    color: '#2E7D32',
    marginBottom: 4,
  },
  appointmentDetails: {
    fontFamily: 'YouSans-Regular',
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontFamily: 'YouSans-Bold',
    fontSize: 16,
    color: '#4CAF50',
  },
  joinCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  joinCallButtonText: {
    fontFamily: 'YouSans-Bold',
    fontSize: 14,
    color: '#fff',
  },
});
