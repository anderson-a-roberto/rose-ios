import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Share, Platform, Linking } from 'react-native';
import { Modal, Portal, Button, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../../config/supabase';
import DepositReceipt from './DepositReceipt';
import TransferOutReceipt from './TransferOutReceipt';
import { generateReceiptHtml } from './receiptHtmlGenerator';

const ReceiptModal = ({ visible, onDismiss, transaction }) => {
  const [loading, setLoading] = useState(false);

  const isCredit = (type) => {
    return ['TEFTRANSFERIN', 'ENTRYCREDIT', 'PIXCREDIT'].includes(type);
  };

  const handleDownload = async () => {
    try {
      if (!transaction) return;
      setLoading(true);

      const html = generateReceiptHtml(transaction);
      const { data, error } = await supabase.functions.invoke('html-to-pdf', {
        body: { html }
      });

      if (error) throw error;

      const date = new Date(transaction.createDate).toISOString().slice(0,10);
      const type = isCredit(transaction.movementType) ? 'deposito' : 'transferencia';
      const fileName = `comprovante-${type}-${date}.pdf`;

      // Criar um Blob com o PDF
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (Platform.OS === 'web') {
        // No navegador, abrir em nova aba
        window.open(url, '_blank');
      } else {
        // No mobile, compartilhar
        await Share.share({
          url: url,
          title: `Comprovante de ${type}`,
          message: `Comprovante de ${type} - ${date}`
        });
      }

      // Limpar o URL do objeto
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
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
          {renderReceipt()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleDownload}
            style={styles.button}
            buttonColor="#FF1493"
            icon="file-pdf-box"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Gerando PDF...' : 'Baixar PDF'}
          </Button>

          <Button
            mode="outlined"
            onPress={onDismiss}
            style={[styles.button, styles.closeButton]}
            textColor="#FF1493"
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
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    marginTop: 8,
  },
  closeButton: {
    borderColor: '#FF1493',
  },
});

export default ReceiptModal;
