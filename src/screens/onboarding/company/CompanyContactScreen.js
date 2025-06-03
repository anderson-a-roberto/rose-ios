import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../config/supabase';

// Funções de formatação
const formatPhone = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (!numbers) return '';
  
  // Remove o prefixo internacional se existir
  const phoneNumber = numbers.startsWith('55') ? numbers.slice(2) : numbers;
  
  if (phoneNumber.length <= 11) {
    return phoneNumber.replace(
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Contato da empresa</Text>
          <Text style={styles.subtitle}>
            Informe os dados de contato da sua empresa
          </Text>
        </View>
      </View>

      {/* Wrapper para o KeyboardAvoidingView */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Container principal que envolve o ScrollView e o botão */}
        <View style={styles.mainContainer}>
          {/* ScrollView com o formulário */}
          <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.form}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  value={formData.businessEmail}
                  onChangeText={(value) => handleChange('businessEmail', value)}
                  style={[styles.input, formData.businessEmail && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={formData.businessEmail && !isValidEmail(formData.businessEmail)}
                />

                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  value={formData.contactNumber}
                  onChangeText={(value) => handleChange('contactNumber', value)}
                  style={[styles.input, formData.contactNumber && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  keyboardType="numeric"
                  maxLength={15}
                  error={formData.contactNumber && !isValidPhone(formData.contactNumber)}
                />

                {error ? (
                  <Text style={styles.error}>{error}</Text>
                ) : null}
              </View>
            </ScrollView>
            
            {/* Botão de continuar - sempre visível */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleNext}
                style={[styles.continueButton, !isFormValid() && styles.disabledButton]}
                labelStyle={styles.continueButtonLabel}
                loading={loading}
                disabled={loading || !isFormValid()}
              >
                {loading ? 'SALVANDO...' : 'CONTINUAR'}
              </Button>
            </View>
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
  // Container principal para o KeyboardAvoidingView
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Container que envolve o ScrollView e o botão
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
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
  headerContent: {
    paddingHorizontal: 24,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  form: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    fontSize: 16,
    height: 48,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
  },
  filledInput: {
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
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
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  error: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 8,
    marginBottom: 8,
  },
});

export default CompanyContactScreen;
