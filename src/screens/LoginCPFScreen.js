import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://abkhgnefvzlqqamfpyvd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia2hnbmVmdnpscXFhbWZweXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4ODU1MjgsImV4cCI6MjA0OTQ2MTUyOH0.K-xv30H1ULn7CSsi7yPbnofQR6PsfxXdH7W-WQAtZYc'
);

const LoginCPFScreen = ({ navigation }) => {
  const [cpf, setCpf] = useState('');

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

  const handleContinue = async () => {
    // Remove formatação do CPF
    const cleanCPF = cpf.replace(/\D/g, '');
    console.log('CPF enviado:', cleanCPF);
    
    try {
      // Verifica se o usuário existe
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('document_number', cleanCPF)
        .maybeSingle();

      console.log('Data retornado:', data);
      console.log('Erro:', error);

      if (error) throw error;

      if (data) {
        console.log('Usuário encontrado, verificando status KYC');
        
        // Verificar status do KYC
        const kycData = await checkKYCStatus(cleanCPF);
        
        if (kycData && kycData.status === 'PENDING' && kycData.kyc_url) {
          console.log('KYC pendente, indo para tela de KYC');
          navigation.navigate('KYC', { 
            kycUrl: kycData.kyc_url,
            documentNumber: cleanCPF 
          });
        } else {
          console.log('Indo para LoginPassword');
          navigation.navigate('LoginPassword', { cpf: cleanCPF });
        }
      } else {
        console.log('Usuário não encontrado, indo para Step1');
        navigation.navigate('Step1');
      }
    } catch (error) {
      console.error('Erro ao verificar CPF:', error.message);
      // Aqui você pode adicionar um feedback visual para o usuário
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

        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Continuar
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
});

export default LoginCPFScreen;
