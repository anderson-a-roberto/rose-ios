import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useInviteCodes } from '../hooks/useInviteCodes';
import CustomAlert from '../components/common/CustomAlert';
import { useOnboarding } from '../contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Tela de validação de código de convite
 * Implementa o fluxo: DocumentScreen → InviteCodeScreen → OnboardingScreen
 */
const InviteCodeScreen = ({ navigation, route }) => {
  const { document, documentType, formattedDocument, accountType } = route.params || {};
  const { updateOnboardingData } = useOnboarding();
  const [inviteCode, setInviteCode] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  
  // Log ao carregar a página
  React.useEffect(() => {
    console.log('🔍 [IDENTIFICADOR-TELA] InviteCodeScreen.js carregado - TELA DE CÓDIGO DE CONVITE');
    console.log('📱 [IDENTIFICADOR-TELA] InviteCodeScreen - Timestamp:', new Date().toISOString());
    console.log('📋 [IDENTIFICADOR-TELA] InviteCodeScreen - Params recebidos:', { document, documentType, formattedDocument, accountType });
    
    // Alerta visual para identificação da tela em desenvolvimento
    if (__DEV__) {
      alert('Tela de Código de Convite carregada - InviteCodeScreen');
    }
  }, []);

  const { validateInviteCode, isLoading } = useInviteCodes();

  const handleValidateCode = async () => {
    if (!inviteCode.trim()) {
      setAlertConfig({
        title: 'Código Obrigatório',
        message: 'Por favor, digite o código de convite para continuar.',
        type: 'warning'
      });
      setAlertVisible(true);
      return;
    }

    const result = await validateInviteCode(inviteCode.trim(), document);

    if (result.success) {
      // Atualizar contexto de onboarding com os dados validados
      updateOnboardingData({
        accountType,
        ...(accountType === 'PF' 
          ? { personalData: { documentNumber: document } }
          : { companyData: { documentNumber: document } }
        ),
      });
      
      console.log('Código validado com sucesso. Redirecionando para OnboardingTerms.');
      
      // Código válido, navegar para a próxima tela
      navigation.navigate('OnboardingTerms', {
        documentNumber: document,
        documentType,
        accountType,
        inviteCode: inviteCode.trim(),
        validated: true
      });
    } else {
      // Mostrar erro
      setAlertConfig({
        title: 'Código Inválido',
        message: result.message || 'Não foi possível validar o código de convite.',
        type: 'error'
      });
      setAlertVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabeçalho fora do KeyboardAvoidingView */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.mainContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>

              <Text style={styles.title}>Código de Convite</Text>
              <Text style={styles.subtitle}>Digite seu código de convite para continuar</Text>

              <View style={styles.formContainer}>
                <Text style={styles.documentLabel}>
                  Documento: {documentType === 'CPF' ? 'CPF' : 'CNPJ'} {formattedDocument}
                </Text>

                <TextInput
                  label="Código de convite"
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  mode="flat"
                  placeholder="Digite seu código de convite"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={styles.input}
                  selectionColor="#FFFFFF"
                  underlineColor="#FFFFFF"
                  activeUnderlineColor="#FFFFFF"
                  textColor="#FFFFFF"
                  contentStyle={{ color: '#FFFFFF' }}
                  theme={{
                    colors: {
                      primary: '#FFFFFF',
                      onSurface: '#FFFFFF',
                      text: '#FFFFFF'
                    }
                  }}
                  disabled={isLoading}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              
              {/* Espaço extra para garantir scroll adequado */}
              <View style={styles.bottomPadding} />
            </View>
          </ScrollView>

          {/* Botão de validar - sempre visível na parte inferior */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleValidateCode}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              disabled={isLoading}
              loading={isLoading}
            >
              Validar Código
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      <CustomAlert
        visible={alertVisible}
        onDismiss={() => setAlertVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#682145',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#682145',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#682145',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#682145',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100, // Espaço extra no final para garantir scroll adequado
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 150,
    height: 50,
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
    backgroundColor: '#682145',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  documentLabel: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
    color: '#FFFFFF' // Texto branco para melhor visibilidade
  },
  input: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: 16,
    height: 60,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#682145',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
  // Espaço extra no final do formulário para garantir que o último campo fique visível acima do botão
  bottomPadding: {
    height: 100,
  },
  button: {
    width: '100%',
    backgroundColor: '#e92176',
    paddingVertical: 5,
    height: 48,
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  bottomPadding: {
    height: 100, // Espaço extra maior no final do formulário para garantir que o conteúdo não fique sob o botão
  }
});

export default InviteCodeScreen;
