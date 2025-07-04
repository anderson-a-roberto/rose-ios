import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../config/supabase';
import CustomAlert from '../components/common/CustomAlert';
import { useOnboarding } from '../contexts/OnboardingContext';

/**
 * Tela para captura e validação de documento (CPF/CNPJ)
 * Implementa o fluxo: DocumentScreen → (verificação) → InviteCodeScreen → OnboardingScreen
 */
const DocumentScreen = ({ navigation, route }) => {
  // Receber parâmetros da tela anterior
  const { documentNumber, accountType } = route.params || {};
  const { updateOnboardingData } = useOnboarding();
  
  const [document, setDocument] = useState(documentNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  
  // Verificar documento automaticamente se já foi fornecido
  useEffect(() => {
    console.log('DocumentScreen - Params recebidos:', { documentNumber, accountType });
    if (documentNumber) {
      console.log('Documento fornecido, verificando automaticamente...');
      handleContinue();
    }
  }, []);

  // Função para formatar CPF/CNPJ
  const formatDocument = (doc) => {
    // Remove caracteres não numéricos
    const cleanDoc = doc.replace(/\D/g, '');
    
    // Formata como CPF (123.456.789-01) ou CNPJ (12.345.678/0001-90)
    if (cleanDoc.length <= 11) {
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Função para detectar o tipo de documento
  const detectDocumentType = (doc) => {
    const cleanDoc = doc.replace(/\D/g, '');
    return cleanDoc.length <= 11 ? 'CPF' : 'CNPJ';
  };

  // Função para validar o documento
  const validateDocument = (doc) => {
    const cleanDoc = doc.replace(/\D/g, '');
    
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      return false;
    }
    
    // Aqui poderia ter uma validação mais completa de CPF/CNPJ
    return true;
  };

  const handleContinue = async () => {
    // Usar o documento passado por parâmetro ou o digitado no input
    const cleanDocument = (documentNumber || document).replace(/\D/g, '');
    
    if (!validateDocument(cleanDocument)) {
      setAlertConfig({
        title: 'Documento Inválido',
        message: 'Por favor, digite um CPF ou CNPJ válido.',
        type: 'error'
      });
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se já existe uma proposta para este documento
      const { data: kycProposal, error } = await supabase
        .from('kyc_proposals_v2')
        .select('*')
        .eq('document_number', cleanDocument)
        .maybeSingle();

      if (error) {
        throw new Error('Erro ao verificar documento');
      }

      const documentType = detectDocumentType(cleanDocument);
      const formattedDocument = formatDocument(cleanDocument);

      // Se não existe proposta, redirecionar para a tela de código de convite
      if (!kycProposal) {
        console.log('Nenhuma proposta encontrada para o documento. Redirecionando para tela de código de convite.');
        navigation.navigate('InviteCode', {
          document: cleanDocument,
          documentType,
          formattedDocument,
          accountType
        });
        return;
      }

      // Se já existe proposta, redirecionar diretamente para o onboarding
      console.log('Proposta encontrada para o documento. Redirecionando diretamente para onboarding.');
      navigation.navigate('OnboardingTerms', {
        documentNumber: cleanDocument,
        documentType,
        accountType,
        validated: true
      });
    } catch (error) {
      console.error('Erro ao verificar documento:', error);
      setAlertConfig({
        title: 'Erro',
        message: 'Ocorreu um erro ao verificar o documento. Tente novamente.',
        type: 'error'
      });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Documento</Text>
      <Text style={styles.subtitle}>Digite seu CPF ou CNPJ para continuar</Text>

      <View style={styles.formContainer}>
        <TextInput
          label="CPF ou CNPJ"
          value={document}
          onChangeText={(text) => setDocument(formatDocument(text))}
          mode="outlined"
          style={styles.input}
          placeholder="Digite seu CPF ou CNPJ"
          keyboardType="numeric"
          disabled={isLoading}
        />

        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          disabled={isLoading}
          loading={isLoading}
        >
          Continuar
        </Button>
      </View>

      <CustomAlert
        visible={alertVisible}
        onDismiss={() => setAlertVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText="OK"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#682145',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  logo: {
    width: 150,
    height: 80
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.8
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center'
  },
  input: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#FFFFFF'
  },
  button: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#e92176',
    paddingVertical: 5
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default DocumentScreen;
