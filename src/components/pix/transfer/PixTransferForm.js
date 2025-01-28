import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { supabase } from '../../../config/supabase';
import PixDictDialog from './PixDictDialog';
import PixProcessingModal from './PixProcessingModal';

const generateClientCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const PixTransferForm = ({ onBack, userAccount, userTaxId }) => {
  const [value, setValue] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDictDialog, setShowDictDialog] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [pixData, setPixData] = useState(null);
  const [transferData, setTransferData] = useState(null);

  const handlePixSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!value || !pixKey) {
        throw new Error('Preencha todos os campos');
      }

      if (!userAccount || !userTaxId) {
        throw new Error('Dados do usuário não encontrados');
      }

      // Consultar PIX Dict
      const { data: dictResponse, error: dictError } = await supabase.functions.invoke(
        'get-pix-dict',
        {
          body: {
            key: pixKey,
            account: userAccount
          }
        }
      );

      if (dictError) throw dictError;

      if (dictResponse.status === 'ERROR') {
        throw new Error(dictResponse.error?.message || 'Erro ao consultar chave PIX');
      }

      // Guardar dados do beneficiário
      setBeneficiaryName(dictResponse.data.name);
      setPixData(dictResponse.data);
      setShowDictDialog(true);

    } catch (err) {
      console.error('Erro ao consultar PIX:', err);
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    try {
      setLoading(true);
      setError(null);

      // Estruturar payload completo
      const payload = {
        debitParty: {
          account: userAccount,
          branch: "1",
          taxId: userTaxId,
          name: "Usuário", // TODO: Adicionar nome do usuário
          accountType: "TRAN"
        },
        creditParty: {
          bank: pixData.participant,
          key: pixKey,
          branch: pixData.branch || "1",
          taxId: pixData.documentnumber,
          name: pixData.name,
          accountType: "TRAN"
        },
        amount: parseFloat(value),
        clientCode: generateClientCode(),
        endToEndId: pixData.endtoendid,
        initiationType: "DICT",
        paymentType: "IMMEDIATE",
        urgency: "HIGH",
        transactionType: "TRANSFER",
        remittanceInformation: "Pagamento PIX"
      };

      // Realizar transferência PIX
      const { data: transferResponse, error: transferError } = await supabase.functions.invoke(
        'pix-cash-out',
        {
          body: payload
        }
      );

      if (transferError) throw transferError;

      if (transferResponse.status === 'ERROR') {
        throw new Error(transferResponse.error?.message || 'Erro ao realizar transferência PIX');
      }

      // Guardar dados da transferência e mostrar modal de processamento
      setTransferData({
        beneficiaryName: pixData.name,
        pixKey: pixKey,
        value: value,
        status: transferResponse.body?.status || 'PROCESSING',
        endToEndId: transferResponse.body?.endToEndId
      });
      
      setShowDictDialog(false);
      setShowProcessingModal(true);

      // Limpar formulário
      setValue('');
      setPixKey('');
      setPixData(null);

    } catch (err) {
      console.error('Erro ao realizar transferência:', err);
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={styles.backButton}
        >
          Voltar
        </Button>
      </View>

      <Text style={styles.title}>Transferência PIX</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Valor</Text>
        <TextInput
          mode="outlined"
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
          placeholder="0"
          style={styles.input}
        />

        <Text style={styles.label}>Chave PIX</Text>
        <TextInput
          mode="outlined"
          value={pixKey}
          onChangeText={setPixKey}
          placeholder="Digite a chave PIX"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handlePixSubmit}
          loading={loading}
          disabled={loading}
          buttonColor="#FF1493"
          style={styles.button}
        >
          Realizar Transferência PIX
        </Button>
      </View>

      <PixDictDialog
        visible={showDictDialog}
        onDismiss={() => setShowDictDialog(false)}
        onConfirm={handleConfirmTransfer}
        beneficiaryName={beneficiaryName}
      />

      <PixProcessingModal
        visible={showProcessingModal}
        onDismiss={() => setShowProcessingModal(false)}
        transferData={transferData}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginLeft: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'white',
  },
  button: {
    marginTop: 24,
  },
  snackbar: {
    marginBottom: 20,
  },
});

export default PixTransferForm;
