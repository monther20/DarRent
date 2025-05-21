import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text } from '@/components/Text';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { mockPaymentMethods } from '@/mockData/payments';
import { PaymentMethod, Bill } from '@/types/payment';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function PaymentDetailsScreen() {
  const { t } = useTranslation(['payments']);
  const params = useLocalSearchParams();
  const bill = params.bill as unknown as Bill;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [subscriberNumber, setSubscriberNumber] = useState(bill.subscriberNumber || '');
  const [electricityCompany, setElectricityCompany] = useState(bill.electricityCompany || 'IDECO');
  const [contractNumber, setContractNumber] = useState(bill.contractNumber || '');

  const renderBillDetails = () => {
    switch (bill.type) {
      case 'water':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('subscriberNumber')}</Text>
            <TextInput
              style={styles.input}
              value={subscriberNumber}
              onChangeText={setSubscriberNumber}
              placeholder={t('enterSubscriberNumber')}
              keyboardType="numeric"
            />
          </View>
        );
      case 'electricity':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('electricityCompany')}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={electricityCompany}
                  onValueChange={setElectricityCompany}
                  style={styles.picker}
                >
                  <Picker.Item label="IDECO" value="IDECO" />
                  <Picker.Item label="JEPCO" value="JEPCO" />
                  <Picker.Item label="EDCO" value="EDCO" />
                </Picker>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('contractNumber')}</Text>
              <TextInput
                style={styles.input}
                value={contractNumber}
                onChangeText={setContractNumber}
                placeholder={t('enterContractNumber')}
                keyboardType="numeric"
              />
            </View>
          </>
        );
      case 'rent':
        return (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {t('rentPaymentInfo', { number: bill.landlordPaymentNumber })}
            </Text>
          </View>
        );
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedMethod?.id === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedMethod(method)}
    >
      <FontAwesome name={method.icon as any} size={24} color={Colors.light.primary} />
      <Text style={styles.paymentMethodName}>{method.name}</Text>
      {selectedMethod?.id === method.id && (
        <FontAwesome
          name="check-circle"
          size={20}
          color={Colors.light.primary}
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  const handleConfirmPayment = () => {
    if (!selectedMethod) return;

    // Validate required fields based on bill type
    if (bill.type === 'water' && !subscriberNumber) {
      // Show error for missing subscriber number
      return;
    }
    if (bill.type === 'electricity' && !contractNumber) {
      // Show error for missing contract number
      return;
    }

    // Navigate to confirmation with payment details
    router.push({
      pathname: '/payment-confirmation',
      params: {
        billType: bill.type,
        amount: bill.amount,
        subscriberNumber,
        electricityCompany,
        contractNumber,
        paymentMethod: selectedMethod.type,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title={t('billDetails')} />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t(`billTypes.${bill.type}`)}</Text>
          {renderBillDetails()}
        </View>

        <View style={[styles.card, styles.marginTop]}>
          <Text style={styles.sectionTitle}>{t('selectPaymentMethod')}</Text>
          <View style={styles.paymentMethodsContainer}>
            {mockPaymentMethods.map(renderPaymentMethod)}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, !selectedMethod && styles.disabledButton]}
          onPress={handleConfirmPayment}
          disabled={!selectedMethod}
        >
          <Text style={styles.confirmButtonText}>{t('confirmPayment')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  marginTop: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.light.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  infoContainer: {
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedPaymentMethod: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F7FF',
  },
  paymentMethodName: {
    fontSize: 16,
    marginLeft: 12,
    color: Colors.light.text,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
