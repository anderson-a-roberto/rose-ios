import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
    <View style={styles.container}>
      <TestDataButton 
        section="contactData" 
        onFill={(data) => setPhoneNumber(formatPhone(data.phoneNumber))}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Celular</Text>
      <Text style={styles.subtitle}>
        Informe o número do seu celular
      </Text>

      <TextInput
        label="Celular"
        value={phoneNumber}
        onChangeText={handleChange}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        maxLength={15}
      />

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.continueButton}
        labelStyle={styles.continueButtonLabel}
      >
        CONTINUAR
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 24,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    color: '#666',
  },
  input: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 24,
    borderRadius: 25,
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default PhoneScreen;
