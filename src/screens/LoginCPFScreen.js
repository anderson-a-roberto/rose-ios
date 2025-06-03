import React, { useState } from 'react';
import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://abkhgnefvzlqqamfpyvd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia2hnbmVmdnpscXFhbWZweXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4ODU1MjgsImV4cCI6MjA0OTQ2MTUyOH0.K-xv30H1ULn7CSsi7yPbnofQR6PsfxXdH7W-WQAtZYc'
);

const LoginCPFScreen = ({ navigation }) => {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');

  const formatCPF = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara
    return numbers.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    );
  };

  const handleCPFChange = (text) => {
    const formattedCPF = formatCPF(text);
    setCpf(formattedCPF);
  };

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

  const handleContinue = async () => {
    try {
      setError('');
      const cleanCPF = cpf.replace(/\D/g, '');
      
      // Consulta a tabela kyc_proposals_v2
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('*')
        .eq('document_number', cleanCPF)
        .maybeSingle();

      if (kycError) {
        console.error('Erro ao consultar kyc_proposals_v2:', kycError);
        setError('Erro ao verificar documento. Tente novamente.');
        return;
      }

      // Se não encontrar registro
      if (!kycData) {
        navigation.navigate('Step1');
        return;
      }

      // Verifica os status e redireciona
      if (kycData.onboarding_create_status === 'CONFIRMED') {
        navigation.navigate('LoginPassword', { cpf: cleanCPF });
      } else if (kycData.documentscopy_status === 'PENDING' && kycData.url_documentscopy) {
        navigation.navigate('KYC', { 
          kycUrl: kycData.url_documentscopy, 
          documentNumber: cleanCPF 
        });
      } else if (kycData.documentscopy_status === 'PROCESSING') {
        navigation.navigate('ThankYou');
      } else if (kycData.onboarding_create_status === 'REPROVED') {
        navigation.navigate('ThankYou');
      } else {
        // Se nenhuma condição for atendida
        navigation.navigate('Step1');
      }

    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      setError('Erro ao verificar documento. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Digite seu CPF para continuar</Text>
        
        <TextInput
          label="CPF"
          value={cpf}
          onChangeText={handleCPFChange}
          mode="outlined"
          style={styles.input}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          maxLength={14}
          theme={{ colors: { primary: '#FF1493' } }}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Continuar
        </Button>

        <TouchableOpacity 
          onPress={async () => {
            if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
              setError('Digite um CPF válido para recuperar sua senha');
              return;
            }
            
            try {
              setError('');
              // Tenta buscar o email do usuário para pré-preencher na tela de recuperação
              const cleanCPF = cpf.replace(/\D/g, '');
              const email = await getUserEmail(cleanCPF);
              navigation.navigate('ForgotPassword', { email, cpf: cleanCPF });
            } catch (error) {
              // Se não conseguir buscar o email, navega sem parâmetros
              console.error('Erro ao buscar email para recuperação:', error);
              navigation.navigate('ForgotPassword', { cpf: cleanCPF });
            }
          }}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha? Clique aqui</Text>
        </TouchableOpacity>
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
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginCPFScreen;
