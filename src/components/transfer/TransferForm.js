import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { supabase } from '../../config/supabase';
import TransferSuccessModal from './TransferSuccessModal';

const TransferForm = () => {
  const [amount, setAmount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transferData, setTransferData] = useState(null);

  const formatCurrency = (text) => {
    // Remove tudo que não for número
    const numbers = text.replace(/\D/g, '');
    
    // Converte para centavos
    const cents = parseInt(numbers, 10);
    
    if (isNaN(cents)) {
      return '';
    }

    // Formata para reais com vírgula
    const reais = (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return reais;
  };

  const handleAmountChange = (text) => {
    setAmount(formatCurrency(text));
  };

  const validateFields = () => {
    const amountValue = parseFloat(amount.replace(/\D/g, '')) / 100;
    
    if (!amountValue || amountValue <= 0) {
      setError('O valor deve ser maior que zero');
      return false;
    }

    if (!destinationAccount) {
      setError('A conta de destino é obrigatória');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateFields()) {
        return;
      }

      setLoading(true);
      setError(null);

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
        amount: parseFloat(amount.replace(/\D/g, '')) / 100,
        clientRequestId: `T${Date.now()}`,
        description: "Transferência interna"
      };

      // Chamar edge function secure
      const { data: transferResult, error: transferError } = await supabase.functions.invoke(
        'internal-transfer-secure',
        { body: payload }
      );

      if (transferError) throw transferError;

      // Aceita tanto SUCCESS quanto PROCESSING como estados válidos
      if (transferResult.status === 'SUCCESS' || transferResult.status === 'PROCESSING') {
        setTransferData({
          status: transferResult.status,
          destinatario: transferResult.body.creditParty.name || 'Beneficiário',
          conta: destinationAccount,
          valor: `R$ ${amount}`
        });
        setShowSuccessModal(true);
        setAmount('');
        setDestinationAccount('');
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

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setTransferData(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transferir</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          mode="outlined"
          placeholder="R$ 0,00"
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          outlineColor="#FF1493"
          activeOutlineColor="#FF1493"
          left={<TextInput.Affix text="R$ " />}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Conta de Destino</Text>
        <TextInput
          style={styles.input}
          mode="outlined"
          placeholder="Digite a conta de destino"
          value={destinationAccount}
          onChangeText={setDestinationAccount}
          keyboardType="numeric"
          outlineColor="#FF1493"
          activeOutlineColor="#FF1493"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        buttonColor="#FF1493"
        loading={loading}
        disabled={loading}
      >
        Realizar Transferência
      </Button>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TransferSuccessModal
        visible={showSuccessModal}
        data={transferData}
        onClose={handleCloseModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TransferForm;
