import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { supabase } from '../../../config/supabase';
import QRCodeStaticDialog from './QRCodeStaticDialog';
import QRCodeDynamicDialog from './QRCodeDynamicDialog';

const PixReceiveForm = ({ onBack }) => {
  const [pixKey, setPixKey] = useState('');
  const [value, setValue] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [staticQRData, setStaticQRData] = useState(null);
  const [dynamicQRData, setDynamicQRData] = useState(null);
  const [showStaticDialog, setShowStaticDialog] = useState(false);
  const [showDynamicDialog, setShowDynamicDialog] = useState(false);

  const handleGenerateStaticQR = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!validateFields()) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      const payload = {
        key: pixKey,
        amount: parseFloat(value),
        merchant: {
          merchantCategoryCode: "5651",
          postalCode,
          city,
          name: merchantName
        }
      };

      const { data: response, error: qrError } = await supabase.functions.invoke(
        'brcode-static',
        {
          body: payload
        }
      );

      if (qrError) throw qrError;

      if (response.status === 'ERROR') {
        throw new Error(response.error?.message || 'Erro ao gerar QR Code');
      }

      // Para QR Code estático, o emvqrcps vem direto no body
      setStaticQRData(response.body);
      setShowStaticDialog(true);

    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDynamicQR = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!validateFields()) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      const payload = {
        key: pixKey,
        amount: parseFloat(value),
        merchant: {
          merchantCategoryCode: "5651",
          postalCode,
          city,
          name: merchantName
        },
        expiration: 3600, // 1 hora
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      const { data: response, error: qrError } = await supabase.functions.invoke(
        'brcode-dynamic',
        {
          body: payload
        }
      );

      if (qrError) throw qrError;

      if (response.status === 'ERROR') {
        throw new Error(response.error?.message || 'Erro ao gerar QR Code');
      }

      // Para QR Code dinâmico, precisamos passar a resposta completa
      setDynamicQRData(response);
      setShowDynamicDialog(true);

    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    return pixKey && value && merchantName && postalCode && city;
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

      <Text style={styles.title}>Receber PIX</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Chave PIX</Text>
        <TextInput
          mode="outlined"
          value={pixKey}
          onChangeText={setPixKey}
          placeholder="Digite sua chave PIX"
          style={styles.input}
        />

        <Text style={styles.label}>Valor</Text>
        <TextInput
          mode="outlined"
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
          placeholder="0"
          style={styles.input}
        />

        <Text style={styles.label}>Nome do Estabelecimento</Text>
        <TextInput
          mode="outlined"
          value={merchantName}
          onChangeText={setMerchantName}
          placeholder="Nome do estabelecimento"
          style={styles.input}
        />

        <Text style={styles.label}>CEP</Text>
        <TextInput
          mode="outlined"
          keyboardType="numeric"
          value={postalCode}
          onChangeText={setPostalCode}
          placeholder="12345678"
          maxLength={8}
          style={styles.input}
        />

        <Text style={styles.label}>Cidade</Text>
        <TextInput
          mode="outlined"
          value={city}
          onChangeText={setCity}
          placeholder="Sua cidade"
          style={styles.input}
        />

        <View style={styles.buttons}>
          <Button
            mode="contained"
            onPress={handleGenerateStaticQR}
            loading={loading}
            disabled={loading}
            buttonColor="#FF1493"
            style={styles.button}
          >
            Gerar QR Code Estático
          </Button>

          <Button
            mode="contained"
            onPress={handleGenerateDynamicQR}
            loading={loading}
            disabled={loading}
            buttonColor="#FF1493"
            style={styles.button}
          >
            Gerar QR Code Dinâmico
          </Button>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>

      <QRCodeStaticDialog
        visible={showStaticDialog}
        onDismiss={() => setShowStaticDialog(false)}
        qrData={staticQRData}
      />

      <QRCodeDynamicDialog
        visible={showDynamicDialog}
        onDismiss={() => setShowDynamicDialog(false)}
        qrData={dynamicQRData}
      />
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
  buttons: {
    gap: 16,
    marginTop: 24,
  },
  button: {
    justifyContent: 'center',
  },
  snackbar: {
    marginBottom: 20,
  },
});

export default PixReceiveForm;
