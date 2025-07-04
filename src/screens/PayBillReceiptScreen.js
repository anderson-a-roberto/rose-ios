import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import BillPaymentReceipt from '../components/extrato/receipts/BillPaymentReceipt';

export default function PayBillReceiptScreen({ route }) {
  const navigation = useNavigation();
  const { transaction, preloadedDetails, billData, paymentData, movementData, isTimeout } = route.params || {};
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef();

  // Função para preparar dados do comprovante
  const prepareReceiptData = () => {
    // Se temos dados do polling (transaction), usar eles
    if (transaction) {
      console.log('[PayBillReceiptScreen] Usando dados do polling:', transaction);
      return transaction;
    }

    // Se temos dados do polling (movementData), usar eles
    if (movementData) {
      console.log('[PayBillReceiptScreen] Usando movementData:', movementData);
      return {
        id: movementData.id,
        createDate: movementData.createDate,
        description: movementData.description,
        balanceType: movementData.balanceType,
        amount: movementData.amount,
        movementType: movementData.movementType,
        clientRequestId: movementData.clientRequestId,
        status: movementData.status,
        // Dados específicos do boleto
        assignor: billData?.assignor || 'N/A',
        barCode: billData?.barCode || {},
        value: billData?.value || movementData.amount,
        transactionId: paymentData?.transactionId || movementData.id
      };
    }

    // Fallback para dados básicos se não temos dados do polling
    console.log('[PayBillReceiptScreen] Usando dados de fallback');
    return {
      id: paymentData?.transactionId || `PB${Date.now()}`,
      createDate: new Date().toISOString(),
      description: 'PAGAMENTO DE CONTAS',
      balanceType: 'DEBIT',
      amount: billData?.value || 0,
      movementType: 'BILLPAYMENT',
      clientRequestId: paymentData?.clientRequestId || null,
      status: isTimeout ? 'PROCESSING' : (paymentData?.status || 'CONFIRMED'),
      // Dados específicos do boleto
      assignor: billData?.assignor || 'N/A',
      barCode: billData?.barCode || {},
      value: billData?.value || 0,
      transactionId: paymentData?.transactionId || null
    };
  };

  const transactionData = prepareReceiptData();

  const handleShare = async () => {
    try {
      setLoading(true);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo');
        return;
      }

      const fileName = `comprovante-boleto-${new Date().toISOString().slice(0,10)}.jpg`;
      
      const uri = await captureRef(receiptRef, {
        format: 'jpg',
        quality: 0.8,
        result: 'base64',
        height: 1500
      });

      const tempUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(tempUri, uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      await Sharing.shareAsync(tempUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Compartilhar Comprovante'
      });

      await new Promise(resolve => setTimeout(resolve, 300));
      await FileSystem.deleteAsync(tempUri);

    } catch (error) {
      console.error('Erro ao compartilhar comprovante:', error);
      Alert.alert(
        'Erro',
        'Não foi possível compartilhar o comprovante. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewPayment = () => {
    navigation.navigate('PayBill');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('Dashboard2')}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View ref={receiptRef} collapsable={false} style={styles.receiptContainer}>
          <BillPaymentReceipt 
            transaction={transactionData}
            preloadedDetails={preloadedDetails}
          />
        </View>
        
        {/* Aviso de timeout se aplicável */}
        {isTimeout && (
          <View style={styles.timeoutWarning}>
            <Text style={styles.timeoutText}>
              ⚠️ O status final do pagamento será confirmado em breve. 
              Você pode verificar no seu extrato.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.shareButton}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
          loading={loading}
          disabled={loading}
          icon="share-variant"
        >
          {loading ? 'PROCESSANDO...' : 'COMPARTILHAR COMPROVANTE'}
        </Button>

        <Button
          mode="outlined"
          onPress={handleNewPayment}
          style={styles.newPaymentButton}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: '#E91E63' }]}
        >
          NOVO PAGAMENTO
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  closeText: {
    color: '#E91E63',
    fontSize: 32,
    fontWeight: '300',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  receiptContainer: {
    backgroundColor: '#FFF'
  },
  timeoutWarning: {
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    marginBottom: 16,
  },
  timeoutText: {
    fontSize: 14,
    color: '#666666',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  shareButton: {
    backgroundColor: '#E91E63',
    marginBottom: 12,
  },
  newPaymentButton: {
    borderColor: '#E91E63',
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  }
});
