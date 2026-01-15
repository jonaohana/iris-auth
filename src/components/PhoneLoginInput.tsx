import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { RecaptchaVerifier } from 'firebase/auth';
import { useAuth } from '../hooks';
import { AuthButton } from './AuthButton';
import { theme } from '../theme';

interface PhoneLoginInputProps {
  onSuccess?: () => void;
}

export const PhoneLoginInput: React.FC<PhoneLoginInputProps> = ({ onSuccess }) => {
  const { signInWithPhone, verifyPhoneCode } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Setup reCAPTCHA verifier for web
    if (Platform.OS === 'web' && !recaptchaVerifierRef.current) {
      try {
        // Create a container for reCAPTCHA
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
          const { auth } = require('../config/firebase.web');
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA verified');
            },
            'expired-callback': () => {
              setError('reCAPTCHA expired. Please try again.');
            }
          });
        }
      } catch (err) {
        console.error('Error setting up reCAPTCHA:', err);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    if (!recaptchaVerifierRef.current) {
      setError('reCAPTCHA not initialized');
      return;
    }

    // Auto-correct phone number format
    let formattedPhone = phoneNumber.trim();
    
    // Remove all non-digit characters except +
    formattedPhone = formattedPhone.replace(/[^\d+]/g, '');
    
    // If doesn't start with +, assume US and add +1
    if (!formattedPhone.startsWith('+')) {
      // Remove leading 1 if present (user typed 1 instead of +1)
      if (formattedPhone.startsWith('1') && formattedPhone.length === 11) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+1' + formattedPhone;
      }
    }
    
    // Validate length (rough check - should be at least country code + number)
    if (formattedPhone.length < 10) {
      setError('Phone number is too short');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const confirmationResult = await signInWithPhone(formattedPhone, recaptchaVerifierRef.current);
      setVerificationId(confirmationResult.verificationId);
      setCodeSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
      console.error('Phone auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyPhoneCode(verificationId, verificationCode);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!codeSent ? (
        <>
          <Text style={styles.hintText}>
            Enter your phone number (we'll add +1 if needed)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="310-555-1234 or +13105551234"
            placeholderTextColor={theme.colors.textSecondary}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={!loading}
          />
          <AuthButton
            provider="phone"
            title="Send Verification Code"
            onPress={handleSendCode}
            loading={loading}
            disabled={!phoneNumber || loading}
          />
        </>
      ) : (
        <>
          <Text style={styles.sentText}>
            Verification code sent to {phoneNumber}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            placeholderTextColor={theme.colors.textSecondary}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            autoComplete="sms-otp"
            editable={!loading}
          />
          <AuthButton
            provider="phone"
            title="Verify Code"
            onPress={handleVerifyCode}
            loading={loading}
            disabled={!verificationCode || loading}
          />
          <Pressable
            onPress={() => {
              setCodeSent(false);
              setVerificationCode('');
              setError(null);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Change phone number</Text>
          </Pressable>
        </>
      )}

      {/* reCAPTCHA container for web */}
      {Platform.OS === 'web' && <div id="recaptcha-container" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    ...theme.typography.bodySmall,
  },
  sentText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  hintText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  backButton: {
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  backText: {
    color: theme.colors.primary,
    ...theme.typography.bodySmall,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
});
