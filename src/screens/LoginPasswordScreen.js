import React, { useState } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../config/supabase';

const LoginPasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { cpf } = route.params;

  const getUserEmail = async (documentNumber) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('document_number', documentNumber)
        .single();

      if (profileError) throw profileError;
      if (!profileData?.email) throw new Error('Email não encontrado');

      return profileData.email;
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
      const email = await getUserEmail(cpf);

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

      // Verificar status do KYC usando o CPF
      const kycData = await checkKYCStatus(cpf);

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
        setError('Sessão não estabelecida após login');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Digite sua senha para continuar</Text>
        
        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          placeholder="Sua senha"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          theme={{ colors: { primary: '#FF1493' } }}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Entrar
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#FF1493',
  },
  buttonLabel: {
    fontSize: 16,
    color: '#fff',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default LoginPasswordScreen;
