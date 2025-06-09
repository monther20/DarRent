import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

type UserRole = 'renter' | 'landlord';

export function RegisterForm() {
  const [role, setRole] = useState<UserRole>('landlord');
  const [fullName, setFullName] = useState(''); // Maps to full_name_en
  const [fullNameAr, setFullNameAr] = useState(''); // Maps to full_name_ar
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Landlord specific fields
  const [companyName, setCompanyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bankAccountDetails, setBankAccountDetails] = useState('');
  const [propertyAddress, setPropertyAddress] = useState(''); // New landlord field

  // Renter specific fields
  const [preferredLocationEn, setPreferredLocationEn] = useState('');
  const [preferredLocationAr, setPreferredLocationAr] = useState('');
  const [budget, setBudget] = useState(''); // Will be parsed to float
  const [desiredMoveInDate, setDesiredMoveInDate] = useState(''); // New renter field

  // Call useAuth() at the top level of the functional component
  const auth = useAuth();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;
  const canSubmit =
    fullName.trim() &&
    fullNameAr.trim() && // Added validation for fullNameAr
    validateEmail(email) &&
    phoneNumber.trim() &&
    validatePassword(password) &&
    password === confirmPassword &&
    agree &&
    // Updated validation for role-specific fields (assuming new fields are optional for now)
    // If bankAccountDetails for landlord or budget for renter are mandatory, add .trim() here
    (role === 'renter' ? preferredLocationEn.trim() && budget.trim() : true) &&
    (role === 'landlord' ? bankAccountDetails.trim() : true);


  const handleSubmit = async () => {
    try {
      setError(null);
      if (!canSubmit) {
        setError("Please fill all required fields correctly and agree to the terms.");
        return;
      }
      setLoading(true);

      const userData: any = {
        email,
        password,
        // name: fullName, // 'name' was for the old AuthContext, using specific names now
        fullNameEn: fullName,
        fullNameAr: fullNameAr,
        phone: phoneNumber,
        role,
      };

      if (role === 'landlord') {
        userData.companyName = companyName;
        userData.licenseNumber = licenseNumber;
        userData.bankAccountDetails = bankAccountDetails;
        userData.propertyAddress = propertyAddress; // Add new landlord field
      } else if (role === 'renter') {
        userData.preferredLocationEn = preferredLocationEn;
        userData.preferredLocationAr = preferredLocationAr;
        userData.budget = budget ? parseFloat(budget) : undefined; // Handle empty budget string
        userData.desiredMoveInDate = desiredMoveInDate; // Add new renter field
      }

      // Call signUp from AuthContext with the correct parameters
      const { signUp } = auth;

      if (!signUp || typeof signUp !== 'function') {
        console.error("SignUp function is undefined on auth context!", auth);
        setError("Registration service is currently unavailable. Please try again later or contact support.");
        setLoading(false);
        return;
      }

      // Create metadata object that matches your database structure
      const metadata = {
        // Main user data for users table
        full_name_en: fullName,
        full_name_ar: fullNameAr,
        phone: phoneNumber,
        role: role,

        // Role-specific data
        ...(role === 'landlord' && {
          // Landlord-specific data for landlords table
          bank_account: bankAccountDetails,
          company_name: companyName,
          license_number: licenseNumber,
          property_address: propertyAddress,
        }),
        ...(role === 'renter' && {
          // Renter-specific data for renters table
          preferred_location_en: preferredLocationEn,
          preferred_location_ar: preferredLocationAr,
          budget: budget ? parseFloat(budget) : null,
          desired_move_in_date: desiredMoveInDate,
        }),
      };

      // Call signUp from AuthContext
      const { error: registrationError } = await signUp(email, password, metadata);

      if (registrationError) {
        const message = registrationError.message || "An unknown error occurred during registration.";
        setError(message);
        setLoading(false);
        return;
      }

      // Registration successful - user will be redirected by AuthContext state changes
      // For now, redirect to appropriate screen based on role
      if (role === 'landlord') {
        router.replace('/(landlord-tabs)');
      } else {
        router.replace('/(renter-tabs)');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.contentContainer}>
      {/* Role Selector */}
      <Text style={styles.label}>I am a...</Text>
      <View style={styles.roleSelectorRow}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'landlord' ? styles.roleButtonActive : styles.roleButtonInactive,
          ]}
          onPress={() => setRole('landlord')}
        >
          <Text
            style={[
              styles.roleButtonText,
              role === 'landlord' ? styles.roleButtonTextActive : styles.roleButtonTextInactive,
            ]}
          >
            Landlord
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'renter' ? styles.roleButtonActive : styles.roleButtonInactive,
          ]}
          onPress={() => setRole('renter')}
        >
          <Text
            style={[
              styles.roleButtonText,
              role === 'renter' ? styles.roleButtonTextActive : styles.roleButtonTextInactive,
            ]}
          >
            Renter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <Text style={styles.label}>Full Name (Arabic)</Text>
      <TextInput
        placeholder="Full Name (Arabic)"
        value={fullNameAr}
        onChangeText={setFullNameAr}
        style={[styles.input, { textAlign: 'right' }]} // For RTL
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password (min. 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Role Specific Fields */}
      {role === 'renter' && (
        <>
          <Text style={styles.sectionTitle}>Renter Details</Text>
          <Text style={styles.label}>Preferred Location (English)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Downtown, Suburbs"
            value={preferredLocationEn}
            onChangeText={setPreferredLocationEn}
          />
          <Text style={styles.label}>Preferred Location (Arabic)</Text>
          <TextInput
            placeholder="e.g., وسط المدينة, الضواحي"
            value={preferredLocationAr}
            onChangeText={setPreferredLocationAr}
            style={[styles.input, { textAlign: 'right' }]}
          />
          <Text style={styles.label}>Monthly Budget (Numeric)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1500"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Desired Move-in Date (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={desiredMoveInDate}
            onChangeText={setDesiredMoveInDate}
          // For a better UX, consider using a DateTimePicker component here
          // e.g., @react-native-community/datetimepicker
          />
        </>
      )}

      {role === 'landlord' && (
        <>
          <Text style={styles.sectionTitle}>Landlord Details</Text>
          <Text style={styles.label}>Company Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Company LLC"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <Text style={styles.label}>Real Estate License Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="License Number"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
          />
          <Text style={styles.label}>Bank Account Details (for payouts)</Text>
          <TextInput
            style={styles.input}
            placeholder="IBAN or Account Number"
            value={bankAccountDetails}
            onChangeText={setBankAccountDetails}
          />
          <Text style={styles.label}>Primary Property Address (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 123 Main St, City, Country"
            value={propertyAddress}
            onChangeText={setPropertyAddress}
          />
        </>
      )}

      {/* Terms and Conditions */}
      <View style={styles.termsRow}>
        <Checkbox
          value={agree}
          onValueChange={setAgree}
          color={agree ? '#34568B' : undefined}
          style={styles.checkbox}
        />
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text
            style={styles.termsLink}
            onPress={() => Linking.openURL('https://your-terms-url.com')}
          >
            Terms And Conditions
          </Text>
        </Text>
      </View>

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Create Account Button */}
      <TouchableOpacity
        style={[styles.button, canSubmit ? styles.buttonActive : styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: { // Added for ScrollView content padding
    paddingBottom: 30, // Ensure button is not hidden by keyboard or tab bar
  },
  label: {
    fontSize: 14,
    color: '#34568B',
    marginBottom: 4,
    marginTop: 16,
    fontWeight: '500',
  },
  roleSelectorRow: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#F2994A',
  },
  roleButtonInactive: {
    backgroundColor: '#F4F6FA',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  roleButtonTextInactive: {
    color: '#34568B',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F4F6FA',
    fontSize: 15,
    color: '#222',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  checkbox: {
    marginRight: 8,
    borderRadius: 4,
    borderColor: '#34568B',
  },
  termsText: {
    color: '#222',
    fontSize: 14,
  },
  termsLink: {
    color: '#F2994A',
    fontWeight: '600',
    marginLeft: 4,
  },
  button: {
    height: 50,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonActive: {
    backgroundColor: '#34568B',
  },
  buttonDisabled: {
    backgroundColor: '#FFE0B2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 5,
  },
});
