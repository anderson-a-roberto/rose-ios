import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';
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
  if (!date) return null;
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

  // Verifica se tem os dados necessários ao carregar a tela
  React.useEffect(() => {
    const checkRequiredData = () => {
      if (!onboardingData.personalData?.fullName?.trim()) {
        navigation.navigate('OnboardingPersonalData');
      }
    };
    checkRequiredData();
  }, [onboardingData.personalData?.fullName, navigation]);

  // DEBUG: Vamos ver o que tem nos dados quando a tela carrega
  console.log('EmailScreen - onboardingData:', JSON.stringify(onboardingData, null, 2));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      // DEBUG: Vamos ver o que tem nos dados quando tenta submeter
      console.log('EmailScreen handleSubmit - onboardingData:', JSON.stringify(onboardingData, null, 2));

      // Validações antes de prosseguir
      const { personalData, contactData, addressData } = onboardingData;
      
      if (!personalData?.fullName?.trim()) {
        throw new Error('Nome completo é obrigatório');
      }
      if (!personalData?.documentNumber?.trim()) {
        throw new Error('CPF é obrigatório');
      }
      if (!personalData?.birthDate?.trim()) {
        throw new Error('Data de nascimento é obrigatória');
      }
      if (!personalData?.motherName?.trim()) {
        throw new Error('Nome da mãe é obrigatório');
      }
      if (!contactData?.phoneNumber?.trim()) {
        throw new Error('Telefone é obrigatório');
      }
      if (!email?.trim()) {
        throw new Error('Email é obrigatório');
      }

      // Garante que todos os dados do endereço estão presentes
      if (!addressData?.postalCode?.trim()) {
        throw new Error('CEP é obrigatório');
      }
      if (!addressData?.street?.trim()) {
        throw new Error('Rua é obrigatória');
      }
      if (!addressData?.number?.trim()) {
        throw new Error('Número é obrigatório');
      }
      if (!addressData?.neighborhood?.trim()) {
        throw new Error('Bairro é obrigatório');
      }
      if (!addressData?.city?.trim()) {
        throw new Error('Cidade é obrigatória');
      }
      if (!addressData?.state?.trim()) {
        throw new Error('Estado é obrigatório');
      }

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
            full_name: onboardingData.personalData.fullName.trim(),
            account_type: 'PF'
          }
        }
      });
      if (authError) throw new Error('Erro ao criar conta: ' + authError.message);

      // 2. Inserir no profiles
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        document_number: formatCPF(onboardingData.personalData.documentNumber),
        full_name: onboardingData.personalData.fullName.trim(),
        birth_date: formatDate(onboardingData.personalData.birthDate),
        mother_name: onboardingData.personalData.motherName.trim(),
        email: email.toLowerCase().trim(),
        phone_number: formatPhone(onboardingData.contactData.phoneNumber),
        is_politically_exposed_person: onboardingData.pepInfo.isPoliticallyExposedPerson,
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
        fullName: onboardingData.personalData.fullName.trim(),
        socialName: onboardingData.personalData.fullName.trim(),
        documentNumber: formatCPF(onboardingData.personalData.documentNumber),
        birthDate: formatDate(onboardingData.personalData.birthDate),
        motherName: onboardingData.personalData.motherName.trim(),
        email: email.toLowerCase().trim(),
        phoneNumber: formatPhone(onboardingData.contactData.phoneNumber),
        isPoliticallyExposedPerson: onboardingData.pepInfo.isPoliticallyExposedPerson,
        address: {
          postalCode: formatCEP(onboardingData.addressData.postalCode),
          street: onboardingData.addressData.street.trim(),
          number: onboardingData.addressData.number.trim(),
          addressComplement: onboardingData.addressData.complement?.trim(),
          neighborhood: onboardingData.addressData.neighborhood.trim(),
          city: onboardingData.addressData.city.trim(),
          state: onboardingData.addressData.state.trim()
        },
        clientCode: codeData.code
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
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>E-mail</Text>
          <Text style={styles.subtitle}>
            Informe o endereço de e-mail
          </Text>
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
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
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
    borderRadius: 4,
    backgroundColor: '#E91E63',
    paddingVertical: 8,
    height: 48,
    justifyContent: 'center',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default EmailScreen;
