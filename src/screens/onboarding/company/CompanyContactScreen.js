import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import TestDataButton from '../../../components/TestDataButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../config/supabase';

// Funções de formatação
const formatPhone = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (!numbers) return '';
  
  // Se já tem o prefixo internacional
  if (numbers.startsWith('55')) {
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  
  // Se não tem o prefixo, adiciona
  return `+55 ${numbers.slice(0, 1)} ${numbers.slice(1, 5)}-${numbers.slice(5)}`;
};

const formatCNPJ = (cnpj) => cnpj.replace(/\D/g, '');

const formatDate = (date) => {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

const formatCEP = (cep) => cep.replace(/\D/g, '');

const CompanyContactScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    businessEmail: onboardingData.companyContact?.businessEmail || '',
    contactNumber: onboardingData.companyContact?.contactNumber || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'contactNumber') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    const numbers = phone.replace(/\D/g, '');
    // Aceita números com ou sem o prefixo internacional (+55)
    return numbers.length >= 11 && numbers.length <= 13;
  };

  const isFormValid = () => {
    return isValidEmail(formData.businessEmail) && isValidPhone(formData.contactNumber);
  };

  const handleNext = async () => {
    if (!isFormValid()) {
      setError('Por favor, preencha todos os campos corretamente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Salvar dados de contato
      updateOnboardingData({
        companyContact: {
          businessEmail: formData.businessEmail.toLowerCase().trim(),
          contactNumber: formData.contactNumber.replace(/\D/g, '')
        }
      });

      navigation.navigate('PartnerData');
    } catch (err) {
      console.log('Erro ao salvar dados de contato:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#E91E63" />
          </TouchableOpacity>
          <TestDataButton 
            section="companyContact" 
            onFill={(data) => setFormData(data)}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Contato da empresa</Text>
          <Text style={styles.subtitle}>
            Informe os dados de contato da sua empresa
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <TextInput
              label="E-mail"
              value={formData.businessEmail}
              onChangeText={(value) => handleChange('businessEmail', value)}
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
              keyboardType="email-address"
              autoCapitalize="none"
              error={formData.businessEmail && !isValidEmail(formData.businessEmail)}
            />

            <TextInput
              label="Telefone"
              value={formData.contactNumber}
              onChangeText={(value) => handleChange('contactNumber', value)}
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
              error={formData.contactNumber && !isValidPhone(formData.contactNumber)}
            />

            {error ? (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            ) : null}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={[styles.continueButton, !isFormValid() && styles.continueButtonDisabled]}
            labelStyle={styles.continueButtonLabel}
            loading={loading}
            disabled={loading || !isFormValid()}
          >
            {loading ? 'SALVANDO...' : 'CONTINUAR'}
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
    backgroundColor: '#FFF',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
    paddingHorizontal: 24,
  },
  form: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  inputContent: {
    backgroundColor: '#FFF',
    fontSize: 16,
    paddingHorizontal: 0,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: '#E91E63',
    height: 48,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});

export default CompanyContactScreen;
