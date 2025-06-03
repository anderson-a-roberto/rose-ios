import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import TransferOutReceipt from '../../components/extrato/receipts/TransferOutReceipt';

const TransferReceiptScreen = ({ navigation, route }) => {
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

      const fileName = `comprovante-transferencia-${new Date().toISOString().slice(0,10)}.jpg`;
      
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

  // Removido o método handleNewTransfer para manter consistência com a tela de PIX

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
          {/* Usando o componente TransferOutReceipt para manter consistência com PIX */}
          <TransferOutReceipt 
            transaction={{
              id: transferData.transactionId || transferData.clientRequestId || '0000000000',
              createDate: new Date(),
              amount: transferData.amount || transferData.valor || 0,
              movementType: 'TEDTRANSFEROUT',
              description: transferData.description || transferData.descricao || 'Transferência',
              recipient: {
                name: transferData.destinatario?.nome || `Conta ${transferData.destinationAccount || ''}`,
                documentNumber: transferData.destinatario?.documento || '-',
                bankName: transferData.destinatario?.banco || 'Banco Inovação',
                branch: transferData.destinatario?.agencia || '0001',
                account: transferData.destinatario?.conta || transferData.destinationAccount || ''
              }
            }}
          />
        </View>
      </ScrollView>

      {/* Share Button - Apenas um botão como na tela de PIX */}
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
  }
});

export default TransferReceiptScreen;
