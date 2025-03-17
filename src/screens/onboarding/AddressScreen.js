import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Meu Endereço</Text>
            <Text style={styles.subtitle}>
              Falta pouco! Agora precisaremos das informações do seu endereço
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.form}>
            <Text style={styles.label}>CEP</Text>
            <TextInput
              value={formData.postalCode}
              onChangeText={(value) => handleChange('postalCode', value)}
              style={[styles.input, formData.postalCode && styles.filledInput]}
              keyboardType="numeric"
              maxLength={9}
              placeholder="00000-000"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.postalCode ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.postalCode ? '600' : '400' } } }}
            />

            <Text style={styles.label}>Cidade</Text>
            <TextInput
              value={formData.city}
              onChangeText={(value) => handleChange('city', value)}
              style={[styles.input, styles.disabledInput, formData.city && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.city ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.city ? '600' : '400' } } }}
            />

            <Text style={styles.label}>Estado</Text>
            <TextInput
              value={formData.state}
              onChangeText={(value) => handleChange('state', value)}
              style={[styles.input, styles.disabledInput, formData.state && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.state ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.state ? '600' : '400' } } }}
            />

            <Text style={styles.label}>Endereço</Text>
            <TextInput
              value={formData.street}
              onChangeText={(value) => handleChange('street', value)}
              style={[styles.input, formData.street && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.street ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.street ? '600' : '400' } } }}
            />

            <Text style={styles.label}>Número</Text>
            <TextInput
              value={formData.number}
              onChangeText={(value) => handleChange('number', value)}
              style={[styles.input, formData.number && styles.filledInput]}
              keyboardType="numeric"
              disabled={formData.noNumber}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.number ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.number ? '600' : '400' } } }}
            />
            <View style={styles.switchContainer}>
              <Switch
                value={formData.noNumber}
                onValueChange={handleNoNumber}
                color="#E91E63"
              />
              <Text style={styles.switchLabel}>SEM NÚMERO</Text>
            </View>

            <Text style={styles.label}>Bairro</Text>
            <TextInput
              value={formData.neighborhood}
              onChangeText={(value) => handleChange('neighborhood', value)}
              style={[styles.input, formData.neighborhood && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.neighborhood ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.neighborhood ? '600' : '400' } } }}
            />

            <Text style={styles.label}>Complemento</Text>
            <TextInput
              value={formData.complement}
              onChangeText={(value) => handleChange('complement', value)}
              style={[styles.input, formData.complement && styles.filledInput]}
              placeholder="Opcional"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.complement ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.complement ? '600' : '400' } } }}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.continueButton}
            labelStyle={styles.continueButtonLabel}
            disabled={!isFormValid()}
          >
            Continuar
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
    minHeight: '100%',
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
  content: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
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
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
