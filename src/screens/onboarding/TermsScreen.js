import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Text, Checkbox, Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TERMS_TEXT } from '../../constants/terms';
import { supabase } from '../../config/supabase';
import { useInviteCodes } from '../../hooks/useInviteCodes';
import { useOnboardingAuditMobile } from '../../hooks/useOnboardingAuditMobile';
import CustomAlert from '../../components/common/CustomAlert';

export default function TermsScreen({ route }) {
  const navigation = useNavigation();
  const { onboardingData, setTermsAccepted, updateOnboardingData } = useOnboarding();
  const { recordOnboardingAttempt } = useOnboardingAuditMobile();
  const [accepted, setAccepted] = useState(false);
  
  // Estados para o fluxo de código de convite
  const [needsInviteCode, setNeedsInviteCode] = useState(false);
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  
  // Hook para validação de código de convite
  const { validateInviteCode, isLoading: isValidatingCode } = useInviteCodes();
  
  // Receber parâmetros diretamente da rota
  const { documentNumber, accountType, validated } = route.params || {};
  
  // Atualizar o contexto com os dados da rota ao montar o componente
  useEffect(() => {
    if (documentNumber && accountType) {
      console.log('TermsScreen: Atualizando contexto com dados da rota', { documentNumber, accountType, validated });
      updateOnboardingData({
        accountType,
        ...(accountType === 'PF' 
          ? { personalData: { documentNumber } }
          : { companyData: { documentNumber } }
        ),
      });
      
      // Se não foi validado, verificar se precisa de código de convite
      if (!validated) {
        checkIfNeedsInviteCode(documentNumber);
      }
    }
  }, [documentNumber, accountType]);
  
  // Função para verificar se o usuário precisa de código de convite
  const checkIfNeedsInviteCode = async (docNumber) => {
    const startTime = Date.now();
    let attemptId = null;
    
    try {
      setCheckingKyc(true);
      
      // Registrar tentativa de verificação de necessidade de código
      try {
        console.log('[TermsScreen] Preparando registro de verificação de necessidade de código');
        const attemptData = {
          document_number: docNumber,
          document_type: accountType === 'PF' ? 'CPF' : 'CNPJ',
          attempt_type: accountType,
          form_step: 'check_invite_code_requirement'
        };
        
        console.log('[TermsScreen] Dados para registro:', JSON.stringify(attemptData));
        const result = await recordOnboardingAttempt(attemptData);
        console.log('[TermsScreen] Resultado do registro:', JSON.stringify(result));
        
        if (result.success && result.data?.id) {
          attemptId = result.data.id;
          console.log('[TermsScreen] ID do registro obtido:', attemptId);
        } else {
          console.warn('[TermsScreen] Registro criado sem ID ou com falha');
        }
      } catch (auditError) {
        console.error('[TermsScreen] Erro ao registrar tentativa de verificação de código:', auditError);
      }
      
      // Verificar se já existe proposta KYC para o documento
      const { data: kycProposal } = await supabase
        .from('kyc_proposals_v2')
        .select('*')
        .eq('document_number', docNumber)
        .maybeSingle();
      
      // Se não existir proposta, o usuário precisa de código de convite
      const needsCode = !kycProposal;
      setNeedsInviteCode(needsCode);
      console.log('Verificando necessidade de código de convite:', { docNumber, needsInviteCode: needsCode });
      
      // Atualizar o registro com o resultado
      if (attemptId) {
        await recordOnboardingAttempt({
          id: attemptId,
          success: true,
          needs_invite_code: needsCode,
          processing_time_ms: Date.now() - startTime
        });
      }
    } catch (error) {
      console.error('Erro ao verificar proposta KYC:', error);
      // Em caso de erro, assumir que precisa de código para segurança
      setNeedsInviteCode(true);
      
      // Atualizar o registro com o erro
      if (attemptId) {
        await recordOnboardingAttempt({
          id: attemptId,
          success: false,
          error_type: 'KYC_CHECK_ERROR',
          error_message: error.message || 'Erro ao verificar proposta KYC',
          needs_invite_code: true, // Por segurança, assumimos que precisa
          processing_time_ms: Date.now() - startTime
        });
      }
    } finally {
      setCheckingKyc(false);
    }
  };
  
  // Função para validar o código de convite
  const handleValidateCode = async () => {
    const startTime = Date.now();
    let attemptId = null;
    
    try {
      // 1. Registrar tentativa inicial de validação de código
      try {
        console.log('[TermsScreen] Preparando registro de validação de código');
        const attemptData = {
          document_number: documentNumber,
          document_type: accountType === 'PF' ? 'CPF' : 'CNPJ',
          attempt_type: accountType,
          form_step: 'invite_code_validation',
          invite_code: inviteCode.trim()
        };
        
        console.log('[TermsScreen] Dados para registro de validação:', JSON.stringify(attemptData));
        const result = await recordOnboardingAttempt(attemptData);
        console.log('[TermsScreen] Resultado do registro de validação:', JSON.stringify(result));
        
        if (result.success && result.data?.id) {
          attemptId = result.data.id;
          console.log('[TermsScreen] ID do registro de validação obtido:', attemptId);
        } else {
          console.warn('[TermsScreen] Registro de validação criado sem ID ou com falha');
        }
      } catch (auditError) {
        console.error('[TermsScreen] Erro ao registrar tentativa de validação de código:', auditError);
      }
      
      // 2. Validar o código
      if (!inviteCode.trim()) {
        // Atualizar o registro com o erro
        if (attemptId) {
          await recordOnboardingAttempt({
            id: attemptId,
            success: false,
            error_type: 'EMPTY_CODE',
            error_message: 'Código de convite vazio',
            processing_time_ms: Date.now() - startTime
          });
        }
        
        setAlertConfig({
          title: 'Código Inválido',
          message: 'Por favor, digite um código de convite.',
          type: 'error'
        });
        setAlertVisible(true);
        return;
      }
      
      const result = await validateInviteCode(inviteCode.trim(), documentNumber);
      
      // 3. Atualizar o registro com o resultado
      if (attemptId) {
        await recordOnboardingAttempt({
          id: attemptId,
          success: result.success,
          error_type: result.success ? null : 'INVALID_CODE',
          error_message: result.success ? null : (result.message || 'Código de convite inválido'),
          processing_time_ms: Date.now() - startTime
        });
      }
      
      if (result.success) {
        // Código válido, não precisa mais de código
        setNeedsInviteCode(false);
      } else {
        // Mostrar erro
        setAlertConfig({
          title: 'Erro na Validação',
          message: result.message || 'Código de convite inválido.',
          type: 'error'
        });
        setAlertVisible(true);
      }
    } catch (error) {
      console.error('Erro ao validar código:', error);
      
      // Atualizar o registro com o erro
      if (attemptId) {
        await recordOnboardingAttempt({
          id: attemptId,
          success: false,
          error_type: 'EXCEPTION',
          error_message: error.message || 'Ocorreu um erro ao validar o código de convite',
          processing_time_ms: Date.now() - startTime
        });
      }
      
      setAlertConfig({
        title: 'Erro',
        message: error.message || 'Ocorreu um erro ao validar o código de convite.',
        type: 'error'
      });
      setAlertVisible(true);
    }
  };

  const handleAcceptTerms = async () => {
    const startTime = Date.now();
    let attemptId = null;
    
    try {
      // 1. Registrar tentativa de aceitação dos termos
      try {
        console.log('[TermsScreen] Preparando registro de aceitação dos termos');
        const attemptData = {
          document_number: documentNumber,
          document_type: accountType === 'PF' ? 'CPF' : 'CNPJ',
          attempt_type: accountType,
          form_step: 'terms_acceptance'
        };
        
        console.log('[TermsScreen] Dados para registro de aceitação:', JSON.stringify(attemptData));
        const result = await recordOnboardingAttempt(attemptData);
        console.log('[TermsScreen] Resultado do registro de aceitação:', JSON.stringify(result));
        
        if (result.success && result.data?.id) {
          attemptId = result.data.id;
          console.log('[TermsScreen] ID do registro de aceitação obtido:', attemptId);
        } else {
          console.warn('[TermsScreen] Registro de aceitação criado sem ID ou com falha');
        }
      } catch (auditError) {
        console.error('[TermsScreen] Erro ao registrar tentativa de aceitação dos termos:', auditError);
      }
      
      // 2. Verificar se precisa de código de convite
      if (needsInviteCode) {
        // Atualizar o registro com o erro
        if (attemptId) {
          await recordOnboardingAttempt({
            id: attemptId,
            success: false,
            error_type: 'INVITE_CODE_REQUIRED',
            error_message: 'Código de convite necessário para continuar',
            processing_time_ms: Date.now() - startTime
          });
        }
        
        setAlertConfig({
          title: 'Código de Convite Necessário',
          message: 'Por favor, insira um código de convite válido para continuar.',
          type: 'warning'
        });
        setAlertVisible(true);
        return;
      }

      // 3. Atualizar contexto e navegar para a próxima tela
      setTermsAccepted(true);
      
      // Usar accountType da rota se disponível, senão usar do contexto
      const currentAccountType = accountType || onboardingData.accountType;
      
      if (currentAccountType === 'PF') {
        navigation.navigate('OnboardingPersonalData');
      } else {
        navigation.navigate('CompanyData');
      }
      
      // 4. Atualizar o registro com o sucesso
      if (attemptId) {
        await recordOnboardingAttempt({
          id: attemptId,
          success: true,
          processing_time_ms: Date.now() - startTime
        });
      }
    } catch (error) {
      console.error('Erro ao aceitar termos:', error);
      
      // Atualizar o registro com o erro
      if (attemptId) {
        await recordOnboardingAttempt({
          id: attemptId,
          success: false,
          error_type: 'EXCEPTION',
          error_message: error.message || 'Ocorreu um erro ao aceitar os termos',
          processing_time_ms: Date.now() - startTime
        });
      }
      
      setAlertConfig({
        title: 'Erro',
        message: error.message || 'Ocorreu um erro ao processar sua solicitação.',
        type: 'error'
      });
      setAlertVisible(true);
    }
  };

  // Renderizar tela de carregamento enquanto verifica KYC
  if (checkingKyc) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e92176" />
        <Text style={styles.loadingText}>Verificando informações...</Text>
      </View>
    );
  }
  
  // Renderizar tela de código de convite se necessário
  if (needsInviteCode) {
    // Log para identificar quando esta parte da tela é renderizada
    console.log('🔍 [IDENTIFICADOR-TELA] TermsScreen.js - RENDERIZANDO TELA DE CÓDIGO DE CONVITE');
    console.log('📱 [IDENTIFICADOR-TELA] TermsScreen - Timestamp:', new Date().toISOString());
    console.log('📋 [IDENTIFICADOR-TELA] TermsScreen - Params:', { documentNumber, accountType });
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
        >
          <View style={styles.mainContainer}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              <View style={styles.inviteContainer}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../assets/images/logo-white.png')}
                    style={[styles.logo, { tintColor: '#FFFFFF' }]}
                    resizeMode="contain"
                  />
                </View>
                
                <Text style={styles.inviteTitle}>Código de Convite</Text>
                <Text style={styles.inviteSubtitle}>Digite seu código de convite para continuar</Text>
                
                <View style={styles.formContainer}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Código de Convite</Text>
                    <TextInput
                      placeholder="Digite seu código de convite"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      value={inviteCode}
                      onChangeText={setInviteCode}
                      style={styles.inputField}
                      autoCapitalize="characters"
                      disabled={isValidatingCode}
                    />
                  </View>
                  
                  <Text style={styles.documentText}>
                    Documento: {documentNumber.length === 11 ? 'CPF' : 'CNPJ'} {formatDocument(documentNumber)}
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            {/* Botão de validar - sempre visível na parte inferior */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.validateButton}
                onPress={handleValidateCode}
                disabled={isValidatingCode || !inviteCode.trim()}
                activeOpacity={0.8}
              >
                {isValidatingCode ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.validateButtonText}>Validar Código</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        
        {/* Alert para mensagens de erro */}
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onDismiss={() => setAlertVisible(false)}
          buttons={[
            {
              text: 'OK',
              onPress: () => setAlertVisible(false)
            }
          ]}
        />
      </SafeAreaView>
    );
  }
  
  // Função para formatar CPF/CNPJ
  function formatDocument(doc) {
    if (doc.length === 11) {
      return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    } else {
      return doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }
  }
  
  // Renderizar tela de termos normal se não precisar de código
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Termos e Condições</Text>
            <Text style={styles.subtitle}>
              Leia com atenção os termos e condições
            </Text>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Scrollable Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.termsBox}>
              <Image 
                source={require('../../assets/images/logo-white.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.mainTitle}>
                CONDIÇÕES GERAIS DE ABERTURA E{'\n'}
                MANUTENÇÃO DE CONTA DE PAGAMENTO{'\n'}
                PRÉ-PAGA {(accountType || onboardingData.accountType) === 'PF' ? 'PESSOA FÍSICA' : 'PESSOA JURÍDICA'}
              </Text>

              <Text style={styles.paragraph}>
                {TERMS_TEXT.INTRODUCTION}
              </Text>

              {TERMS_TEXT.SERVICES.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.paragraph}>{service.content}</Text>
                </View>
              ))}

              {TERMS_TEXT.CLAUSES.map((clause, index) => (
                <View key={index} style={styles.clauseItem}>
                  <Text style={styles.clauseTitle}>
                    [Cláusula {clause.number}] {clause.title}
                  </Text>
                  <Text style={styles.paragraph}>{clause.content}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAccepted(!accepted)}
              activeOpacity={0.7}
            >
              <View style={styles.customCheckbox}>
                {accepted && (
                  <View style={styles.checkboxInner}>
                    <Text style={styles.checkboxIcon}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Li e concordo com os termos e condições
              </Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleAcceptTerms}
              disabled={!accepted}
              style={[styles.continueButton, !accepted && styles.buttonDisabled]}
              labelStyle={styles.continueButtonLabel}
            >
              CONTINUAR
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  // Container principal para o KeyboardAvoidingView
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Container que envolve o ScrollView e o botão
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  // ScrollView que contém o formulário
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  // Container do botão - sempre visível na parte inferior
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
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
  inviteContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 40,
  },
  inviteTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  inviteSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
  },
  fieldContainer: {
    marginBottom: 20,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputField: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 16,
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  readonlyInput: {
    backgroundColor: 'rgba(104, 33, 69, 0.5)',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  documentText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  validateButton: {
    backgroundColor: '#E91E63',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 8,
    width: '100%',
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  termsBox: {
    borderWidth: 1,
    borderColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 30,
    alignSelf: 'center',
    marginBottom: 24,
    tintColor: '#E91E63',
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  serviceItem: {
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  clauseItem: {
    marginBottom: 24,
  },
  clauseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 16,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#682145',
    borderRadius: 4,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  continueButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});
