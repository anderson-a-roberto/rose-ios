import React, { useState } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://abkhgnefvzlqqamfpyvd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia2hnbmVmdnpscXFhbWZweXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4ODU1MjgsImV4cCI6MjA0OTQ2MTUyOH0.K-xv30H1ULn7CSsi7yPbnofQR6PsfxXdH7W-WQAtZYc'
);

const LoginPasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { cpf } = route.params;

  const checkKYCStatus = async (documentNumber) => {
    try {
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals')
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

      // Fazer login com CPF (email temporário) e senha
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${cpf}@temp.com`,
        password: password,
      });

      if (authError) throw authError;

      // Verificar status do KYC usando o CPF
      const kycData = await checkKYCStatus(cpf);

      if (!kycData) {
        // Sem proposta KYC - usuário acabou de se cadastrar
        navigation.navigate('ThankYou');
        return;
      }

      switch (kycData.status) {
        case 'PENDING':
          // Redirecionar para KYCScreen com a URL e documentNumber
          if (kycData.kyc_url) {
            navigation.navigate('KYC', { 
              kycUrl: kycData.kyc_url,
              documentNumber: cpf 
            });
          } else {
            navigation.navigate('ThankYou');
          }
          break;

        case 'APPROVED':
          // Redirecionar para o Dashboard quando aprovado
          navigation.navigate('Dashboard');
          break;

        case 'REJECTED':
          navigation.navigate('ThankYou');
          break;

        default:
          navigation.navigate('ThankYou');
      }

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(error.message === 'Invalid login credentials'
        ? 'Senha incorreta'
        : 'Erro ao fazer login. Tente novamente.');
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
