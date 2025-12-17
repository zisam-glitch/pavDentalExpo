import ArrowIcon from '@/assets/icons/arrow';
import Language from '@/assets/icons/language';
import Person from '@/assets/icons/person';
import Video from '@/assets/icons/video';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/useAuthStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function HomeScreen() {
  const { user, loading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, []);


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
});
