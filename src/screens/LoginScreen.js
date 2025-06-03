import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../contexts/OnboardingContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { documentNumber: initialDocument, accountType } = route.params || {};
  const { updateOnboardingData } = useOnboarding();
  const [document, setDocument] = useState(initialDocument || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDocument = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleDocumentChange = (text) => {
    const formattedDoc = formatDocument(text);
    setDocument(formattedDoc);
    setError(null);
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      setError(null);

      const numbers = document.replace(/\D/g, '');

      // Consulta a tabela kyc_proposals_v2
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('*')
        .eq('document_number', numbers)
        .maybeSingle();

      if (kycError) {
        console.error('Erro ao consultar kyc_proposals_v2:', kycError);
        setError('Erro ao verificar documento. Tente novamente.');
        return;
      }

      // Se não encontrar registro, vai para cadastro
      if (!kycData) {
        // Atualiza o contexto com os dados iniciais
        updateOnboardingData({
          accountType,
          ...(accountType === 'PF' 
            ? { personalData: { documentNumber: numbers } }
            : { companyData: { documentNumber: numbers } }
          ),
        });
        
        navigation.navigate('OnboardingTerms');
        return;
      }

      // Verifica os status e redireciona
      if (kycData.onboarding_create_status === 'CONFIRMED') {
        // Redireciona para a tela de verificação de bloqueio em vez de ir direto para a senha
        navigation.navigate('BlockCheck', { cpf: numbers });
      } else if (kycData.documentscopy_status === 'PENDING' && kycData.url_documentscopy) {
        navigation.navigate('KYC', { 
          kycUrl: kycData.url_documentscopy, 
          documentNumber: numbers 
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
            ? { personalData: { documentNumber: numbers } }
            : { companyData: { documentNumber: numbers } }
          ),
        });
        
        navigation.navigate('OnboardingTerms');
      }

    } catch (error) {
      console.error('Erro ao validar documento:', error);
      setError('Erro ao verificar documento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1D1D1D" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Entrar</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>Insira os dados abaixo</Text>

            <View style={styles.inputContainer}>
              <TextInput
                label="CPF/CNPJ"
                value={document}
                onChangeText={handleDocumentChange}
                style={styles.input}
                keyboardType="numeric"
                maxLength={18}
                autoFocus
                error={!!error}
                disabled={loading}
                onSubmitEditing={Keyboard.dismiss}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                (!document || loading) && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={!document || loading}
            >
              <Text style={styles.continueButtonText}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    // Garante que o conteúdo ocupe toda a altura disponível
    ...(Platform.OS === 'ios' && { minHeight: '100%' }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1D1D1D',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 56,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    // Garante que o footer fique visível acima do teclado no iOS
    ...(Platform.OS === 'ios' && { marginBottom: 20 }),
  },
  continueButton: {
    backgroundColor: '#682145',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
