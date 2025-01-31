import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';
import TestDataButton from '../../components/TestDataButton';

const formatCPF = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
};

const formatDate = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(
    /(\d{2})(\d{2})(\d{4})/,
    '$1/$2/$3'
  );
};

const PersonalDataScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { personalData } = onboardingData;

  const [formData, setFormData] = useState({
    fullName: personalData.fullName || '',
    documentNumber: personalData.documentNumber || '',
    birthDate: personalData.birthDate || '',
    motherName: personalData.motherName || '',
    isPep: personalData.isPep || false
  });

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'documentNumber') {
      formattedValue = formatCPF(value);
    } else if (field === 'birthDate') {
      formattedValue = formatDate(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleNext = () => {
    updateOnboardingData({
      personalData: {
        ...formData,
        documentNumber: formData.documentNumber.replace(/\D/g, '')
      }
    });
    navigation.navigate('OnboardingPepInfo');
  };

  return (
    <View style={styles.container}>
      <TestDataButton 
        section="personalData" 
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

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Dados Pessoais</Text>
        <Text style={styles.subtitle}>
          Vamos precisar de algumas informações para seguir com seu cadastro
        </Text>

        <TextInput
          label="Nome Completo"
          value={formData.fullName}
          onChangeText={(value) => handleChange('fullName', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="CPF"
          value={formData.documentNumber}
          onChangeText={(value) => handleChange('documentNumber', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          maxLength={14}
        />

        <TextInput
          label="Data de Nascimento"
          value={formData.birthDate}
          onChangeText={(value) => handleChange('birthDate', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          maxLength={10}
          placeholder="DD/MM/AAAA"
        />

        <TextInput
          label="Nome Completo da Mãe"
          value={formData.motherName}
          onChangeText={(value) => handleChange('motherName', value)}
          mode="outlined"
          style={styles.input}
        />

        {/* PEP Selection */}
        <TouchableOpacity
          style={styles.pepContainer}
          onPress={() => navigation.navigate('OnboardingPepInfo')}
        >
          <View style={styles.pepTextContainer}>
            <Text style={styles.pepLabel}>Pessoa Politicamente Exposta</Text>
            <Text style={styles.pepValue}>
              {formData.isPep ? 'Sim' : 'Não sou e não tenho vínculo...'}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
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
  pepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  pepTextContainer: {
    flex: 1,
  },
  pepLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  pepValue: {
    fontSize: 16,
    color: '#000',
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

export default PersonalDataScreen;
