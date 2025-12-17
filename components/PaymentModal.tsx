import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  appointmentFee: number;
  additionalFee: number;
}

export default function PaymentModal({
  visible,
  onClose,
  onPaymentSuccess,
  appointmentFee,
  additionalFee,
}: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = appointmentFee + additionalFee;

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateCard = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanedCardNumber.length !== 16) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (expiryDate.length !== 5) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    const [month, year] = expiryDate.split('/');
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10) + 2000;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (expMonth < 1 || expMonth > 12) {
      setError('Invalid expiry month');
      return false;
    }
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setError('Card has expired');
      return false;
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
      setError('Please enter a valid CVV');
      return false;
    }
    
    if (cardholderName.trim().length < 2) {
      setError('Please enter the cardholder name');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    setError(null);
    
    if (!validateCard()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate Stripe payment processing
      // In production, you would:
      // 1. Call your backend to create a PaymentIntent
      // 2. Use Stripe SDK to confirm the payment
      // 3. Handle the result
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      // For demo purposes, accept any valid-looking card
      // In production, this would be handled by Stripe
      
      setLoading(false);
      onPaymentSuccess();
    } catch (err) {
      setLoading(false);
      setError('Payment failed. Please try again.');
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Payment Details</Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
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

            {/* Card Form */}
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Card Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#999"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#999"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#999"
                    value={cvv}
                    onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 4))}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* Stripe Badge */}
              <View style={styles.stripeBadge}>
                <Text style={styles.stripeText}>🔒 Secured by Stripe</Text>
              </View>

              {/* Pay Button */}
              <Pressable
                style={[styles.payButton, loading && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payButtonText}>Pay £{totalAmount.toFixed(2)}</Text>
                )}
              </Pressable>

              {/* Cancel Button */}
              <Pressable style={styles.cancelButton} onPress={handleClose} disabled={loading}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
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
  form: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
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
    opacity: 0.7,
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
