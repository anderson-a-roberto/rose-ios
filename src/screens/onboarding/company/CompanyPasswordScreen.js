import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { supabase } from '../../../config/supabase';
import { getReadableError } from '../../../utils/errorHandler';
import CustomAlert from '../../../components/common/CustomAlert';

// Funções de formatação
const formatCNPJ = (cnpj) => cnpj.replace(/\D/g, '');

const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55')) {
    return '+55' + cleaned;
  }
  return '+' + cleaned;
};

const formatDate = (date) => {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

const formatCEP = (cep) => cep.replace(/\D/g, '');

const CompanyPasswordScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [errorType, setErrorType] = useState('generic'); // 'generic', 'celcoin', 'auth', etc.
  const [errorDetails, setErrorDetails] = useState(null);

  const handleNext = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setErrorType('validation');
      setShowAlert(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validar dados necessários
      if (!onboardingData.companyData?.documentNumber) {
        throw new Error('Dados da empresa não encontrados');
      }
      if (!onboardingData.companyContact?.businessEmail) {
        throw new Error('Email não encontrado');
      }
      if (!onboardingData.partners || onboardingData.partners.length === 0) {
        throw new Error('Nenhum sócio cadastrado');
      }

      console.log('Dados para cadastro:', {
        email: onboardingData.companyContact.businessEmail,
        cnpj: onboardingData.companyData.documentNumber,
        businessName: onboardingData.companyData.businessName,
        partners: onboardingData.partners
      });

      // Verificar se o usuário já existe e qual o status do cadastro na Celcoin
      const email = onboardingData.companyContact.businessEmail.toLowerCase().trim();
      const documentNumber = formatCNPJ(onboardingData.companyData.documentNumber);
      
      // Verificar se existe um perfil com este e-mail/documento e se o status é "failed"
      const { data: existingProfile, error: profileQueryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('document_number', documentNumber)
        .single();
      
      if (profileQueryError && profileQueryError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao verificar perfil existente:', profileQueryError);
        throw new Error(getReadableError(profileQueryError));
      }
      
      let userId;
      let isExistingUser = false;
      
      // Verificar se o perfil existe e se o status é "failed"
      if (existingProfile && existingProfile.celcoin_status === 'failed') {
        console.log('Perfil existente encontrado com status failed, atualizando dados');
        isExistingUser = true;
        userId = existingProfile.id;
        
        // Fazer login com o e-mail e senha fornecidos
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: formData.password
        });
        
        if (signInError) {
          console.error('Erro ao fazer login com usuário existente:', signInError);
          throw new Error('Senha incorreta para o usuário existente. Por favor, tente novamente ou recupere sua senha.');
        }
      } else {
        // 1. Criar conta no Supabase Auth (fluxo normal)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: formData.password,
          options: {
            data: {
              cnpj: documentNumber,
              business_name: onboardingData.companyData.businessName,
              account_type: 'PJ'
            }
          }
        });
        
        if (authError) {
          console.error('Erro ao criar conta:', authError);
          throw new Error(getReadableError(authError));
        }
        
        console.log('Conta criada com sucesso:', authData);

        if (!authData?.user?.id) {
          throw new Error('ID do usuário não encontrado após criar conta');
        }
        
        userId = authData.user.id;
      }

      // Preparar dados do perfil
      const profileData = {
        id: userId,
        document_type: 'CNPJ',
        document_number: documentNumber,
        full_name: onboardingData.companyData.businessName,
        company_type: onboardingData.companyData.companyType,
        business_name: onboardingData.companyData.businessName,
        trading_name: onboardingData.companyData.tradingName,
        business_email: email,
        contact_number: formatPhone(onboardingData.companyContact.contactNumber),
        address_postal_code: formatCEP(onboardingData.companyAddress.postalCode),
        address_street: onboardingData.companyAddress.street,
        address_number: onboardingData.companyAddress.number,
        address_complement: onboardingData.companyAddress.addressComplement || null,
        address_neighborhood: onboardingData.companyAddress.neighborhood,
        address_city: onboardingData.companyAddress.city,
        address_state: onboardingData.companyAddress.state,
        owners: onboardingData.partners.map(partner => ({
          ownerType: partner.ownerType,
          documentNumber: partner.documentNumber.replace(/\D/g, ''),
          fullName: partner.fullName,
          phoneNumber: formatPhone(partner.phoneNumber),
          email: partner.email,
          motherName: partner.motherName,
          socialName: partner.socialName,
          birthDate: formatDate(partner.birthDate),
          isPoliticallyExposedPerson: partner.isPoliticallyExposedPerson,
          address: {
            postalCode: formatCEP(partner.address.postalCode),
            street: partner.address.street,
            number: partner.address.number,
            addressComplement: partner.address.addressComplement || undefined,
            neighborhood: partner.address.neighborhood,
            city: partner.address.city,
            state: partner.address.state
          }
        }))
      };

      console.log('Dados do perfil a serem inseridos:', profileData);

      // 2. Inserir ou atualizar no profiles
      let profileOperation;
      if (isExistingUser) {
        // Atualizar perfil existente
        profileOperation = supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);
      } else {
        // Inserir novo perfil
        profileOperation = supabase
          .from('profiles')
          .insert(profileData);
      }
      
      const { error: profileError } = await profileOperation;
      
      if (profileError) {
        console.error('Erro ao salvar perfil:', profileError);
        throw new Error(getReadableError(profileError));
      }

      console.log(isExistingUser ? 'Perfil atualizado com sucesso' : 'Perfil criado com sucesso');

      // 3. Gerar código do cliente
      const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-client-code');
      
      if (codeError) {
        console.error('Erro ao gerar código:', codeError);
        throw new Error(getReadableError(codeError));
      }

      console.log('Código gerado:', codeData);

      // 4. Preparar dados para Celcoin
      const celcoinData = {
        clientCode: codeData.code,
        documentNumber: formatCNPJ(onboardingData.companyData.documentNumber),
        businessName: onboardingData.companyData.businessName,
        tradingName: onboardingData.companyData.tradingName,
        businessEmail: onboardingData.companyContact.businessEmail.toLowerCase().trim(),
        contactNumber: formatPhone(onboardingData.companyContact.contactNumber),
        companyType: onboardingData.companyData.companyType,
        address: {
          postalCode: formatCEP(onboardingData.companyAddress?.postalCode || ''),
          street: onboardingData.companyAddress?.street || '',
          number: onboardingData.companyAddress?.number || '',
          addressComplement: onboardingData.companyAddress?.addressComplement,
          neighborhood: onboardingData.companyAddress?.neighborhood || '',
          city: onboardingData.companyAddress?.city || '',
          state: onboardingData.companyAddress?.state || ''
        },
        owners: onboardingData.partners.map(partner => ({
          ownerType: partner.ownerType || 'SOCIO',
          documentNumber: partner.documentNumber.replace(/\D/g, ''),
          fullName: partner.fullName || '',
          socialName: partner.socialName,
          birthDate: formatDate(partner.birthDate || ''),
          motherName: partner.motherName || '',
          email: partner.email || '',
          phoneNumber: formatPhone(partner.phoneNumber || ''),
          isPoliticallyExposedPerson: !!partner.isPoliticallyExposedPerson,
          address: {
            postalCode: formatCEP(partner.address?.postalCode || ''),
            street: partner.address?.street || '',
            number: partner.address?.number || '',
            addressComplement: partner.address?.addressComplement,
            neighborhood: partner.address?.neighborhood || '',
            city: partner.address?.city || '',
            state: partner.address?.state || ''
          }
        }))
      };

      console.log('Dados para Celcoin:', celcoinData);

      // 5. Enviar para Celcoin
      const { data: celcoinResponse, error: celcoinError } = await supabase.functions.invoke('submit-onboarding', {
        body: celcoinData
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
        setShowAlert(true);
        return; // Interrompe a execução para não navegar para a tela de sucesso
      } else if (celcoinError) {
        console.error('Erro ao enviar para Celcoin:', celcoinError);
        setError(getReadableError(celcoinError));
        setErrorType('celcoin');
        setErrorDetails(celcoinError);
        setShowAlert(true);
        return; // Interrompe a execução para não navegar para a tela de sucesso
      }

      console.log('Dados enviados para Celcoin com sucesso');

      // 6. Navegar para sucesso - só chega aqui se não houver erros
      navigation.navigate('OnboardingSuccess');
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setError(err.message || getReadableError(err));
      setErrorType('generic');
      setErrorDetails(err);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.headerTitle}>Senha do App</Text>
            <Text style={styles.subtitle}>
              Nesta etapa, você vai precisar cadastrar uma senha de acesso ao app
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
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={formData.password}
              onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#666666"
                />
              }
              style={[styles.input, formData.password && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.password ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.password ? '600' : '400' } } }}
            />

            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              value={formData.confirmPassword}
              onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color="#666666"
                />
              }
              style={[styles.input, formData.confirmPassword && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.confirmPassword ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.confirmPassword ? '600' : '400' } } }}
            />

            {error ? (
              <CustomAlert
                visible={showAlert}
                title={errorType === 'celcoin' ? 'Erro na validação dos dados' : 
                       errorType === 'validation' ? 'Erro de validação' : 'Erro'}
                message={error}
                onDismiss={() => setShowAlert(false)}
                type="error"
                confirmText={errorType === 'celcoin' ? 'Corrigir dados' : 'OK'}
                confirmButtonColor="#E91E63"
                onConfirm={() => {
                  setShowAlert(false);
                  if (errorType === 'celcoin') {
                    // Voltar para a tela anterior para corrigir os dados
                    navigation.goBack();
                  }
                }}
                cancelText={errorType === 'celcoin' ? 'Tentar novamente' : null}
                onCancel={errorType === 'celcoin' ? () => {
                  setShowAlert(false);
                  handleNext();
                } : null}
              />
            ) : null}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={[styles.continueButton, (!formData.password || !formData.confirmPassword) && styles.disabledButton]}
            labelStyle={styles.continueButtonLabel}
            loading={loading}
            disabled={loading || !formData.password || !formData.confirmPassword}
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
  headerContent: {
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
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

export default CompanyPasswordScreen;
