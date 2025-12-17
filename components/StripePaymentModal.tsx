import { supabase } from '@/lib/supabase';
import { CardField, CardFieldInput, useConfirmPayment } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface StripePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  appointmentFee: number;
  additionalFee: number;
}

export default function StripePaymentModal({
  visible,
  onClose,
  onPaymentSuccess,
  appointmentFee,
  additionalFee,
}: StripePaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  const { confirmPayment } = useConfirmPayment();

  const totalAmount = appointmentFee + additionalFee;
  const cardComplete = cardDetails?.complete ?? false;

  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setLoading(true);

    try {
      // Call Supabase Edge Function to create PaymentIntent
      const { data, error: functionError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: totalAmount,
          currency: 'gbp',
        },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      const { clientSecret } = data;

      if (!clientSecret) {
        throw new Error('Failed to get payment client secret');
      }

      // Confirm the payment - CardField automatically provides card details
      const { error: confirmError, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {},
        },
      });

      if (confirmError) {
        Alert.alert('Payment Failed', confirmError.message);
        return;
      }

      if (paymentIntent?.status === 'Succeeded') {
        Alert.alert('Success', 'Payment successful!', [
          { text: 'OK', onPress: onPaymentSuccess }
        ]);
      } else {
        Alert.alert('Payment Status', `Payment status: ${paymentIntent?.status}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Payment Details</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Price Summary */}
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Appointment Fee</Text>
              <Text style={styles.priceValue}>£{appointmentFee.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Additional Fees</Text>
              <Text style={styles.priceValue}>£{additionalFee.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>£{totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Stripe Card Field */}
          <View style={styles.cardFieldContainer}>
            <Text style={styles.cardLabel}>Card Information</Text>
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#1a1a1a',
              }}
              style={styles.cardField}
              onCardChange={(details) => {
                setCardDetails(details);
              }}
            />
          </View>

          {/* Stripe Badge */}
          <View style={styles.stripeBadge}>
            <Text style={styles.stripeText}>🔒 Powered by Stripe</Text>
          </View>

          {/* Pay Button */}
          <Pressable
            style={[styles.payButton, (!cardComplete || loading) && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={!cardComplete || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Pay £{totalAmount.toFixed(2)}</Text>
            )}
          </Pressable>

          {/* Cancel Button */}
          <Pressable style={styles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  priceSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  divider: {
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
  cardFieldContainer: {
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  stripeBadge: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stripeText: {
    fontSize: 13,
    color: '#666',
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
  },
});
