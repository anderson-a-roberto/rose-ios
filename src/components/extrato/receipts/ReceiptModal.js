import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, Text } from 'react-native';
import { Modal, Portal, Button } from 'react-native-paper';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DepositReceipt from './DepositReceipt';
import TransferOutReceipt from './TransferOutReceipt';
import PixInReceipt from './PixInReceipt';
import PixOutReceipt from './PixOutReceipt';
import BillPaymentReceipt from './BillPaymentReceipt';
import InternalTransferReceipt from './InternalTransferReceipt';
import PixReversalModal from '../../pix/reversal/PixReversalModal';

const ReceiptModal = ({ visible, onDismiss, transaction }) => {
  const [loading, setLoading] = useState(false);
  const [showReversalConfirm, setShowReversalConfirm] = useState(false);
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);
  const receiptRef = useRef();

  const isCredit = (type) => {
    return ['TEFTRANSFERIN', 'ENTRYCREDIT', 'PIXCREDIT', 'PIXPAYMENTIN'].includes(type);
  };

  const isInternalTransfer = (transaction) => {
    return transaction.movementType?.includes('INTERNALTRANSFER') || 
           transaction.description?.includes('Transferncia interna');
  };

  const canBeReversed = transaction?.movementType === 'PIXPAYMENTIN' && 
    transaction?.balanceType === 'CREDIT' &&
    transferDetails?.requestBody?.endToEndId;

  const handleTransferDetailsLoaded = useCallback((details) => {
    setTransferDetails(details);
  }, []);

  const handleRequestReversal = () => {
    if (!transferDetails?.requestBody?.endToEndId) {
      Alert.alert('Erro', 'Dados da transação não disponíveis');
      return;
    }
    setShowReversalConfirm(true);
  };

  const handleConfirmReversal = () => {
    setShowReversalConfirm(false);
    setShowReversalModal(true);
  };

  const handleReversalComplete = () => {
    setShowReversalModal(false);
    onDismiss();
  };

  const handleShare = async () => {
    try {
      if (!transaction) return;
      setLoading(true);


      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo');
        return;
      }

      const date = new Date(transaction.createDate).toISOString().slice(0,10);
      const type = isCredit(transaction.movementType) ? 'deposito' : 'transferencia';
      const fileName = `comprovante-${type}-${date}.jpg`;
      

      const uri = await captureRef(receiptRef, {
        format: 'jpg',
        quality: 0.8,
        result: 'base64',
        height: 1500 // Altura suficiente para capturar todo o conteúdo
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

  const renderReceipt = () => {
    if (!transaction) return null;

    if (isInternalTransfer(transaction)) {
      return (
        <InternalTransferReceipt 
          transaction={transaction}
          onTransferDetailsLoaded={handleTransferDetailsLoaded}
        />
      );
    }

    if (transaction.movementType === 'PIXPAYMENTIN') {
      return (
        <PixInReceipt 
          transaction={transaction}
          onTransferDetailsLoaded={handleTransferDetailsLoaded}
        />
      );
    }

    if (transaction.movementType === 'PIXPAYMENTOUT') {
      return (
        <PixOutReceipt 
          transaction={transaction}
          onTransferDetailsLoaded={handleTransferDetailsLoaded}
        />
      );
    }

    if (transaction.movementType === 'BILLPAYMENT') {
      return (
        <BillPaymentReceipt 
          transaction={transaction}
          onPaymentDetailsLoaded={handleTransferDetailsLoaded}
        />
      );
    }

    if (isCredit(transaction.movementType)) {
      return <DepositReceipt transaction={transaction} />;
    } else {
      return <TransferOutReceipt transaction={transaction} />;
    }
  };

  const renderReversalConfirm = () => {
    if (!showReversalConfirm) return null;

    return (
      <Portal>
        <Modal
          visible={showReversalConfirm}
          onDismiss={() => setShowReversalConfirm(false)}
          contentContainerStyle={styles.confirmModal}
        >
          <View style={styles.confirmContent}>
            <Text style={styles.confirmTitle}>Confirmar Devolução</Text>
            <Text style={styles.confirmText}>
              Deseja realmente devolver este PIX?
            </Text>
            <View style={styles.confirmButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowReversalConfirm(false)}
                style={[styles.confirmButton, styles.cancelButton]}
                textColor="#E91E63"
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmReversal}
                style={styles.confirmButton}
                buttonColor="#E91E63"
                textColor="#FFFFFF"
              >
                Confirmar
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    );
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
          {canBeReversed && (
            <Button
              mode="contained"
              onPress={handleRequestReversal}
              style={styles.button}
              buttonColor="#E91E63"
              textColor="#FFFFFF"
              icon="rotate-left"
            >
              Devolver
            </Button>
          )}

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
      {renderReversalConfirm()}
      <PixReversalModal
        visible={showReversalModal}
        onDismiss={handleReversalComplete}
        endToEndId={transferDetails?.requestBody?.endToEndId}
        amount={transaction?.amount || 0}
      />
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 4,
    maxHeight: '85%', // Aumentar um pouco a altura máxima para mostrar mais conteúdo
    overflow: 'hidden',
  },
  scrollView: {
    padding: 0, // Remover padding desnecessário
  },
  receiptContainer: {
    backgroundColor: '#fff',
    paddingBottom: 0, // Remover padding inferior desnecessário
  },
  buttonContainer: {
    padding: 12, // Padding lateral e superior
    paddingBottom: 0, // Remover padding inferior
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    marginTop: 4, // Margem superior entre botões
    marginBottom: 4, // Margem inferior entre botões
    borderRadius: 4,
  },
  closeButton: {
    borderColor: '#E91E63',
    borderWidth: 1,
    marginBottom: 0, // Remover margem inferior do último botão
  },
  confirmModal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 4,
    padding: 24,
  },
  confirmContent: {
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  confirmText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 4,
  },
  cancelButton: {
    borderColor: '#E91E63',
    borderWidth: 1,
  },
});

export default ReceiptModal;
