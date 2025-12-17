import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Call,
    CallContent,
    StreamCall,
    StreamVideo,
    StreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VideoCallScreen() {
  const router = useRouter();
  const { appointmentId, dentistName } = useLocalSearchParams<{
    appointmentId: string;
    dentistName: string;
  }>();
  const { user } = useAuthStore();

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeCall();

    return () => {
      // Cleanup on unmount
      if (call) {
        call.leave();
      }
      if (client) {
        client.disconnectUser();
      }
    };
  }, []);

  const initializeCall = async () => {
    if (!user?.id || !appointmentId) {
      setError('Missing user or appointment information');
      setLoading(false);
      return;
    }

    try {
      // Get Stream token from Edge Function
      const { data, error: tokenError } = await supabase.functions.invoke('create-stream-token', {
        body: {
          userId: user.id,
          userName: user.name || 'Patient',
          appointmentId,
        },
      });

      if (tokenError) {
        throw new Error(tokenError.message);
      }

      const { token, callId, apiKey } = data;

      // Initialize Stream Video client
      const videoClient = new StreamVideoClient({
        apiKey,
        user: {
          id: user.id,
          name: user.name || 'Patient',
        },
        token,
      });

      // Create or join the call
      const videoCall = videoClient.call('default', callId);
      await videoCall.join({ create: true });

      setClient(videoClient);
      setCall(videoCall);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing call:', err);
      setError(err instanceof Error ? err.message : 'Failed to join call');
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    try {
      if (call) {
        await call.leave();
      }
      if (client) {
        await client.disconnectUser();
      }
      router.back();
    } catch (err) {
      console.error('Error ending call:', err);
      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Video Consultation',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>
            Connecting to your consultation...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Video Consultation',
            headerShown: true,
          }}
        />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Pressable style={styles.retryButton} onPress={initializeCall}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!client || !call) {
    return null;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <SafeAreaView style={styles.callContainer}>
          <Stack.Screen
            options={{
              title: `Consultation with ${dentistName || 'Dentist'}`,
              headerShown: false,
            }}
          />
          <CallContent
            onHangupCallHandler={handleEndCall}
          />
        </SafeAreaView>
      </StreamCall>
    </StreamVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  callContainer: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
