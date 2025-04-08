import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Share } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import PixCopyPasteReceipt from './PixCopyPasteReceipt';

const PixReceiptModal = ({ visible, onClose, paymentResult, emvData, dictData }) => {
  const handleShare = async () => {
    try {
      // Formatar os dados do recibo para compartilhamento
      const receiptDate = new Date().toLocaleDateString('pt-BR');
      const receiptTime = new Date().toLocaleTimeString('pt-BR');
      
      const message = `Comprovante de Pagamento PIX\n\n` +
        `Data: ${receiptDate} às ${receiptTime}\n` +
        `Valor: ${formatValue(emvData?.transactionAmount || paymentResult?.data?.amount || 0)}\n` +
        `Destinatário: ${dictData?.name || 'Não informado'}\n` +
        `CPF/CNPJ: ${formatDocument(dictData?.documentnumber) || 'Não informado'}\n` +
        `Banco: ${dictData?.participantname || dictData?.participant || 'Não informado'}\n` +
        `ID da transação: ${paymentResult?.data?.transactionId || 'Não disponível'}\n\n` +
        `Pagamento realizado com sucesso através do aplicativo.`;

      await Share.share({
        message,
        title: 'Comprovante de Pagamento PIX',
      });
    } catch (error) {
      console.error('Erro ao compartilhar recibo:', error);
    }
  };

  // Formata o valor para exibição
  const formatValue = (value) => {
    if (!value) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  // Formata CPF/CNPJ
  const formatDocument = (doc) => {
    if (!doc) return '';
    
    // CPF
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // CNPJ
    else if (doc.length === 14) {
      return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return doc;
  };

  if (!visible || !paymentResult) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pagamento Realizado</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
              <Text style={styles.successText}>Pagamento realizado com sucesso!</Text>
            </View>
            
            <View style={styles.receiptContainer}>
              <PixCopyPasteReceipt 
                paymentResult={paymentResult}
                emvData={emvData}
                dictData={dictData}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={handleShare}
              style={styles.shareButton}
              icon="share-variant"
              textColor="#E91E63"
              buttonColor="#FFF"
              contentStyle={styles.buttonContent}
            >
              Compartilhar
            </Button>
            <Button
              mode="contained"
              onPress={onClose}
              style={styles.closeReceiptButton}
              buttonColor="#E91E63"
              textColor="#FFF"
              contentStyle={styles.buttonContent}
            >
              Concluir
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '70%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  receiptContainer: {
    marginVertical: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  shareButton: {
    flex: 1,
    marginRight: 12,
    borderColor: '#E91E63',
    borderWidth: 1,
    borderRadius: 4,
  },
  closeReceiptButton: {
    flex: 1,
    borderRadius: 4,
  },
  buttonContent: {
    height: 48,
    paddingVertical: 8,
  },
});

export default PixReceiptModal;
