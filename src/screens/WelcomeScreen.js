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

  const handleLoginContinue = async (documentNumber, accountType) => {
    try {
      setLoading(true);
      setShowLoginSheet(false);

      // Consulta a tabela kyc_proposals_v2
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('*')
        .eq('document_number', documentNumber)
        .maybeSingle();

      if (kycError) {
        console.error('Erro ao consultar kyc_proposals_v2:', kycError);
        // TODO: Mostrar erro ao usuário
        return;
      }

      // Se não encontrar registro, vai para cadastro
      if (!kycData) {
        // Atualiza o contexto com os dados iniciais
        updateOnboardingData({
          accountType,
          ...(accountType === 'PF' 
            ? { personalData: { documentNumber } }
            : { companyData: { documentNumber } }
          ),
        });
        
        navigation.navigate('OnboardingTerms');
        return;
      }

      // Verifica os status e redireciona
      if (kycData.onboarding_create_status === 'CONFIRMED') {
        navigation.navigate('LoginPassword', { documentNumber });
      } else if (kycData.documentscopy_status === 'PENDING' && kycData.url_documentscopy) {
        navigation.navigate('KYC', { 
          kycUrl: kycData.url_documentscopy, 
          documentNumber 
        });
      } else if (kycData.documentscopy_status === 'PROCESSING') {
        navigation.navigate('OnboardingSuccess');
      } else if (kycData.onboarding_create_status === 'REPROVED') {
        navigation.navigate('OnboardingSuccess');
      } else {
        // Se nenhuma condição for atendida, vai para cadastro
        // Atualiza o contexto com os dados iniciais
        updateOnboardingData({
          accountType,
          ...(accountType === 'PF' 
            ? { personalData: { documentNumber } }
            : { companyData: { documentNumber } }
          ),
        });
        
        navigation.navigate('OnboardingTerms');
      }
    } catch (error) {
      console.error('Erro ao validar documento:', error);
      // TODO: Mostrar erro ao usuário
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterContinue = (documentNumber, accountType) => {
    setShowRegisterSheet(false);
    // Atualiza o contexto com os dados iniciais
    updateOnboardingData({
      accountType,
      ...(accountType === 'PF' 
        ? { personalData: { documentNumber } }
        : { companyData: { documentNumber } }
      ),
    });
    // Agora vamos para OnboardingTerms
    navigation.navigate('OnboardingTerms');
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
