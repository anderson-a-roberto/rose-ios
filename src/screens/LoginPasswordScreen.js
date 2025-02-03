import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';

const LoginPasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
      } else if (error.message === 'Sessão não estabelecida após login') {
        setError('Erro ao estabelecer sessão');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Senha</Text>
      <Text style={styles.subtitle}>Agora insira sua senha</Text>

      <View style={styles.inputContainer}>
        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          mode="outlined"
          style={styles.input}
          error={!!error}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.forgotPassword}>Esqueceu a senha? Clique aqui!</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !password && styles.continueButtonDisabled
        ]}
        onPress={handleLogin}
        disabled={!password}
      >
        <Text style={styles.continueButtonText}>CONTINUAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 24,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    color: '#666',
  },
  inputContainer: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  forgotPassword: {
    color: '#666',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 24,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginPasswordScreen;
