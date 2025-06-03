import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCEP = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const CompanyAddressScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { companyAddress } = onboardingData;

  const [formData, setFormData] = useState({
    postalCode: companyAddress?.postalCode || '',
    street: companyAddress?.street || '',
    number: companyAddress?.number || '',
    complement: companyAddress?.complement || '',
    neighborhood: companyAddress?.neighborhood || '',
    city: companyAddress?.city || '',
    state: companyAddress?.state || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'postalCode') {
      formattedValue = formatCEP(value);
      if (value.replace(/\D/g, '').length === 8) {
        fetchAddress(value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const fetchAddress = async (cep) => {
    setLoading(true);
    try {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    updateOnboardingData({
      companyAddress: {
        ...formData,
        postalCode: formData.postalCode.replace(/\D/g, '')
      }
    });
    navigation.navigate('CompanyContact');
  };

  const isFormValid = () => {
    return (
      formData.postalCode &&
      formData.street &&
      formData.number &&
      formData.neighborhood &&
      formData.city &&
      formData.state
    );
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
          <Text style={styles.headerTitle}>Endereço da empresa</Text>
          <Text style={styles.subtitle}>
            Informe o endereço da sede da sua empresa
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
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
              {/* Form */}
              <View style={styles.form}>
                <Text style={styles.label}>CEP</Text>
                <TextInput
                  value={formData.postalCode}
                  onChangeText={(value) => handleChange('postalCode', value)}
                  style={[styles.input, formData.postalCode && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  keyboardType="numeric"
                  maxLength={9}
                  placeholder="00000-000"
                  disabled={loading}
                />

                <Text style={styles.label}>Endereço</Text>
                <TextInput
                  value={formData.street}
                  onChangeText={(value) => handleChange('street', value)}
                  style={[styles.input, formData.street && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  disabled={loading}
                />

                <Text style={styles.label}>Número</Text>
                <TextInput
                  value={formData.number}
                  onChangeText={(value) => handleChange('number', value)}
                  style={[styles.input, formData.number && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  keyboardType="numeric"
                  disabled={loading}
                />

                <Text style={styles.label}>Complemento</Text>
                <TextInput
                  value={formData.complement}
                  onChangeText={(value) => handleChange('complement', value)}
                  style={[styles.input, formData.complement && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  placeholder="Opcional"
                  disabled={loading}
                />

                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  value={formData.neighborhood}
                  onChangeText={(value) => handleChange('neighborhood', value)}
                  style={[styles.input, formData.neighborhood && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  disabled={loading}
                />

                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  value={formData.city}
                  onChangeText={(value) => handleChange('city', value)}
                  style={[styles.input, formData.city && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  disabled={loading}
                />

                <Text style={styles.label}>Estado</Text>
                <TextInput
                  value={formData.state}
                  onChangeText={(value) => handleChange('state', value)}
                  style={[styles.input, formData.state && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="#E91E63"
                  selectionColor="#E91E63"
                  cursorColor="#E91E63"
                  caretHidden={false}
                  disabled={loading}
                />
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
  // ScrollView que contém o formulário
  scrollView: {
    flex: 1,
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
});

export default CompanyAddressScreen;
