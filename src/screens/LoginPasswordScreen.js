import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1D1D1D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Senha</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Agora insira sua senha</Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
            mode="outlined"
            outlineColor="#E5E5E5"
            activeOutlineColor="#682145"
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
                color="#666666"
              />
            }
            error={!!error}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity onPress={() => {}} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPassword}>Esqueceu a senha? <Text style={styles.clickHere}>Clique aqui</Text></Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!password) && styles.continueButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={!password}
        >
          <Text style={styles.continueButtonText}>CONTINUAR</Text>
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
  forgotPasswordContainer: {
    marginTop: 16,
  },
  forgotPassword: {
    color: '#666666',
    fontSize: 14,
  },
  clickHere: {
    textDecorationLine: 'underline',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
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

export default LoginPasswordScreen;
