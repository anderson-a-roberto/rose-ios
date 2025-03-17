import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={formData.businessEmail}
              onChangeText={(value) => handleChange('businessEmail', value)}
              style={[styles.input, formData.businessEmail && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.businessEmail ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.businessEmail ? '600' : '400' } } }}
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
              activeUnderlineColor="transparent"
              textColor={formData.contactNumber ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.contactNumber ? '600' : '400' } } }}
              keyboardType="numeric"
              maxLength={15}
              error={formData.contactNumber && !isValidPhone(formData.contactNumber)}
            />

            {error ? (
              <Text style={styles.error}>{error}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    gap: 16,
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
  },
  filledInput: {
    backgroundColor: '#FFF',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  error: {
    fontSize: 12,
    color: '#FF0000',
    marginBottom: 8,
  },
});

export default CompanyContactScreen;
