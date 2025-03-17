import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';

const formatPhone = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(
      /(\d{2})?(\d{4,5})?(\d{4})?/,
      function(_, ddd, prefix, suffix) {
        if (suffix) return `(${ddd}) ${prefix}-${suffix}`;
        if (prefix) return `(${ddd}) ${prefix}`;
        if (ddd) return `(${ddd}`;
        return '';
      }
    );
  }
  return text.slice(0, 15);
};

const PhoneScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState(onboardingData.contactData.phoneNumber || '');

  const handleChange = (value) => {
    setPhoneNumber(formatPhone(value));
  };

  const handleNext = () => {
    updateOnboardingData({
      contactData: {
        ...onboardingData.contactData,
        phoneNumber: phoneNumber.replace(/\D/g, '')
      }
    });
    navigation.navigate('OnboardingEmail');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Celular</Text>
          <Text style={styles.subtitle}>
            Informe o número do seu celular
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <TextInput
              label="Celular"
              value={phoneNumber}
              onChangeText={handleChange}
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
              keyboardType="numeric"
              maxLength={15}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.continueButton}
            labelStyle={styles.continueButtonLabel}
          >
            CONTINUAR
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    minHeight: '100%',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  continueButton: {
    borderRadius: 4,
    backgroundColor: '#E91E63',
    paddingVertical: 8,
    height: 48,
    justifyContent: 'center',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default PhoneScreen;
