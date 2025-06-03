import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, ScrollView, Keyboard } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';

const ForgotPinScreen = ({ route, navigation }) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Detectar quando o teclado é mostrado ou escondido
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Pegar o email passado como parâmetro, se existir
  const { email: initialEmail } = route.params || {};
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Log para debug
  console.log('[ForgotPinScreen] Email inicial:', initialEmail);

  const handleSendResetLink = async () => {
    if (!email) {
      setError('Por favor, informe seu email');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Chamar a edge function para solicitar a recuperação do PIN
      const { error: functionError } = await supabase.functions.invoke('pin-reset-2', {
        body: { 
          action: "request",
          email: email.trim().toLowerCase()
        }
      });

      if (functionError) {
        console.error('[ForgotPinScreen] Erro ao solicitar recuperação:', functionError);
        
        // Verificar se a mensagem de erro contém "Usuário não encontrado"
        if (functionError.message && functionError.message.includes('não encontrado')) {
          throw new Error(`Usuário não encontrado pelo email: ${email}`);
        } else {
          throw new Error('Não foi possível recuperar o PIN. Verifique seu email e tente novamente.');
        }
      }

      // Se chegou aqui, a solicitação foi bem-sucedida
      setSuccess(true);
    } catch (error) {
      console.error('[ForgotPinScreen] Erro:', error);
      setError(error.message || 'Não foi possível enviar o link de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!success ? (
            <>
              {/* Ícone de segurança */}
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <MaterialCommunityIcons name="lock-reset" size={36} color="#E91E63" />
                </View>
              </View>
              
              {/* Título e subtítulo */}
              <Text style={styles.title}>Recuperar PIN de transação</Text>
              <Text style={styles.subtitle}>Informe o email associado à sua conta para receber um link de recuperação do PIN</Text>
              
              {/* Input para o email */}
              <View style={styles.inputContainer}>
                <TextInput
                  mode="flat"
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.emailInput}
                  error={!!error}
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
                  autoComplete="email"
                  autoFocus
                />
                <HelperText type="error" visible={!!error} style={styles.errorText}>
                  {error}
                </HelperText>
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons name="email-check" size={64} color="#E91E63" style={styles.successIcon} />
              <Text style={styles.successTitle}>Email enviado!</Text>
              <Text style={styles.successText}>
                Enviamos um link de recuperação de PIN para {email}. 
                Por favor, verifique sua caixa de entrada e siga as instruções.
              </Text>
              <Text style={styles.successNote}>
                O link expira em 1 hora. Se não encontrar o email, verifique sua pasta de spam.
              </Text>
            </View>
          )}
        </View>

        {/* Botão de enviar */}
        <View style={styles.footer}>
          {!success ? (
            <TouchableOpacity
              style={[styles.button, (!email || loading) && styles.buttonDisabled]}
              onPress={handleSendResetLink}
              disabled={!email || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.buttonText}>Voltar para início</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 0,
    marginLeft: 0,
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
    marginTop: -4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 10,
    marginTop: 0,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  emailInput: {
    backgroundColor: 'transparent',
    width: '100%',
    marginBottom: 10,
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    width: '100%',
  },
  button: {
    backgroundColor: '#E91E63',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  successNote: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
});

export default ForgotPinScreen;
