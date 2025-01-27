import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { supabase } from '../../config/supabase';
import BillDetails from './BillDetails';
import BillProcessingModal from './BillProcessingModal';
import BillSuccessModal from './BillSuccessModal';

const PaymentForm = ({ onSubmit }) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleConsultBill = async () => {
    if (!barcode) {
      alert('Por favor, digite o código de barras');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chamar a edge function billpayments-authorize
      const { data, error: consultError } = await supabase.functions.invoke('billpayments-authorize', {
        body: {
          barCode: {
            type: 0,
            digitable: barcode
          }
        }
      });

      if (consultError) throw consultError;

      if (data.status === 0 && data.errorCode === '000') {
        setBillDetails({
          ...data,
          barCode: { digitable: barcode }
        });
      } else {
        throw new Error('Boleto inválido');
      }

    } catch (err) {
      console.error('Erro ao consultar boleto:', err);
      setError('Erro ao consultar boleto. Verifique o código e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setShowProcessingModal(true);

      // Gerar UUID para clientRequestId
      const clientRequestId = crypto.randomUUID();

      // Chamar a edge function bill-payment
      const { data, error: paymentError } = await supabase.functions.invoke('bill-payment', {
        body: {
          barCodeInfo: {
            digitable: barcode
          },
          clientRequestId,
          amount: billDetails.value,
          account: billDetails.account,
          transactionIdAuthorize: billDetails.transactionId
        }
      });

      if (paymentError) throw paymentError;

      // Aguardar um pouco para simular o processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      setShowProcessingModal(false);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setShowProcessingModal(false);
      setError('Erro ao processar pagamento. Tente novamente mais tarde.');
    }
  };

  const handleClose = () => {
    setShowSuccessModal(false);
    setBillDetails(null);
    setBarcode('');
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagar Conta</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Código de Barras</Text>
        <TextInput
          style={styles.input}
          mode="outlined"
          placeholder="Digite o código de barras"
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
          outlineColor="#FF1493"
          activeOutlineColor="#FF1493"
          disabled={loading || billDetails}
        />
      </View>

      <Button
        mode="outlined"
        onPress={() => console.log('Escanear código')}
        style={styles.scanButton}
        textColor="#FF1493"
        icon="barcode-scan"
        disabled={loading || billDetails}
      >
        Escanear Código de Barras
      </Button>

      {!billDetails && (
        <Button
          mode="contained"
          onPress={handleConsultBill}
          style={styles.submitButton}
          buttonColor="#FF1493"
          loading={loading}
          disabled={loading}
        >
          Consultar Boleto
        </Button>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {billDetails && (
        <BillDetails
          data={billDetails}
          onConfirmPayment={handlePayment}
        />
      )}

      <BillProcessingModal
        visible={showProcessingModal}
        data={billDetails}
        onClose={() => setShowProcessingModal(false)}
      />

      <BillSuccessModal
        visible={showSuccessModal}
        data={billDetails}
        onClose={handleClose}
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
  scanButton: {
    marginBottom: 16,
    borderColor: '#FF1493',
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

export default PaymentForm;
