import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';
import { Ionicons } from '@expo/vector-icons';
import { mockApi } from '@/app/services/mockApi';

// Simple Alert fallback for cross-platform support
const Alert = {
  alert: (title: string, message?: string) => {
    if (typeof window !== 'undefined') {
      // Web fallback
      window.alert(`${title}\n${message || ''}`);
    } else {
      // Use native alert if available
      try {
        require('react-native').Alert.alert(title, message);
      } catch (e) {
        console.error(title, message);
      }
    }
  }
};

export default function ContractReview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { propertyId, requestId } = params;
  
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [agreeChecked, setAgreeChecked] = useState(false);

  // Load property details and generate sample contract PDF
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch property details
        if (propertyId) {
          const propertyData = await mockApi.getPropertyById(propertyId as string);
          setProperty(propertyData);
        }
        
        // Generate or load sample contract PDF
        await generateSampleContract();
      } catch (error) {
        console.error('Error loading contract data:', error);
        Alert.alert('Error', 'Failed to load contract. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [propertyId, requestId]);

  // Generate a sample contract PDF for demonstration purposes
  const generateSampleContract = async () => {
    try {
      // Check if we have a cached version first
      const cachedPdfPath = `${FileSystem.cacheDirectory}contract_${propertyId}_${requestId}.pdf`;
      const fileInfo = await FileSystem.getInfoAsync(cachedPdfPath);
      
      if (fileInfo.exists) {
        setPdfPath(cachedPdfPath);
        return;
      }
      
      // If not cached, create a simple PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      
      const fontSize = 12;
      page.drawText('RENTAL AGREEMENT CONTRACT', {
        x: 50,
        y: 800,
        size: 18,
      });
      
      page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 770,
        size: fontSize,
      });
      
      page.drawText(`Property ID: ${propertyId}`, {
        x: 50,
        y: 750, 
        size: fontSize,
      });
      
      page.drawText(`Request ID: ${requestId}`, {
        x: 50,
        y: 730,
        size: fontSize,
      });
      
      page.drawText('1. TERMS AND CONDITIONS', {
        x: 50,
        y: 690,
        size: 14,
      });
      
      page.drawText(
        'This Rental Agreement (hereinafter referred to as the "Agreement") is made and entered into on the date specified above, by and between the Owner (hereinafter referred to as "Landlord") and the Renter (hereinafter referred to as "Tenant").',
        {
          x: 50,
          y: 670,
          size: fontSize,
          maxWidth: 495,
        }
      );
      
      page.drawText(
        '2. PROPERTY DESCRIPTION\n\nThe Landlord agrees to rent to the Tenant, and the Tenant agrees to rent from the Landlord, the residential property described above.',
        {
          x: 50,
          y: 630,
          size: fontSize,
          maxWidth: 495,
        }
      );
      
      page.drawText(
        '3. RENTAL TERM\n\nThe term of this Agreement shall commence on the start date and continue for the number of months specified in the rental request, unless terminated earlier as provided in this Agreement.',
        {
          x: 50,
          y: 580,
          size: fontSize,
          maxWidth: 495,
        }
      );
      
      page.drawText(
        '4. RENT PAYMENT\n\nTenant agrees to pay the monthly rent amount on or before the 1st day of each month. Late payments may be subject to a fee as described in section 5.',
        {
          x: 50,
          y: 530,
          size: fontSize,
          maxWidth: 495,
        }
      );
      
      page.drawText(
        '5. LATE CHARGES\n\nIf Tenant fails to pay the rent in full by the 5th day of the month, Tenant shall pay Landlord a late charge of 5% of the monthly rent.',
        {
          x: 50,
          y: 480,
          size: fontSize,
          maxWidth: 495,
        }
      );
      
      page.drawText(
        '6. SECURITY DEPOSIT\n\nUpon execution of this Agreement, Tenant shall deposit with Landlord a security deposit equivalent to one month\'s rent, which shall be held as security for Tenant\'s performance under this Agreement.',
        {
          x: 50,
          y: 430,
          size: fontSize,
          maxWidth: 495,
        }
      );
      
      page.drawText(
        '7. SIGNATURES\n\nThis Agreement is not valid unless signed by both Landlord and Tenant.',
        {
          x: 50,
          y: 380,
          size: fontSize,
          maxWidth: 495,
        }
      );
      
      page.drawText(
        'Landlord Signature: _________________________',
        {
          x: 50,
          y: 330,
          size: fontSize,
        }
      );
      
      page.drawText(
        'Tenant Signature: __________________________',
        {
          x: 50,
          y: 300,
          size: fontSize,
        }
      );
      
      page.drawText(
        'Date: _________________',
        {
          x: 50,
          y: 270,
          size: fontSize,
        }
      );
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Convert bytes to base64
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
      
      // Write to file system
      await FileSystem.writeAsStringAsync(cachedPdfPath, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      setPdfPath(cachedPdfPath);
    } catch (error) {
      console.error('Error generating contract:', error);
      Alert.alert('Error', 'Failed to generate contract PDF.');
    }
  };

  const handleAgreeToProceed = () => {
    if (!pdfPath) {
      Alert.alert('Error', 'Please wait for the contract to load.');
      return;
    }
    
    // Navigate to the signature screen with needed parameters
    router.push({
      pathname: '/ContractSignature',
      params: {
        propertyId,
        requestId,
        pdfPath,
      },
    });
  };

  // Convert the PDF path to a URI that WebView can display
  const getPdfUri = () => {
    if (!pdfPath) return null;
    // For local files, we need file:// scheme
    return `file://${pdfPath}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading contract...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rental Contract</Text>
      </View>
      
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>
          {property?.title || 'Property Contract'}
        </Text>
        <Text style={styles.propertyAddress}>
          {property?.location?.address || 'Address information not available'}
        </Text>
      </View>
      
      <View style={styles.pdfContainer}>
        {pdfPath ? (
          <WebView
            style={styles.pdfView}
            source={{ uri: getPdfUri() || '' }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            )}
          />
        ) : (
          <View style={styles.noPdfContainer}>
            <Text style={styles.noPdfText}>Contract not available</Text>
          </View>
        )}
      </View>
      
      <View style={styles.agreementSection}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setAgreeChecked(!agreeChecked)}
        >
          <View style={[styles.checkbox, agreeChecked && styles.checkboxChecked]}>
            {agreeChecked && <Ionicons name="checkmark" size={18} color="white" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to all terms and conditions in this contract
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.proceedButton, !agreeChecked && styles.proceedButtonDisabled]}
          onPress={handleAgreeToProceed}
          activeOpacity={agreeChecked ? 0.7 : 1}
        >
          <Text style={styles.proceedButtonText}>
            Continue to Sign Contract
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
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
  propertyInfo: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    margin: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pdfView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  noPdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPdfText: {
    fontSize: 16,
    color: '#6B7280',
  },
  agreementSection: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2563EB',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  proceedButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
}); 