import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';
import TestDataButton from '../../components/TestDataButton';

const formatCEP = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const AddressScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { addressData } = onboardingData;

  const [formData, setFormData] = useState({
    postalCode: addressData.postalCode || '',
    street: addressData.street || '',
    number: addressData.number || '',
    complement: addressData.complement || '',
    neighborhood: addressData.neighborhood || '',
    city: addressData.city || '',
    state: addressData.state || '',
    noNumber: false
  });

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'postalCode') {
      formattedValue = formatCEP(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleNoNumber = () => {
    setFormData(prev => ({
      ...prev,
      noNumber: !prev.noNumber,
      number: !prev.noNumber ? 'S/N' : ''
    }));
  };

  const handleNext = () => {
    updateOnboardingData({
      addressData: {
        postalCode: formData.postalCode.replace(/\D/g, ''),
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state
      }
    });
    navigation.navigate('OnboardingPassword');
  };

  return (
    <View style={styles.container}>
      <TestDataButton 
        section="addressData" 
        onFill={(data) => setFormData({ ...data, noNumber: false })}
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

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Meu Endereço</Text>
        <Text style={styles.subtitle}>
          Falta pouco! Agora precisaremos das informações do seu endereço
        </Text>

        <TextInput
          label="CEP"
          value={formData.postalCode}
          onChangeText={(value) => handleChange('postalCode', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          maxLength={9}
        />

        <TextInput
          label="Cidade"
          value={formData.city}
          onChangeText={(value) => handleChange('city', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Estado"
          value={formData.state}
          onChangeText={(value) => handleChange('state', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Endereço"
          value={formData.street}
          onChangeText={(value) => handleChange('street', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Número"
          value={formData.number}
          onChangeText={(value) => handleChange('number', value)}
          mode="outlined"
          style={styles.input}
          editable={!formData.noNumber}
        />

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={formData.noNumber ? 'checked' : 'unchecked'}
            onPress={handleNoNumber}
            color="#000"
          />
          <Text style={styles.checkboxLabel}>SEM NÚMERO</Text>
        </View>

        <TextInput
          label="Bairro"
          value={formData.neighborhood}
          onChangeText={(value) => handleChange('neighborhood', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Complemento"
          value={formData.complement}
          onChangeText={(value) => handleChange('complement', value)}
          mode="outlined"
          style={styles.input}
        />
      </ScrollView>

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
  scrollView: {
    flex: 1,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginVertical: 24,
    borderRadius: 25,
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default AddressScreen;
