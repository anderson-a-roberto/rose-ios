import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
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
        email: email.toLowerCase().trim(),
        password: onboardingData.securityData.password,
        options: {
          data: {
            cpf: formatCPF(onboardingData.personalData.documentNumber),
            full_name: onboardingData.personalData.fullName,
            account_type: 'PF'
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TestDataButton 
          section="contactData" 
          onFill={(data) => setEmail(data.email)}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>E-mail</Text>
            <Text style={styles.subtitle}>
              Informe o endereço de e-mail
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <TextInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
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
              error={!!error}
              disabled={loading}
            />

            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
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
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#FFF',
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
  },
  form: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
  },
  continueButton: {
    borderRadius: 4,
    backgroundColor: '#E91E63',
    height: 48,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

export default EmailScreen;
