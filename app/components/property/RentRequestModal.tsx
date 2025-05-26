import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

interface RentRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (months: number, message?: string) => void;
  propertyPrice: number;
  propertyCurrency: string;
  isRTL: boolean;
}

export const RentRequestModal: React.FC<RentRequestModalProps> = ({
  visible,
  onClose,
  onSubmit,
  propertyPrice,
  propertyCurrency,
  isRTL,
}) => {
  const { t } = useTranslation(['propertyDetails', 'common']);
  const [months, setMonths] = useState('6');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMonthsChange = (value: string) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setMonths(value);
      setError('');
    }
  };

  const handleSubmit = () => {
    // Validate
    const monthsNum = parseInt(months, 10);

    if (isNaN(monthsNum) || monthsNum <= 0) {
      setError(t('invalidMonths', { ns: 'propertyDetails' }));
      return;
    }

    if (monthsNum > 24) {
      setError(t('maxMonthsExceeded', { ns: 'propertyDetails' }));
      return;
    }

    // Submit
    onSubmit(monthsNum, message.trim());
  };

  const totalAmount = parseInt(months, 10) * propertyPrice || 0;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e: any) => e.stopPropagation()}>
            <View style={[styles.modal, isRTL && styles.modalRTL]}>
              <View style={[styles.header, isRTL && styles.headerRTL]}>
                <Text style={styles.title}>{t('rentRequestTitle', { ns: 'propertyDetails' })}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Text style={styles.label}>{t('rentalPeriod', { ns: 'propertyDetails' })}</Text>

                <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
                  <TextInput
                    style={[styles.input, isRTL && styles.inputRTL]}
                    value={months}
                    onChangeText={handleMonthsChange}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.inputLabel}>{t('months', { ns: 'propertyDetails' })}</Text>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.calculator}>
                  <Text style={styles.calculatorLabel}>
                    {t('monthlyRent', { ns: 'propertyDetails' })}
                  </Text>
                  <Text style={styles.calculatorValue}>
                    {propertyPrice} {propertyCurrency}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.calculator}>
                  <Text style={styles.calculatorLabel}>
                    {t('totalAmount', { ns: 'propertyDetails' })}
                  </Text>
                  <Text style={styles.totalValue}>
                    {totalAmount} {propertyCurrency}
                  </Text>
                </View>

                <Text style={styles.label}>{t('optionalMessageLabel', { ns: 'propertyDetails' })}</Text>
                <TextInput
                  style={[styles.textArea, isRTL && styles.inputRTL]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={t('optionalMessagePlaceholder', { ns: 'propertyDetails' })}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.note}>{t('rentRequestNote', { ns: 'propertyDetails' })}</Text>
              </View>

              <View style={[styles.actions, isRTL && styles.actionsRTL]}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>{t('cancel', { ns: 'common' })}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>{t('submit', { ns: 'common' })}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalRTL: {
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34568B',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainerRTL: {
    flexDirection: 'row-reverse',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  inputRTL: {
    textAlign: 'center',
  },
  inputLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlignVertical: 'top', // For multiline
    marginBottom: 16,
    minHeight: 80, // Adjust as needed
  },
  errorText: {
    color: '#F44336',
    marginBottom: 12,
    fontSize: 14,
  },
  calculator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculatorLabel: {
    fontSize: 16,
    color: '#666',
  },
  calculatorValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 18,
    color: '#34568B',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
  },
  actionsRTL: {
    flexDirection: 'row-reverse',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#34568B',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
