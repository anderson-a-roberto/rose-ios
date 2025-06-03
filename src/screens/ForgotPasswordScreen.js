import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, ScrollView, Keyboard } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';

const ForgotPasswordScreen = ({ route, navigation }) => {
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
  // Pegar o email e CPF passados como parâmetros, se existirem
  const { email: initialEmail, cpf } = route.params || {};
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Log para debug - verificar se o CPF está sendo recebido
  console.log('[ForgotPasswordScreen] CPF recebido:', cpf);
  console.log('[ForgotPasswordScreen] Email inicial:', initialEmail);

  // Função para verificar se o email corresponde ao CPF
  const verifyEmailBelongsToCPF = async (email, cpf) => {
    console.log('[verifyEmailBelongsToCPF] Verificando email:', email, 'para CPF:', cpf);
    if (!cpf || !email) {
      console.log('[verifyEmailBelongsToCPF] CPF ou email não fornecidos');
      return false;
    }
    
    try {
      console.log('[verifyEmailBelongsToCPF] Consultando Supabase para CPF:', cpf);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, business_email, document_type')
        .eq('document_number', cpf)
        .single();

      if (profileError) {
        console.log('[verifyEmailBelongsToCPF] Erro ao consultar perfil:', profileError);
        throw profileError;
      }
      
      console.log('[verifyEmailBelongsToCPF] Dados do perfil:', profileData);
      
      // Se for PJ usa business_email, se for PF usa email
      const userEmail = profileData.document_type === 'CNPJ' 
        ? profileData.business_email 
        : profileData.email;
      
      console.log('[verifyEmailBelongsToCPF] Email do usuário:', userEmail, 'Email informado:', email);
        
      // Verifica se o email informado é o mesmo associado ao CPF
      const isValid = userEmail?.toLowerCase() === email.toLowerCase();
      console.log('[verifyEmailBelongsToCPF] Emails correspondem?', isValid);
      return isValid;
    } catch (error) {
      console.error('[verifyEmailBelongsToCPF] Erro ao verificar email:', error);
      return false;
    }
  };

  const handleSendResetLink = async () => {
    if (!email) {
      setError('Por favor, informe seu email');
      return;
    }

    // TRAVA TEMPORÁRIA: Verificar se temos o CPF
    if (!cpf) {
      console.log('[handleSendResetLink] TRAVA TEMPORÁRIA: CPF não fornecido');
      setError('Não foi possível verificar sua identidade. Por favor, volte para a tela anterior e tente novamente.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Verificar se o email corresponde ao CPF (já garantimos que o CPF existe com a trava temporária)
      console.log('[handleSendResetLink] Verificando email para o CPF:', cpf);
      console.log('[handleSendResetLink] CPF fornecido, verificando email...');
      const isValidEmail = await verifyEmailBelongsToCPF(email, cpf);
      console.log('[handleSendResetLink] Resultado da verificação:', isValidEmail);
      
      if (!isValidEmail) {
        console.log('[handleSendResetLink] Email inválido, mostrando erro');
        setError('O email informado não corresponde ao cadastrado para este CPF.');
        setLoading(false);
        return;
      }
      
      console.log('[handleSendResetLink] Email válido, continuando...');

      // Chamar a Edge Function para enviar o email de recuperação
      const { data, error: functionError } = await supabase.functions.invoke('password-reset', {
        body: {
          email,
          action: 'request'
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erro ao enviar email de recuperação');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSuccess(true);
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      
      // Mensagens de erro mais específicas
      if (error.message.includes('Usuário não encontrado')) {
        setError('Não encontramos uma conta com este email.');
      } else {
        setError('Não foi possível enviar o email de recuperação. Verifique se o email está correto.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, keyboardVisible && styles.contentPaddingForKeyboard]}
          keyboardShouldPersistTaps="handled"
        >
          {!success ? (
            <>
              <Text style={styles.title}>Recuperar senha</Text>
              <Text style={styles.subtitle}>
                Informe seu email cadastrado para receber um link de recuperação de senha
              </Text>

              <View style={styles.form}>
                <TextInput
                  mode="flat"
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  error={!!error}
                  style={styles.input}
                  contentStyle={styles.inputContent}
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
                
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons name="email-check" size={64} color="#E91E63" style={styles.successIcon} />
              <Text style={styles.successTitle}>Email enviado!</Text>
              <Text style={styles.successText}>
                Enviamos um link de recuperação de senha para {email}. 
                Por favor, verifique sua caixa de entrada e siga as instruções.
              </Text>
              <Text style={styles.successNote}>
                O link expira em 1 hora. Se não encontrar o email, verifique sua pasta de spam.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, keyboardVisible && styles.footerWithKeyboard]}>
          {!success ? (
            <TouchableOpacity
              style={[styles.button, (!email || loading) && styles.buttonDisabled]}
              onPress={handleSendResetLink}
              disabled={!email || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.buttonText}>VOLTAR PARA INÍCIO</Text>
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
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  contentPaddingForKeyboard: {
    paddingBottom: 120, // Extra padding when keyboard is visible
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    marginTop: -8,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  footerWithKeyboard: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 32, // Extra padding when keyboard is visible
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
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  successNote: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
