import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text, Snackbar } from 'react-native-paper';
import QRCodeImage from './QRCodeCanvas';

const QRCodeDynamicDialog = ({ visible, onDismiss, qrData }) => {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleCopyCode = async () => {
    try {
      const emvqrcps = qrData?.body?.body?.dynamicBRCodeData?.emvqrcps;
      if (emvqrcps) {
        await navigator.clipboard.writeText(emvqrcps);
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Erro ao copiar código:', error);
    }
  };

  const formatExpirationDate = (date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const emvqrcps = qrData?.body?.body?.dynamicBRCodeData?.emvqrcps;
  const dueDate = qrData?.body?.body?.calendar?.dueDate;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>QR Code Dinâmico Gerado</Dialog.Title>
        
        <Dialog.Content style={styles.content}>
          <View style={styles.qrContainer}>
            {emvqrcps && (
              <QRCodeImage
                value={emvqrcps}
                size={256}
              />
            )}
          </View>

          <View style={styles.codeContainer}>
            <Text style={styles.code} numberOfLines={3} ellipsizeMode="middle">
              {emvqrcps}
            </Text>
          </View>

          {dueDate && (
            <View style={styles.expirationContainer}>
              <Text style={styles.expirationText}>
                Expira em: {formatExpirationDate(dueDate)}
              </Text>
            </View>
          )}
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={handleCopyCode}>Copiar Código</Button>
          <Button onPress={onDismiss}>Fechar</Button>
        </Dialog.Actions>
      </Dialog>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Código copiado com sucesso!
      </Snackbar>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 340,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  qrContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  codeContainer: {
    width: '100%',
    marginVertical: 8,
  },
  code: {
    textAlign: 'center',
    fontSize: 12,
  },
  expirationContainer: {
    marginTop: 8,
  },
  expirationText: {
    fontSize: 12,
    color: '#666',
  },
});

export default QRCodeDynamicDialog;
