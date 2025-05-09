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
  const [fullName, setFullName] = useState('');
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

  // Renter specific fields
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [income, setIncome] = useState('');

  const { signUp } = useAuth();

  const validateEmail = (email: string) => email.includes('@') && email.includes('.');
  const validatePassword = (password: string) => password.length >= 6;
  const canSubmit =
    fullName.trim() &&
    validateEmail(email) &&
    phoneNumber.trim() &&
    validatePassword(password) &&
    password === confirmPassword &&
    agree;

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!canSubmit) return;
      setLoading(true);
      const metadata = {
        full_name: fullName,
        phone_number: phoneNumber,
        role,
        ...(role === 'landlord' && {
          company_name: companyName,
          license_number: licenseNumber,
        }),
        ...(role === 'renter' && {
          employment_status: employmentStatus,
          income: parseFloat(income),
        }),
      };
      const { error } = await signUp(email, password, metadata);
      if (error) throw error;
      router.replace('/auth/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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
        placeholder="Password"
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

      {/* Terms and Conditions */}
      <View style={styles.termsRow}>
        <Checkbox
          value={agree}
          onValueChange={setAgree}
          color={agree ? '#34568B' : undefined}
          style={styles.checkbox}
        />
        <Text style={styles.termsText}>
          I agree to the
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
});
