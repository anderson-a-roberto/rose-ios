import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';
import { resetNavigation } from '../navigation/RootNavigation';
import { useLoginAuditMobile } from '../hooks/useLoginAuditMobile';

const LoginPasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { documentNumber } = route.params;
  const { logLoginAttempt, retryPendingLogs } = useLoginAuditMobile();
  
  // Limite de tentativas de login
  const MAX_LOGIN_ATTEMPTS = 3;

  const getUserEmail = async (documentNumber) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, business_email, document_type')
        .eq('document_number', documentNumber.replace(/\D/g, ''))
        .single();

      if (profileError) throw profileError;
      
      // Se for PJ usa business_email, se for PF usa email
      const userEmail = profileData.document_type === 'CNPJ' 
        ? profileData.business_email 
        : profileData.email;
        
      if (!userEmail) throw new Error('Email não encontrado');

      return userEmail;
    } catch (error) {
      console.error('Erro ao buscar email:', error);
      throw error;
    }
  };

  const checkKYCStatus = async (documentNumber) => {
    try {
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('*')
        .eq('document_number', documentNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycError) {
        if (kycError.code === 'PGRST116') {
          // Nenhuma proposta encontrada
          return null;
        }
        throw kycError;
      }

      return kycData;
    } catch (error) {
      console.error('Erro ao verificar status KYC:', error);
      throw error;
    }
  };

  // Função para bloquear o usuário após exceder o limite de tentativas
  const blockUser = async (email) => {
    try {
      // Inserir um registro na tabela blocked_users
      const { error } = await supabase
        .from('blocked_users')
        .insert([
          { 
            document_number: documentNumber,
            email: email,
            reason: 'Excesso de tentativas de login',
            blocked_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Erro ao bloquear usuário:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Erro inesperado ao bloquear usuário:', err);
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const startTime = Date.now(); // Registrar o tempo de início para medir a duração

      // Se já excedeu o limite de tentativas, redireciona para a tela de bloqueio
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Log de usuário bloqueado
        await logLoginAttempt({
          document_number: documentNumber,
          email: "blocked@example.com",
          success: false,
          error_type: "USER_BLOCKED",
          request_duration_ms: Date.now() - startTime,
        });
        navigation.navigate('UserBlocked');
        return;
      }

      // Busca o email real do usuário
      const email = await getUserEmail(documentNumber);

      // Verificar se a senha está vazia
      if (!password || password.trim() === '') {
        await logLoginAttempt({
          document_number: documentNumber,
          email: "unknown@example.com",
          success: false,
          error_type: "EMPTY_PASSWORD",
          request_duration_ms: Date.now() - startTime,
        });
        setError('Por favor, insira sua senha');
        setLoading(false);
        return;
      }

      // Faz login com o email real e senha
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        // Incrementa o contador de tentativas
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        // Se atingiu o limite, bloqueia o usuário
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const blocked = await blockUser(email);
          await logLoginAttempt({
            document_number: documentNumber,
            email: email,
            success: false,
            error_type: "MAX_ATTEMPTS_REACHED",
            request_duration_ms: Date.now() - startTime,
          });
          if (blocked) {
            navigation.navigate('UserBlocked');
            return;
          }
        } else {
          // Log de credenciais inválidas
          await logLoginAttempt({
            document_number: documentNumber,
            email: email,
            success: false,
            error_type: "INVALID_CREDENTIALS",
            request_duration_ms: Date.now() - startTime,
          });
        }
        
        throw authError;
      }

      // Login bem-sucedido, resetar contador de tentativas
      setLoginAttempts(0);

      // Verifica se a sessão está ativa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('Sessão não estabelecida após login');
      
      // Log de login bem-sucedido
      await logLoginAttempt({
        document_number: documentNumber,
        email: email,
        success: true,
        request_duration_ms: Date.now() - startTime,
        user_id: authData.user?.id,
        session_id: session?.access_token?.substring(0, 20),
      });
      
      // Tentar reenviar logs pendentes quando o login for bem-sucedido
      retryPendingLogs();

      // Verificar status do KYC usando o documento
      const kycData = await checkKYCStatus(documentNumber);

      if (!kycData) {
        await Linking.openURL('/error');
        return;
      }

      if (kycData.onboarding_create_status === 'CONFIRMED') {
        // Login bem-sucedido, navegar para a tela de carregamento do PIN
        console.log('[LOGIN] Login bem-sucedido, navegando para a tela de carregamento do PIN');
        navigation.navigate('PinLoading');
      } else {
        await Linking.openURL('/error');
      }

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      const startTime = Date.now();
      
      if (error.message === 'Email não encontrado') {
        // Log de email não encontrado
        await logLoginAttempt({
          document_number: documentNumber,
          email: "notfound@example.com",
          success: false,
          error_type: "EMAIL_NOT_FOUND",
          request_duration_ms: Date.now() - startTime,
        });
        setError('Usuário não encontrado');
      } else if (error.message === 'Invalid login credentials') {
        // Calculamos as tentativas restantes com base no novo valor de loginAttempts
        const attemptsRemaining = MAX_LOGIN_ATTEMPTS - loginAttempts;
        setError(`Senha incorreta. Tentativas restantes: ${attemptsRemaining}`);
      } else {
        // Log de erro genérico
        await logLoginAttempt({
          document_number: documentNumber,
          email: "error@example.com",
          success: false,
          error_type: "GENERAL_ERROR",
          error_message: error.message,
          request_duration_ms: Date.now() - startTime,
        });
        setError('Erro ao fazer login. Tente novamente.');
      }  
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Digite sua senha</Text>
          <Text style={styles.subtitle}>Para acessar sua conta, digite sua senha</Text>

          <View style={styles.form}>
            <TextInput
              mode="flat"
              label="Senha"
              value={showPassword ? password : "•".repeat(password.length)}
              onChangeText={(value) => {
                // Se estiver mostrando a senha real, atualizamos normalmente
                if (showPassword) {
                  setPassword(value);
                } else {
                  // Se estiver mostrando os pontos, precisamos determinar se o usuário adicionou ou removeu caracteres
                  const previousLength = password.length;
                  const currentLength = value.length;
                  
                  if (currentLength > previousLength) {
                    // Adicionou caracteres - pegamos apenas o último caractere adicionado
                    const lastChar = value.charAt(value.length - 1);
                    if (lastChar !== '•') { // Certifique-se de que não estamos adicionando um ponto
                      setPassword(prev => prev + lastChar);
                    }
                  } else if (currentLength < previousLength) {
                    // Removeu caracteres - removemos o último caractere da senha real
                    setPassword(prev => prev.slice(0, -1));
                  }
                }
              }}
              secureTextEntry={false}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              enablesReturnKeyAutomatically
              underlineColor="#E91E63"
              activeUnderlineColor="#E91E63"
              outlineColor="#E91E63"
              activeOutlineColor="#E91E63"
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                  text: '#000000',
                  placeholder: '#666666',
                },
              }}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#666666"
                />
              }
              autoFocus
            />
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword', { cpf: documentNumber })}
            >
              <Text style={styles.forgotPasswordText}>
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer - Now part of the scrollable content */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, (!password || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!password || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </Text>
          </TouchableOpacity>
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
    padding: 24,
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
    height: Platform.OS === 'ios' ? 56 : 'auto',
  },
  inputContent: {
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: 24,
    color: '#000000',
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    marginTop: -8,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#666666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16, // Ajuste para diferentes plataformas
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
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
});

export default LoginPasswordScreen;
