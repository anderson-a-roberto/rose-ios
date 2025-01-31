import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';
import TestDataButton from '../../components/TestDataButton';
import { supabase } from '../../config/supabase';

// Funções de formatação
const formatCPF = (cpf) => cpf.replace(/\D/g, '');

const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55')) {
    return '+55' + cleaned;
  }
  return '+' + cleaned;
};

const formatDate = (date) => {
  // Converte de DD/MM/YYYY para YYYY-MM-DD
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

const formatCEP = (cep) => cep.replace(/\D/g, '');

const EmailScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [email, setEmail] = useState(onboardingData.contactData.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      // Atualizar dados do email antes de enviar
      updateOnboardingData({
        contactData: {
          ...onboardingData.contactData,
          email: email.toLowerCase().trim()
        }
      });

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formatCPF(onboardingData.personalData.documentNumber) + '@temp.com',
        password: onboardingData.securityData.password,
        options: {
          data: {
            cpf: formatCPF(onboardingData.personalData.documentNumber),
            full_name: onboardingData.personalData.fullName
          }
        }
      });
      if (authError) throw new Error('Erro ao criar conta: ' + authError.message);

      // 2. Inserir no profiles
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        document_number: formatCPF(onboardingData.personalData.documentNumber),
        full_name: onboardingData.personalData.fullName,
        birth_date: formatDate(onboardingData.personalData.birthDate),
        mother_name: onboardingData.personalData.motherName,
        email: email.toLowerCase().trim(),
        phone_number: formatPhone(onboardingData.contactData.phoneNumber),
        is_politically_exposed_person: onboardingData.personalData.isPep,
        address_postal_code: formatCEP(onboardingData.addressData.postalCode),
        address_street: onboardingData.addressData.street,
        address_number: onboardingData.addressData.number,
        address_complement: onboardingData.addressData.complement || null,
        address_neighborhood: onboardingData.addressData.neighborhood,
        address_city: onboardingData.addressData.city,
        address_state: onboardingData.addressData.state
      });
      if (profileError) throw new Error('Erro ao salvar perfil: ' + profileError.message);

      // 3. Gerar código do cliente
      const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-client-code');
      if (codeError) throw new Error('Erro ao gerar código: ' + codeError.message);

      // 4. Preparar dados no mesmo formato do fluxo antigo
      const formDataWithCode = {
        fullName: onboardingData.personalData.fullName,
        documentNumber: formatCPF(onboardingData.personalData.documentNumber),
        birthDate: formatDate(onboardingData.personalData.birthDate),
        motherName: onboardingData.personalData.motherName,
        email: email.toLowerCase().trim(),
        phoneNumber: formatPhone(onboardingData.contactData.phoneNumber),
        isPoliticallyExposedPerson: onboardingData.personalData.isPep,
        address: {
          postalCode: formatCEP(onboardingData.addressData.postalCode),
          street: onboardingData.addressData.street,
          number: onboardingData.addressData.number,
          addressComplement: onboardingData.addressData.complement || undefined,
          neighborhood: onboardingData.addressData.neighborhood,
          city: onboardingData.addressData.city,
          state: onboardingData.addressData.state
        },
        clientCode: codeData.code,
        userId: authData.user.id
      };

      // 5. Enviar para Celcoin com todos os dados
      const { error: celcoinError } = await supabase.functions.invoke('submit-onboarding', {
        body: formDataWithCode
      });
      if (celcoinError) throw new Error('Erro ao enviar para Celcoin: ' + celcoinError.message);

      // 6. Se tudo der certo, navega para sucesso
      navigation.replace('OnboardingSuccess');

    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TestDataButton 
        section="contactData" 
        onFill={(data) => setEmail(data.email)}
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

      <Text style={styles.title}>E-mail</Text>
      <Text style={styles.subtitle}>
        Informe o endereço de e-mail
      </Text>

      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!error}
        disabled={loading}
      />

      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.continueButton}
        labelStyle={styles.continueButtonLabel}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          'FINALIZAR CADASTRO'
        )}
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
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 24,
    borderRadius: 25,
    height: 48,
    justifyContent: 'center',
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default EmailScreen;
