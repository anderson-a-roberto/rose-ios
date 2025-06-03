import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button, Switch } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';

const formatCEP = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const AddressScreen = ({ navigation, route }) => {
  console.log('[AddressScreen] Inicializando tela de Endereço');
  console.log('[AddressScreen] Parâmetros recebidos:', route.params);
  
  const { onboardingData, updateOnboardingData } = useOnboarding();
  console.log('[AddressScreen] Estado inicial do onboardingData:', JSON.stringify(onboardingData));
  
  const { addressData } = onboardingData;

  // Verifica se recebeu parâmetros da tela anterior
  React.useEffect(() => {
    console.log('[AddressScreen] useEffect executado');
    // Se recebeu o parâmetro isPep da tela anterior, atualiza o contexto
    if (route.params?.isPep !== undefined) {
      console.log('[AddressScreen] Recebeu isPep via params:', route.params.isPep);
      
      // Não precisamos mais atualizar o contexto aqui, pois isso já foi feito na tela PersonalDataScreen
      console.log('[AddressScreen] Contexto já atualizado na tela anterior');
    } else {
      console.log('[AddressScreen] Não recebeu parâmetro isPep');
    }
  }, []);

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
    }
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

  const isFormValid = () => {
    return (
      formData.postalCode &&
      formData.street &&
      (formData.number || formData.noNumber) &&
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
          <Text style={styles.headerTitle}>Endereço</Text>
          <Text style={styles.subtitle}>
            Informe seu endereço residencial
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
            <View style={styles.form}>
              {/* CEP */}
              <Text style={styles.label}>CEP</Text>
              <TextInput
                value={formData.postalCode}
                onChangeText={(value) => handleChange('postalCode', value)}
                keyboardType="numeric"
                maxLength={9}
                style={[styles.input, formData.postalCode && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />

              {/* Rua/Avenida */}
              <Text style={styles.label}>Rua/Avenida</Text>
              <TextInput
                value={formData.street}
                onChangeText={(value) => handleChange('street', value)}
                style={[styles.input, formData.street && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />

              {/* Número */}
              <Text style={styles.label}>Número</Text>
              <TextInput
                value={formData.number}
                onChangeText={(value) => handleChange('number', value)}
                keyboardType="numeric"
                style={[styles.input, formData.number && styles.filledInput]}
                editable={!formData.noNumber}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />
              <View style={styles.switchContainer}>
                <Switch
                  value={formData.noNumber}
                  onValueChange={handleNoNumber}
                  color="#E91E63"
                />
                <Text style={styles.switchLabel}>Sem número</Text>
              </View>

              {/* Cidade */}
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
              />

              {/* Estado */}
              <Text style={styles.label}>Estado</Text>
              <TextInput
                value={formData.state}
                onChangeText={(value) => handleChange('state', value)}
                maxLength={2}
                style={[styles.input, formData.state && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />

              {/* Bairro */}
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
              />

              <Text style={styles.label}>Complemento</Text>
              <TextInput
                value={formData.complement}
                onChangeText={(value) => handleChange('complement', value)}
                style={[styles.input, formData.complement && styles.filledInput]}
                placeholder="Opcional"
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />
              
              {/* Espaço extra no final para garantir que o último campo seja visível acima do botão */}
              <View style={styles.bottomPadding} />
            </View>
          </ScrollView>

          {/* Botão de continuar - sempre visível */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.continueButton}
              labelStyle={styles.continueButtonLabel}
              disabled={!isFormValid()}
            >
              CONTINUAR
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    zIndex: 10,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  scrollContent: {
    paddingBottom: 24,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 8,
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
    ...(Platform.OS === 'ios' && {
      height: 56, // Altura fixa para iOS
      paddingVertical: 8, // Adicionar padding vertical para melhorar a visibilidade do cursor
    }),
  },
  filledInput: {
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    opacity: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  // Espaço extra no final do formulário para garantir que o último campo fique visível acima do botão
  bottomPadding: {
    height: 100,
  },
  // Container do botão - sempre visível na parte inferior
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
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});

export default AddressScreen;
