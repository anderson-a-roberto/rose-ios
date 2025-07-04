import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, StatusBar, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import LoginBottomSheet from '../components/login/LoginBottomSheet';
import RegisterBottomSheet from '../components/onboarding/RegisterBottomSheet';
import { useOnboarding } from '../contexts/OnboardingContext';
import { supabase } from '../config/supabase';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { updateOnboardingData } = useOnboarding();
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [showRegisterSheet, setShowRegisterSheet] = useState(false);
  const [loading, setLoading] = useState(false);

  // Função para padronizar os logs de decisão
  const logDecision = (kycData, destination) => {
    console.log(`\n\n🚨 DECISÃO DE NAVEGAÇÃO 🚨`);
    console.log(`➡️ Redirecionando para: ${destination}`);
    console.log(`Motivo: ${getNavigationReason(kycData, destination)}`);
    console.log(`====================================\n\n`);
  };

  // Função para determinar o motivo da navegação
  const getNavigationReason = (kycData, destination) => {
    if (destination === 'Rejected') {
      if (kycData.proposal_status === 'REPROVED') return 'proposal_status = REPROVED';
      if (kycData.background_check_status === 'REPROVED') return 'background_check_status = REPROVED';
      if (kycData.onboarding_create_status === 'REPROVED') return 'onboarding_create_status = REPROVED';
      if (kycData.documentscopy_status === 'REPROVED') return 'documentscopy_status = REPROVED';
      return 'Status reprovado';
    }
    
    if (destination === 'LoginPassword') return 'onboarding_create_status = CONFIRMED';
    if (destination === 'KYC') return 'documentscopy_status = PENDING com URL';
    if (destination === 'ThankYou') return 'Proposta em processamento ou pendente';
    if (destination === 'OnboardingTerms') return 'Nenhuma condição anterior atendida';
    
    return 'Motivo desconhecido';
  };

  const handleLoginContinue = async (documentNumber, accountType) => {
    try {
      setLoading(true);
      setShowLoginSheet(false);

      // Consulta a tabela kyc_proposals_v2
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('*')
        .eq('document_number', documentNumber)
        .order('created_at', { ascending: false }) // Pegar a proposta mais recente
        .maybeSingle();

      // Log SUPER DETALHADO do resultado da consulta
      console.log('\n\n==== RESULTADO DA CONSULTA SUPABASE ====');
      console.log('CPF/CNPJ consultado:', documentNumber);
      console.log('Dados recebidos:', JSON.stringify(kycData, null, 2));
      console.log('Erro:', kycError);
      console.log('====================================\n\n');

      if (kycError) {
        console.error('Erro ao consultar kyc_proposals_v2:', kycError);
        // TODO: Mostrar erro ao usuário
        return;
      }

      // Verificar se temos dados da proposta
      if (!kycData) {
        console.log('\n\n⚠️ ATENÇÃO: Nenhum dado encontrado para o CPF/CNPJ', documentNumber, '\n\n');
        
        // Atualiza o contexto com os dados iniciais
        updateOnboardingData({
          accountType,
          ...(accountType === 'PF' 
            ? { personalData: { documentNumber } }
            : { companyData: { documentNumber } }
          ),
        });
        
        // Usar navigation.reset para limpar a pilha de navegação
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'OnboardingTerms', 
            params: {
              documentNumber,
              accountType
            }
          }],
        });
        return;
      }
      
      // Verificar se a proposta está inativa (usuário solicitou nova tentativa)
      if (kycData.status === 'inactive') {
        console.log('\n\n🔄 PROPOSTA INATIVA: Usuário solicitou nova tentativa', '\n\n');
        
        // Atualiza o contexto com os dados iniciais
        updateOnboardingData({
          accountType,
          ...(accountType === 'PF' 
            ? { personalData: { documentNumber } }
            : { companyData: { documentNumber } }
          ),
        });
        
        // Usar navigation.reset para limpar a pilha de navegação
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'OnboardingTerms', 
            params: {
              documentNumber,
              accountType,
              isRetry: true // Indicar que é uma nova tentativa
            }
          }],
        });
        return;
      }

      // Log de análise de status
      console.log('\n\n🔍 ANÁLISE DE STATUS:');
      console.log(`proposal_status: ${kycData.proposal_status || 'null'}`);
      console.log(`background_check_status: ${kycData.background_check_status || 'null'}`);
      console.log(`onboarding_create_status: ${kycData.onboarding_create_status || 'null'}`);
      console.log(`documentscopy_status: ${kycData.documentscopy_status || 'null'}`);
      console.log('====================================\n\n');

      // VERIFICAÇÃO PRIORITÁRIA: Verifica se proposal_status ou background_check_status estão como REPROVED
      if (kycData.proposal_status === 'REPROVED' || kycData.background_check_status === 'REPROVED') {
        console.log('\n\n🛑 REPROVED DETECTADO! 🛑');
        logDecision(kycData, 'Rejected');
        
        // Usar navigation.reset para limpar a pilha de navegação
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'Rejected', 
            params: {
              documentNumber,
              accountType,
              reason: 'REPROVED',
              statusDetails: {
                proposal_status: kycData.proposal_status,
                background_check_status: kycData.background_check_status
              }
            }
          }],
        });
        return;
      }

      // Verificação secundária de outros status como REPROVED
      if (kycData.onboarding_create_status === 'REPROVED' || kycData.documentscopy_status === 'REPROVED') {
        console.log('\n\n🛑 OUTRO STATUS REPROVED DETECTADO! 🛑');
        logDecision(kycData, 'Rejected');
        
        // Usar navigation.reset para limpar a pilha de navegação
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'Rejected', 
            params: {
              documentNumber,
              accountType,
              reason: 'REPROVED',
              statusDetails: {
                onboarding_create_status: kycData.onboarding_create_status,
                documentscopy_status: kycData.documentscopy_status
              }
            }
          }],
        });
        return;
      }

      // Verificar se a proposta está confirmada (usuário já cadastrado)
      if (kycData.onboarding_create_status === 'CONFIRMED') {
        console.log('\n\n✅ PROPOSTA CONFIRMADA! ✅');
        logDecision(kycData, 'BlockCheck');
        
        // Redirecionar para a tela de verificação de bloqueio antes do login
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'BlockCheck', 
            params: {
              documentNumber: documentNumber
            }
          }],
        });
        return;
      }

      // Verifica se tem documentos pendentes com URL
      if (kycData.documentscopy_status === 'PENDING' && kycData.url_documentscopy) {
        console.log('\n\n📄 DOCUMENTOS PENDENTES COM URL! 📄');
        logDecision(kycData, 'KYC');
        
        // Se o status da proposta for REPROVED e o status não for 'inactive', vai para tela de rejeição
        if ((kycData.proposal_status === 'REPROVED' || 
            kycData.background_check_status === 'REPROVED' ||
            kycData.onboarding_create_status === 'REPROVED' ||
            kycData.documentscopy_status === 'REPROVED') &&
            kycData.status === 'active') { // Verificar se a proposta está ativa
        
          console.log('\n\n❌ STATUS REPROVADO! ❌');
          logDecision(kycData, 'Rejected');
          
          // Obter o motivo da rejeição
          let reason = '';
          if (kycData.proposal_status === 'REPROVED') {
            reason = kycData.proposal_status_details || 'Proposta reprovada';
          } else if (kycData.background_check_status === 'REPROVED') {
            reason = kycData.background_check_status_details || 'Verificação de antecedentes reprovada';
          } else if (kycData.onboarding_create_status === 'REPROVED') {
            reason = kycData.onboarding_create_status_details || 'Criação de conta reprovada';
          } else if (kycData.documentscopy_status === 'REPROVED') {
            reason = kycData.documentscopy_status_details || 'Verificação de documentos reprovada';
          }
          
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'Rejected', 
              params: {
                documentNumber,
                accountType,
                reason,
                statusDetails: kycData
              }
            }],
          });
          return;
        }
        
        // Usar navigation.reset para limpar a pilha de navegação
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'KYC', 
            params: {
              kycUrl: kycData.url_documentscopy, 
              documentNumber
            }
          }],
        });
        return;
      }

      // Verifica se está em processamento ou pendente
      if (
        kycData.documentscopy_status === 'PROCESSING' ||
        kycData.background_check_status === 'PENDING' ||
        (kycData.proposal_status === 'PENDING' && 
          !kycData.onboarding_create_status && 
          !kycData.documentscopy_status && 
          !kycData.background_check_status)
      ) {
        console.log('\n\n⏳ PROPOSTA EM PROCESSAMENTO OU PENDENTE! ⏳');
        logDecision(kycData, 'ThankYou');
        
        // Usar navigation.reset para limpar a pilha de navegação
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'ThankYou', 
            params: {
              documentNumber,
              accountType,
              status: 'PENDING'
            }
          }],
        });
        return;
      }

      // Se nenhuma condição for atendida, vai para cadastro
      console.log('\n\n⚠️ NENHUMA CONDIÇÃO ATENDIDA! ⚠️');
      logDecision(kycData, 'OnboardingTerms');
      
      // Atualiza o contexto com os dados iniciais
      updateOnboardingData({
        accountType,
        ...(accountType === 'PF' 
          ? { personalData: { documentNumber } }
          : { companyData: { documentNumber } }
        ),
      });
      
      // Usar navigation.reset para limpar a pilha de navegação
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'OnboardingTerms', 
          params: {
            documentNumber,
            accountType
          }
        }],
      });
    } catch (error) {
      console.error('Erro ao validar documento:', error);
      // TODO: Mostrar erro ao usuário
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterContinue = (documentNumber, accountType) => {
    console.log('WelcomeScreen: Navegando para OnboardingTerms com:', { documentNumber, accountType });
    setShowRegisterSheet(false);
    
    // Atualiza o contexto com os dados iniciais
    updateOnboardingData({
      accountType,
      ...(accountType === 'PF' 
        ? { personalData: { documentNumber } }
        : { companyData: { documentNumber } }
      ),
    });
    
    // Navega diretamente para a tela de termos, que agora verifica a necessidade de código de convite
    navigation.navigate('OnboardingTerms', {
      documentNumber,
      accountType
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#682145" />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo-white.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.enterButton, loading && styles.buttonDisabled]}
          onPress={() => setShowLoginSheet(true)}
          disabled={loading}
        >
          <Text style={styles.enterButtonText}>ENTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createAccountButton, loading && styles.buttonDisabled]}
          onPress={() => setShowRegisterSheet(true)}
          disabled={loading}
        >
          <Text style={styles.createAccountButtonText}>ABRIR CONTA</Text>
        </TouchableOpacity>
      </View>

      <LoginBottomSheet
        visible={showLoginSheet}
        onDismiss={() => setShowLoginSheet(false)}
        onContinue={handleLoginContinue}
        loading={loading}
      />

      <RegisterBottomSheet
        visible={showRegisterSheet}
        onDismiss={() => setShowRegisterSheet(false)}
        onContinue={handleRegisterContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#682145',
    justifyContent: 'space-between',
    padding: 24,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 40,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 48,
  },
  enterButton: {
    backgroundColor: '#E91E63',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  createAccountButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  createAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
