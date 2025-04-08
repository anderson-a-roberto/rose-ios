import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { supabase } from '../../config/supabase';
import { getReadableError } from '../../utils/errorHandler';
import CustomAlert from '../../components/common/CustomAlert';

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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorType, setErrorType] = useState('generic'); // 'validation', 'celcoin', 'auth', 'generic'
  const [errorDetails, setErrorDetails] = useState(null);

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
        setError('Nome completo é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!personalData?.documentNumber?.trim()) {
        setError('CPF é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!personalData?.birthDate?.trim()) {
        setError('Data de nascimento é obrigatória');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!personalData?.motherName?.trim()) {
        setError('Nome da mãe é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!contactData?.phoneNumber?.trim()) {
        setError('Telefone é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!email?.trim()) {
        setError('Email é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // Garante que todos os dados do endereço estão presentes
      if (!addressData?.postalCode?.trim()) {
        setError('CEP é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!addressData?.street?.trim()) {
        setError('Rua é obrigatória');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!addressData?.number?.trim()) {
        setError('Número é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!addressData?.neighborhood?.trim()) {
        setError('Bairro é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!addressData?.city?.trim()) {
        setError('Cidade é obrigatória');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!addressData?.state?.trim()) {
        setError('Estado é obrigatório');
        setErrorType('validation');
        setShowErrorModal(true);
        setLoading(false);
        return;
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
      const { data: celcoinResponse, error: celcoinError } = await supabase.functions.invoke('submit-onboarding', {
        body: formDataWithCode
      });
      
      // Log detalhado da resposta para debug
      console.log('Resposta completa da Celcoin (estrutura):', JSON.stringify(celcoinResponse, null, 2));
      
      // Verificar se a resposta indica erro
      if (celcoinResponse && (celcoinResponse.success === false || 
          (celcoinResponse.details && celcoinResponse.details.status === "ERROR"))) {
        console.error('Erro na resposta da Celcoin:', celcoinResponse);
        let errorMessage = 'Erro no processamento do cadastro.';
        
        // Tentar extrair a mensagem de erro específica
        if (celcoinResponse.details && celcoinResponse.details.error && celcoinResponse.details.error.message) {
          errorMessage = celcoinResponse.details.error.message;
        } else if (celcoinResponse.error) {
          errorMessage = celcoinResponse.error;
        }
        
        setError(errorMessage);
        setErrorType('celcoin');
        setErrorDetails(celcoinResponse);
        setShowErrorModal(true);
        setLoading(false);
        return; // Interrompe a execução para não navegar para a tela de sucesso
      } else if (celcoinError) {
        console.error('Erro ao enviar para Celcoin:', celcoinError);
        setError(getReadableError(celcoinError));
        setErrorType('celcoin');
        setErrorDetails(celcoinError);
        setShowErrorModal(true);
        setLoading(false);
        return; // Interrompe a execução para não navegar para a tela de sucesso
      }

      console.log('Dados enviados para Celcoin com sucesso');

      // 6. Se tudo der certo, navega para sucesso - só chega aqui se não houver erros
      navigation.replace('OnboardingSuccess');

    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      // Extrair a mensagem de erro específica
      let errorMessage = getReadableError(error);
      
      // Se a mensagem contiver "Error:", extrair apenas a parte após isso
      if (errorMessage.includes('Error:')) {
        errorMessage = errorMessage.split('Error:')[1].trim();
      }
      
      setError(errorMessage);
      
      // Determinar o tipo de erro com base na mensagem
      if (errorMessage.includes('obrigatório') || 
          errorMessage.includes('inválido') || 
          errorMessage.includes('formato')) {
        setErrorType('validation');
      } else {
        setErrorType('generic');
      }
      
      setErrorDetails(error);
      setShowErrorModal(true);
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
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>E-mail</Text>
            <Text style={styles.subtitle}>
              Informe o endereço de e-mail
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
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[styles.input, email && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={email ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: email ? '600' : '400' } } }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!error}
              disabled={loading}
            />

            {error ? (
              <Text style={styles.errorText}>
                {error}
              </Text>
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
      <CustomAlert
        visible={showErrorModal}
        title={errorType === 'celcoin' ? 'Erro na validação dos dados' : 
               errorType === 'validation' ? 'Erro de validação' : 'Erro'}
        message={error}
        onDismiss={() => setShowErrorModal(false)}
        type="error"
        confirmText={errorType === 'celcoin' ? 'Corrigir dados' : 'OK'}
        confirmButtonColor="#E91E63"
        textColor="#FFFFFF"
        onConfirm={() => {
          setShowErrorModal(false);
          if (errorType === 'celcoin') {
            // Voltar para a tela anterior para corrigir os dados
            navigation.goBack();
          }
        }}
        cancelText={errorType === 'celcoin' ? 'Tentar novamente' : null}
        onCancel={errorType === 'celcoin' ? () => {
          setShowErrorModal(false);
          handleSubmit();
        } : null}
      />
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
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: 16,
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

export default EmailScreen;
