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
      
      // Verificar se já existe um perfil com este documento e status "failed"
      console.log('Verificando se existe perfil com status failed...');
      const formattedDocumentNumber = formatCPF(personalData.documentNumber);
      const { data: existingProfile, error: profileQueryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('document_number', formattedDocumentNumber)
        .single();
      
      let existingUserId = null;
      let isRetry = false;
      
      if (!profileQueryError && existingProfile) {
        console.log('Perfil encontrado:', existingProfile);
        console.log('Status do perfil:', existingProfile.celcoin_status);
        
        // Se o perfil existe e tem status failed, vamos reutilizá-lo
        if (existingProfile.celcoin_status === 'failed') {
          console.log('Perfil tem status failed, reutilizando para retry');
          existingUserId = existingProfile.id;
          isRetry = true;
        } else {
          console.log('Perfil existe mas não tem status failed');
        }
      } else {
        console.log('Perfil não encontrado ou erro na consulta:', profileQueryError);
      }
      
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

      let userId;
      
      // Se for um retry (perfil com status failed existe), usamos o perfil existente
      if (isRetry && existingUserId) {
        console.log('Usando perfil existente para retry, ID:', existingUserId);
        userId = existingUserId;
        
        // Atualizar os dados do perfil existente
        const { error: updateError } = await supabase.from('profiles').update({
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
          address_state: onboardingData.addressData.state,
          // Não alteramos o celcoin_status aqui, isso será feito pela edge function
        }).eq('id', existingUserId);
        
        if (updateError) throw new Error('Erro ao atualizar perfil: ' + updateError.message);
        console.log('Perfil atualizado com sucesso para retry');
        
      } else {
        // Fluxo normal - criar nova conta
        console.log('Criando nova conta e perfil');
        
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
        
        userId = authData.user.id;
        
        // 2. Inserir no profiles
        const { error: profileError } = await supabase.from('profiles').insert({
          id: userId,
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
      }

      // 3. Gerar código do cliente (ou reutilizar se for retry)
      let clientCode;
      
      if (isRetry && existingProfile && existingProfile.client_code) {
        // Reutilizar o código do cliente existente
        console.log('Reutilizando código do cliente existente:', existingProfile.client_code);
        clientCode = existingProfile.client_code;
      } else {
        // Gerar novo código do cliente
        console.log('Gerando novo código do cliente');
        const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-client-code');
        if (codeError) throw new Error('Erro ao gerar código: ' + codeError.message);
        clientCode = codeData.code;
        
        // Se for retry mas não tinha código, atualizar o perfil com o novo código
        if (isRetry && existingUserId) {
          const { error: updateCodeError } = await supabase.from('profiles').update({
            client_code: clientCode
          }).eq('id', existingUserId);
          
          if (updateCodeError) console.error('Erro ao atualizar código do cliente:', updateCodeError);
        }
      }

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
        clientCode: clientCode,
        isRetry: isRetry // Adicionamos esta flag para informar à edge function que é um retry
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
          <Text style={styles.headerTitle}>E-mail</Text>
          <Text style={styles.subtitle}>
            Informe seu e-mail para finalizar o cadastro
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
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.input, email && styles.filledInput]}
                keyboardType="email-address"
                autoCapitalize="none"
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
                error={!!error}
                disabled={loading}
              />

              {error ? (
                <Text style={styles.errorText}>
                  {error}
                </Text>
              ) : null}
              
              {/* Espaço extra no final para garantir que o último campo seja visível acima do botão */}
              <View style={styles.bottomPadding} />
            </View>
          </ScrollView>

          {/* Botão de finalizar - sempre visível */}
          <View style={styles.buttonContainer}>
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
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
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

export default EmailScreen;
