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

const PixTransferReceiptScreen = ({ navigation, route }) => {
  const { transferData } = route.params;
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

  // Preparar dados para o comprovante
  const prepareReceiptData = () => {
    // Se temos objeto movement do polling, usar ele
    if (transferData.movement) {
      return {
        transaction: transferData.movement,
        preloadedDetails: {
          status: transferData.movement.status || 'CONFIRMED',
          body: {
            debitParty: {
              name: transferData.debitParty?.name || transferData.movement.pixDetails?.debitParty?.name,
              taxId: transferData.debitParty?.taxId || transferData.movement.pixDetails?.debitParty?.taxId,
              bank: transferData.debitParty?.bank || transferData.movement.pixDetails?.debitParty?.bank,
              branch: transferData.debitParty?.branch || '0001',
              account: transferData.debitParty?.account || transferData.movement.pixDetails?.debitParty?.account
            },
            creditParty: {
              name: transferData.beneficiary?.name || transferData.creditParty?.name,
              taxId: transferData.beneficiary?.taxId || transferData.creditParty?.taxId,
              bank: transferData.beneficiary?.bank || transferData.creditParty?.bank,
              key: transferData.beneficiary?.pixKey || transferData.beneficiary?.taxId || transferData.creditParty?.key
            },
            endToEndId: transferData.movement.endToEndId || transferData.endToEndId,
            remittanceInformation: transferData.description || transferData.movement.description || 'Transferência PIX',
            amount: transferData.amount || transferData.movement.amount,
            ...transferData.movement.pixDetails
          }
        }
      };
    }

    // Fallback para dados antigos (compatibilidade)
    return {
      transaction: {
        id: transferData.endToEndId || transferData.id,
        createDate: transferData.createDate || new Date(),
        amount: transferData.amount,
        movementType: 'PIXPAYMENTOUT',
        celcoinId: transferData.celcoinId,
        endToEndId: transferData.endToEndId
      },
      preloadedDetails: {
        status: transferData.status || 'CONFIRMED',
        body: {
          debitParty: {
            name: transferData.debitParty?.name,
            taxId: transferData.debitParty?.taxId,
            bank: transferData.debitParty?.bank,
            branch: transferData.debitParty?.branch || '0001',
            account: transferData.debitParty?.account || '42109747'
          },
          creditParty: {
            name: transferData.beneficiary?.name || transferData.creditParty?.name,
            taxId: transferData.beneficiary?.taxId || transferData.creditParty?.taxId,
            bank: transferData.beneficiary?.bank || transferData.creditParty?.bank,
            key: transferData.beneficiary?.pixKey || transferData.beneficiary?.taxId || transferData.creditParty?.key
          },
          endToEndId: transferData.endToEndId,
          remittanceInformation: transferData.description || 'Transferência PIX',
          amount: transferData.amount
        }
      }
    };
  };

  const receiptData = prepareReceiptData();

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
            transaction={receiptData.transaction}
            onTransferDetailsLoaded={() => {}}
            preloadedDetails={receiptData.preloadedDetails}
          />
        </View>
      </ScrollView>

      {/* Share Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="share-variant"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'PROCESSANDO...' : 'COMPARTILHAR COMPROVANTE'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

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
    backgroundColor: '#FFF'
  },
  receiptContainer: {
    backgroundColor: '#FFF',
    minHeight: 100, // Garantir altura mínima para o conteúdo ser visível
    paddingHorizontal: 8, // Adicionar padding horizontal para melhor aparência
    paddingVertical: 16 // Adicionar padding vertical para melhor aparência
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
});

export default PixTransferReceiptScreen;
