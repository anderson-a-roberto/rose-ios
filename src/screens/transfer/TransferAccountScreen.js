import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';

const TransferAccountScreen = ({ navigation, route }) => {
  const { amount } = route.params;
  const [destinationAccount, setDestinationAccount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccountChange = (text) => {
    // Remove tudo que não for número
    const numbers = text.replace(/\D/g, '');
    setDestinationAccount(numbers);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!destinationAccount) {
        setError('Digite o número da conta');
        return;
      }

      setLoading(true);
      setError('');

      // Buscar usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar número da conta
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycError) throw kycError;

      // Montar payload para a edge function
      const payload = {
        debitParty: {
          account: kycData.account,
          branch: "1",
          taxId: profileData.document_number,
          name: profileData.full_name
        },
        creditParty: {
          account: destinationAccount,
          branch: "1"
        },
        amount: amount,
        clientRequestId: `T${Date.now()}`,
        description: "Transferência interna"
      };

      // Chamar edge function
      const { data: transferResult, error: transferError } = await supabase.functions.invoke(
        'internal-transfer',
        { body: payload }
      );

      if (transferError) throw transferError;

      // Aceita tanto SUCCESS quanto PROCESSING como estados válidos
      if (transferResult.status === 'SUCCESS' || transferResult.status === 'PROCESSING') {
        const transferData = {
          status: transferResult.status,
          destinatario: transferResult.body.creditParty.name || 'Beneficiário',
          conta: destinationAccount,
          valor: amount,
          data: new Date().toISOString()
        };
        
        navigation.navigate('TransferSuccess', { transferData });
      } else {
        throw new Error('Erro ao processar transferência');
      }

    } catch (err) {
      console.error('Erro ao realizar transferência:', err);
      setError(err.message || 'Erro ao realizar transferência. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transferir</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Para quem você quer transferir?</Text>

      {/* Account Input */}
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          label="Número da Conta"
          value={destinationAccount}
          onChangeText={handleAccountChange}
          keyboardType="numeric"
          error={!!error}
          style={styles.input}
          autoFocus
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.continueButton}
          labelStyle={styles.continueButtonLabel}
          loading={loading}
          disabled={loading || !destinationAccount}
        >
          CONTINUAR
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 32,
    color: '#000',
  },
  inputContainer: {
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    marginTop: 'auto',
  },
  continueButton: {
    backgroundColor: '#000',
    height: 48,
    borderRadius: 25,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TransferAccountScreen;
