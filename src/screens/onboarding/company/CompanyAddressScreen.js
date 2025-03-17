import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.headerTitle}>Endereço da empresa</Text>
          <Text style={styles.subtitle}>
            Informe o endereço da sede da sua empresa
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>CEP</Text>
          <TextInput
            value={formData.postalCode}
            onChangeText={(value) => handleChange('postalCode', value)}
            style={[styles.input, formData.postalCode && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.postalCode ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.postalCode ? '600' : '400' } } }}
            keyboardType="numeric"
            maxLength={9}
          />

          <Text style={styles.label}>Rua/Avenida</Text>
          <TextInput
            value={formData.street}
            onChangeText={(value) => handleChange('street', value)}
            style={[styles.input, formData.street && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.street ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.street ? '600' : '400' } } }}
            disabled={loading}
            right={loading ? <TextInput.Icon icon={() => <ActivityIndicator color="#E91E63" />} /> : null}
          />

          <Text style={styles.label}>Número</Text>
          <TextInput
            value={formData.number}
            onChangeText={(value) => handleChange('number', value)}
            style={[styles.input, formData.number && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.number ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.number ? '600' : '400' } } }}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Complemento (opcional)</Text>
          <TextInput
            value={formData.complement}
            onChangeText={(value) => handleChange('complement', value)}
            style={[styles.input, formData.complement && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.complement ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.complement ? '600' : '400' } } }}
          />

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            value={formData.neighborhood}
            onChangeText={(value) => handleChange('neighborhood', value)}
            style={[styles.input, formData.neighborhood && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.neighborhood ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.neighborhood ? '600' : '400' } } }}
            disabled={loading}
          />

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            value={formData.city}
            onChangeText={(value) => handleChange('city', value)}
            style={[styles.input, formData.city && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.city ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.city ? '600' : '400' } } }}
            disabled={loading}
          />

          <Text style={styles.label}>Estado</Text>
          <TextInput
            value={formData.state}
            onChangeText={(value) => handleChange('state', value)}
            style={[styles.input, formData.state && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.state ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.state ? '600' : '400' } } }}
            disabled={loading}
          />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
});

export default CompanyAddressScreen;
