import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Button, Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ReceiptBase from '../components/receipt/ReceiptBase';
import MoneyValue from '../components/receipt/MoneyValue';

export default function PayBillReceiptScreen({ route }) {
  const navigation = useNavigation();
  const { paymentData } = route.params;
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef();

  const handleShare = async () => {
    try {
      setLoading(true);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo');
        return;
      }

      const fileName = `comprovante-boleto-${new Date().toISOString().slice(0,10)}.jpg`;
      
      // Modificado para usar as mesmas configurações do ReceiptModal que funciona
      const uri = await captureRef(receiptRef, {
        format: 'jpg',
        quality: 0.8,
        result: 'base64',
        height: 1500 // Usar a mesma altura do ReceiptModal
      });

      const tempUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(tempUri, uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Adicionar um pequeno atraso para garantir que o arquivo seja gravado completamente
      await new Promise(resolve => setTimeout(resolve, 300));

      await Sharing.shareAsync(tempUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Compartilhar Comprovante'
      });

      // Adicionar um pequeno atraso antes de excluir o arquivo
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
        <View ref={receiptRef} collapsable={false} style={[styles.receiptContainer, {backgroundColor: '#FFF'}]}>
        <ReceiptBase
          transactionId={paymentData.transactionId}
          timestamp={new Date()}
          operationType="Pagamento de Boleto"
        >
          {/* Status */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { color: '#4CAF50' }]}>
              {paymentData.status === 'PROCESSING' ? 'Em Processamento' : 'Concluído'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Valor */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Valor:</Text>
            <MoneyValue value={-paymentData.value} />
          </View>

          <Divider style={styles.divider} />

          {/* Beneficiário */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Beneficiário:</Text>
            <Text style={styles.value}>{paymentData.assignor}</Text>
          </View>

          <Divider style={styles.divider} />

          {/* Código de Barras */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Código de Barras:</Text>
            <Text style={styles.value}>{paymentData.barCode.digitable}</Text>
          </View>

          <Divider style={styles.divider} />

          {/* ID da Transação */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID da Transação:</Text>
            <Text style={styles.value}>{paymentData.clientRequestId}</Text>
          </View>
        </ReceiptBase>
        </View>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  value: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  divider: {
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
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
