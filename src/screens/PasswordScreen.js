import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Checkbox, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';

export default function PasswordScreen({ route }) {
  const navigation = useNavigation();
  const { document } = route.params;
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      if (kycError) throw kycError;
      return kycData;
    } catch (error) {
      console.error('Erro ao verificar status KYC:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // Busca o email do usuário
      const email = await getUserEmail(document);

      // Faz login com email e senha
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verifica status do KYC
      const kycData = await checkKYCStatus(document);

      if (kycData.onboarding_create_status === 'CONFIRMED') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard2' }],
        });
      } else {
        setError('Acesso não autorizado');
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1D1D1D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrar</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Insira os dados abaixo</Text>

        {/* Document Display */}
        <View style={styles.documentContainer}>
          <Text style={styles.documentLabel}>CPF/CNPJ</Text>
          <Text style={styles.documentValue}>{document}</Text>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Senha"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            disabled={loading}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            onPress={() => {}}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>
              Esqueceu sua senha? <Text style={styles.clickHereText}>Clique aqui</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handleLogin}
          style={styles.continueButton}
          loading={loading}
          disabled={loading}
        >
          CONTINUAR
        </Button>
      </View>
    </View>
  );
}

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
  documentContainer: {
    marginBottom: 24,
  },
  documentLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  documentValue: {
    fontSize: 16,
    color: '#1D1D1D',
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
  forgotPasswordText: {
    fontSize: 14,
    color: '#666666',
  },
  clickHereText: {
    color: '#682145',
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
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
