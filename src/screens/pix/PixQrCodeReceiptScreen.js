import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import PixOutReceipt from '../../components/extrato/receipts/PixOutReceipt';
import MoneyValue from '../../components/receipt/MoneyValue';

const PixQrCodeReceiptScreen = ({ navigation, route }) => {
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

      const fileName = `comprovante-pix-${new Date().toISOString().slice(0,10)}.jpg`;
      
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      {/* Header com botão de fechar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('Dashboard2')}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View ref={receiptRef} collapsable={false} style={[styles.receiptContainer, {backgroundColor: '#FFF'}]}>
          {/* Usando o mesmo componente do extrato para garantir consistência */}
          <PixOutReceipt 
            transaction={{
              id: paymentData.endToEndId || paymentData.id,
              createDate: new Date(),
              amount: paymentData.amount,
              movementType: 'PIXPAYMENTOUT'
            }}
            onTransferDetailsLoaded={() => {}}
            preloadedDetails={{
              status: 'CONFIRMED',
              body: {
                debitParty: {
                  name: paymentData.debitParty?.name || 'Fernando Luz',
                  taxId: paymentData.debitParty?.taxId || '17927237098',
                  bank: paymentData.debitParty?.bank || 'Inova Bank',
                  branch: paymentData.debitParty?.branch || '0001',
                  account: paymentData.debitParty?.account || '42109747'
                },
                creditParty: {
                  name: paymentData.creditParty?.name || 'Beneficiário',
                  taxId: paymentData.creditParty?.taxId || '39064256810',
                  bank: paymentData.creditParty?.bank || 'Banco do Brasil',
                  key: paymentData.creditParty?.key || paymentData.creditParty?.taxId || '39064256810'
                },
                endToEndId: paymentData.endToEndId || paymentData.id,
                remittanceInformation: paymentData.remittanceInformation || 'Transferência PIX'
              }
            }}
          />
        </View>
      </ScrollView>

      {/* Botão de compartilhar */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          icon="share-variant"
          onPress={handleShare}
          loading={loading}
          style={styles.shareButton}
          labelStyle={styles.shareButtonLabel}
        >
          COMPARTILHAR COMPROVANTE
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Dashboard2')}
          style={styles.closeReceiptButton}
          labelStyle={styles.closeReceiptButtonLabel}
        >
          Concluir
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  receiptContainer: {
    backgroundColor: '#FFF',
    minHeight: 100, // Garantir altura mínima para o conteúdo ser visível
    paddingHorizontal: 8, // Adicionar padding horizontal para melhor aparência
    paddingVertical: 16 // Adicionar padding vertical para melhor aparência
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E0E0E0',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  shareButton: {
    marginBottom: 12,
    borderColor: '#E91E63',
    borderWidth: 1,
  },
  shareButtonLabel: {
    color: '#E91E63',
  },
  closeReceiptButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeReceiptButtonLabel: {
    color: '#FFF',
  },
});

export default PixQrCodeReceiptScreen;
