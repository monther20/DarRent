import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SignatureCanvas from 'react-native-signature-canvas';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

// Create a simplified Alert for both platforms
const Alert = {
  alert: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      // Web environment
      window.alert(`${title}\n\n${message || ''}`);
    } else {
      // React Native environment
      try {
        require('react-native').Alert.alert(title, message);
      } catch (e) {
        console.error(title, message);
      }
    }
  }
};

export default function ContractSignature() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { propertyId, requestId, pdfPath } = params;

  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: signature, 2: personal info, 3: success
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    dateOfBirth: '',
    nationalId: '',
  });
  
  const signatureRef = useRef<any>(null);
  
  // Handle finished signature
  const handleSignature = (signature: string) => {
    setSignature(signature);
  };
  
  // Clear the signature pad
  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setSignature(null);
  };
  
  // Handle confirmation when user is satisfied with signature
  const handleConfirm = () => {
    if (!signature) {
      Alert.alert('Signature Required', 'Please sign the document before proceeding.');
      return;
    }

    setStep(2); // Move to personal info step
  };
  
  // Handle submission of the signed contract
  const handleSubmit = async () => {
    if (!signature || !pdfPath) {
      Alert.alert('Error', 'Signature or contract document is missing.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the original PDF
      const originalPdfBytes = await FileSystem.readAsStringAsync(pdfPath as string, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Load the PDF
      const pdfDoc = await PDFDocument.load(originalPdfBytes);
      
      // Get the first page
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      // Convert signature to PNG if it's not already
      let signatureImage = signature;
      if (signatureImage.startsWith('data:image/svg+xml')) {
        // If needed, convert SVG to PNG (simplification - in real app, need proper conversion)
        // For now, we'll use the signature as is
      }
      
      // Note: In a real implementation, embedding the signature would require:
      // 1. Converting the signature data URL to a proper image asset
      // 2. Using PDFLib's embedPng/embedJpg methods
      // 3. Drawing the image on the precise location where the signature line is
      
      // Here we simulate the signature embedding
      firstPage.drawText("✓ Document signed electronically", {
        x: 50,
        y: 230,
        size: 12,
      });
      
      // Add personal info to the document
      firstPage.drawText(`Name: ${personalInfo.fullName}`, {
        x: 50,
        y: 210,
        size: 10,
      });
      
      firstPage.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 190,
        size: 10,
      });
      
      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      
      // Convert to base64
      const modifiedPdfBase64 = Buffer.from(modifiedPdfBytes).toString('base64');
      
      // Define the final PDF path with signed_ prefix
      const signedPdfPath = `${FileSystem.cacheDirectory}signed_contract_${propertyId}_${requestId}.pdf`;
      
      // Write to file system
      await FileSystem.writeAsStringAsync(signedPdfPath, modifiedPdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Share the signed document if on a mobile device
      const isWeb = Constants.platform?.web;
      if (!isWeb && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(signedPdfPath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your signed contract',
        });
      }
      
      // Show success
      setStep(3);
    } catch (error) {
      console.error('Error signing the document:', error);
      Alert.alert('Error', 'Failed to sign the document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle going back
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };
  
  // Simulate input change for personal info
  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo({
      ...personalInfo,
      [field]: value,
    });
  };
  
  // Go to home screen or property details after success
  const handleFinish = () => {
    router.replace('/');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'Sign Contract' : 
           step === 2 ? 'Confirm Details' : 
           'Contract Signed'}
        </Text>
      </View>
      
      {step === 1 && (
        <View style={styles.signatureContainer}>
          <Text style={styles.instructions}>
            Please sign below to indicate your agreement to the contract terms
          </Text>
          
          <View style={styles.signatureBox}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSignature}
              descriptionText="Sign above"
              clearText="Clear"
              confirmText="Save"
              webStyle={`
                .m-signature-pad {
                  margin: 0;
                  height: 100%;
                  width: 100%;
                  border: none;
                  background: #f8fafc;
                }
                .m-signature-pad--body {
                  border: none;
                }
                .m-signature-pad--footer {
                  display: none;
                }
              `}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleClear}
            >
              <Text style={styles.secondaryButtonText}>Clear Signature</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleConfirm}
            >
              <Text style={styles.primaryButtonText}>Confirm Signature</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {step === 2 && (
        <View style={styles.detailsContainer}>
          <Text style={styles.instructions}>
            Please confirm your details to complete the contract
          </Text>
          
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => {
                  // In a real app, show a text input
                  handlePersonalInfoChange('fullName', 'John Smith');
                  Alert.alert('Demo', 'This would open a text input in a real app. We\'ve prefilled it for this demo.');
                }}
              >
                <Text>{personalInfo.fullName || 'Tap to enter your name'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => {
                  // In a real app, show a date picker
                  handlePersonalInfoChange('dateOfBirth', '01/01/1990');
                  Alert.alert('Demo', 'This would open a date picker in a real app. We\'ve prefilled it for this demo.');
                }}
              >
                <Text>{personalInfo.dateOfBirth || 'Tap to enter your date of birth'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>National ID</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => {
                  // In a real app, show a text input
                  handlePersonalInfoChange('nationalId', '123-45-6789');
                  Alert.alert('Demo', 'This would open a text input in a real app. We\'ve prefilled it for this demo.');
                }}
              >
                <Text>{personalInfo.nationalId || 'Tap to enter your National ID'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
              onPress={!isSubmitting ? handleSubmit : undefined}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Submit Signed Contract
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {step === 3 && (
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>
          
          <Text style={styles.successTitle}>Contract Signed Successfully!</Text>
          
          <Text style={styles.successMessage}>
            Your rental contract has been signed and submitted. You'll receive a copy via email, and the property owner will be notified.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleFinish}
            >
              <Text style={styles.primaryButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  signatureContainer: {
    flex: 1,
    padding: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    textAlign: 'center',
  },
  signatureBox: {
    height: 300,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  successContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
  },
}); 