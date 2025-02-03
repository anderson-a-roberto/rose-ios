import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import TestDataButton from '../../../components/TestDataButton';

const CompanyAddressScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    postalCode: '',
    street: '',
    number: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const formatCEP = (text) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.replace(/^(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCEPChange = (text) => {
    const formattedCEP = formatCEP(text);
    setFormData(prev => ({ ...prev, postalCode: formattedCEP }));

    // Se o CEP estiver completo, buscar endereço
    if (text.replace(/\D/g, '').length === 8) {
      fetchAddress(text.replace(/\D/g, ''));
    }
  };

  const fetchAddress = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const handleNext = () => {
    updateOnboardingData({
      companyAddress: formData
    });
    navigation.navigate('PartnerData');
  };

  const isFormValid = () => {
    const requiredFields = ['postalCode', 'street', 'number', 'neighborhood', 'city', 'state'];
    return requiredFields.every(field => formData[field].trim() !== '');
  };

  return (
    <View style={styles.container}>
      <TestDataButton 
        section="companyAddress" 
        onFill={(data) => setFormData(data)}
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

      <Text style={styles.title}>Endereço da Empresa</Text>
      <Text style={styles.subtitle}>
        Informe o endereço comercial da sua empresa
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          label="CEP"
          value={formData.postalCode}
          onChangeText={handleCEPChange}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          maxLength={9}
        />

        <TextInput
          label="Rua"
          value={formData.street}
          onChangeText={(value) => setFormData(prev => ({ ...prev, street: value }))}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Número"
          value={formData.number}
          onChangeText={(value) => setFormData(prev => ({ ...prev, number: value }))}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          label="Complemento (opcional)"
          value={formData.addressComplement}
          onChangeText={(value) => setFormData(prev => ({ ...prev, addressComplement: value }))}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Bairro"
          value={formData.neighborhood}
          onChangeText={(value) => setFormData(prev => ({ ...prev, neighborhood: value }))}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Cidade"
          value={formData.city}
          onChangeText={(value) => setFormData(prev => ({ ...prev, city: value }))}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Estado"
          value={formData.state}
          onChangeText={(value) => setFormData(prev => ({ ...prev, state: value }))}
          mode="outlined"
          style={styles.input}
          maxLength={2}
          autoCapitalize="characters"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !isFormValid() && styles.continueButtonDisabled
        ]}
        onPress={handleNext}
        disabled={!isFormValid()}
      >
        <Text style={styles.continueButtonText}>CONTINUAR</Text>
      </TouchableOpacity>
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
  inputContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginBottom: 24,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CompanyAddressScreen;
