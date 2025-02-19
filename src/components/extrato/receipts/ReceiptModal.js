import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Modal, Portal, Button } from 'react-native-paper';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DepositReceipt from './DepositReceipt';
import TransferOutReceipt from './TransferOutReceipt';

const ReceiptModal = ({ visible, onDismiss, transaction }) => {
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef();

  const isCredit = (type) => {
    return ['TEFTRANSFERIN', 'ENTRYCREDIT', 'PIXCREDIT'].includes(type);
  };

  const handleShare = async () => {
    try {
      if (!transaction) return;
      setLoading(true);

      // Verifica se o compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo');
        return;
      }

      const date = new Date(transaction.createDate).toISOString().slice(0,10);
      const type = isCredit(transaction.movementType) ? 'deposito' : 'transferencia';
      const fileName = `comprovante-${type}-${date}.jpg`;
      
      // Captura o comprovante como base64
      const uri = await captureRef(receiptRef, {
        format: 'jpg',
        quality: 0.8,
        result: 'base64'
      });

      // Cria um arquivo temporário
      const tempUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(tempUri, uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Compartilha o arquivo
      await Sharing.shareAsync(tempUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Compartilhar Comprovante'
      });

      // Remove o arquivo temporário após compartilhar
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

  const renderReceipt = () => {
    if (!transaction) return null;

    if (isCredit(transaction.movementType)) {
      return <DepositReceipt transaction={transaction} />;
    } else {
      return <TransferOutReceipt transaction={transaction} />;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView style={styles.scrollView}>
          <View ref={receiptRef} collapsable={false} style={styles.receiptContainer}>
            {renderReceipt()}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleShare}
            style={styles.button}
            buttonColor="#E91E63"
            textColor="#FFFFFF"
            icon="share-variant"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Compartilhar Comprovante'}
          </Button>

          <Button
            mode="outlined"
            onPress={onDismiss}
            style={[styles.button, styles.closeButton]}
            textColor="#E91E63"
          >
            Fechar
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  scrollView: {
    padding: 16,
  },
  receiptContainer: {
    backgroundColor: '#fff',
    minHeight: 100,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    marginTop: 8,
  },
  closeButton: {
    borderColor: '#E91E63',
  },
});

export default ReceiptModal;
