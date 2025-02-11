import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';
import TestDataButton from '../../components/TestDataButton';

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
      <View style={styles.container}>
        <TestDataButton 
          section="contactData" 
          onFill={(data) => setPhoneNumber(formatPhone(data.phoneNumber))}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Celular</Text>
            <Text style={styles.subtitle}>
              Informe o número do seu celular
            </Text>
          </View>
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
      </View>
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
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#FFF',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
    marginTop: -4,
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
  },
  continueButton: {
    borderRadius: 4,
    backgroundColor: '#E91E63',
    height: 48,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

export default PhoneScreen;
