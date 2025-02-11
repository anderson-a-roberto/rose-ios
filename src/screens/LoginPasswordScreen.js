import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, StatusBar } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';

const LoginPasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { documentNumber } = route.params;

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

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);

      // Busca o email real do usuário
      const email = await getUserEmail(documentNumber);

      // Faz login com o email real e senha
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // Verifica se a sessão está ativa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('Sessão não estabelecida após login');

      // Verificar status do KYC usando o documento
      const kycData = await checkKYCStatus(documentNumber);

      if (!kycData) {
        await Linking.openURL('/error');
        return;
      }

      if (kycData.onboarding_create_status === 'CONFIRMED') {
        navigation.navigate('Dashboard2');
      } else {
        await Linking.openURL('/error');
      }

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error.message === 'Email não encontrado') {
        setError('Usuário não encontrado');
      } else if (error.message === 'Invalid login credentials') {
        setError('Senha incorreta');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
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
      <View style={styles.content}>
        <Text style={styles.title}>Digite sua senha</Text>
        <Text style={styles.subtitle}>Para acessar sua conta, digite sua senha</Text>

        <View style={styles.form}>
          <TextInput
            mode="flat"
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
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
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
                color="#666666"
              />
            }
          />
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => {/* TODO: Implementar recuperação de senha */}}
          >
            <Text style={styles.forgotPasswordText}>
              Esqueceu sua senha?
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!password || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
