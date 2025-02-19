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
      
      const uri = await captureRef(receiptRef, {
        format: 'jpg',
        quality: 0.8,
        result: 'base64'
      });

      const tempUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(tempUri, uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(tempUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Compartilhar Comprovante'
      });

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
    navigation.navigate('PayBill', { balance: paymentData.balance });
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

      <View ref={receiptRef} collapsable={false} style={styles.container}>
        <ReceiptBase
          transactionId={paymentData.transactionId || '0000000000'}
          timestamp={new Date()}
          operationType="Pagamento de Boleto"
        >
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
        </ReceiptBase>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.shareButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          loading={loading}
          disabled={loading}
          icon="share-variant"
        >
          COMPARTILHAR COMPROVANTE
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    backgroundColor: '#E0E0E0',
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
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
