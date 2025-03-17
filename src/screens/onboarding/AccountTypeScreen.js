import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';

const formatCPF = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
};

const AccountTypeScreen = ({ navigation }) => {
  const { updateOnboardingData, onboardingData } = useOnboarding();
  const [selectedType, setSelectedType] = useState(null);
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState('');

  const handleCpfChange = (value) => {
    const formattedCpf = formatCPF(value);
    setCpf(formattedCpf);
    setCpfError('');
  };

  const validateCpf = () => {
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      setCpfError('CPF deve conter 11 dígitos');
      return false;
    }
    return true;
  };

  const handleTypeSelection = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) {
      return;
    }

    if (selectedType === 'PF') {
      if (!validateCpf()) {
        return;
      }

      updateOnboardingData({ 
        accountType: selectedType,
        personalData: {
          ...onboardingData.personalData,
          documentNumber: cpf
        }
      });
      
      navigation.navigate('OnboardingPersonalData');
    } else {
      updateOnboardingData({ accountType: selectedType });
      navigation.navigate('CompanyData');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Tipo de Conta</Text>
      <Text style={styles.subtitle}>
        Selecione o tipo de conta que você deseja abrir
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedType === 'PF' && styles.selectedOption
          ]}
          onPress={() => handleTypeSelection('PF')}
        >
          <MaterialCommunityIcons name="account" size={32} color={selectedType === 'PF' ? "#E91E63" : "#000"} />
          <Text style={styles.optionTitle}>Pessoa Física</Text>
          <Text style={styles.optionDescription}>
            Conta para uso pessoal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            selectedType === 'PJ' && styles.selectedOption
          ]}
          onPress={() => handleTypeSelection('PJ')}
        >
          <MaterialCommunityIcons name="domain" size={32} color={selectedType === 'PJ' ? "#E91E63" : "#000"} />
          <Text style={styles.optionTitle}>Pessoa Jurídica</Text>
          <Text style={styles.optionDescription}>
            Conta para sua empresa
          </Text>
        </TouchableOpacity>
      </View>

      {selectedType === 'PF' && (
        <View style={styles.cpfContainer}>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            value={cpf}
            onChangeText={handleCpfChange}
            style={styles.input}
            keyboardType="numeric"
            maxLength={14}
            placeholder="Digite seu CPF"
            underlineColor="transparent"
            activeUnderlineColor="#E91E63"
          />
          {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedType || (selectedType === 'PF' && !cpf)) && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={!selectedType || (selectedType === 'PF' && !cpf)}
      >
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  option: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#E91E63',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cpfContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    height: 50,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountTypeScreen;
