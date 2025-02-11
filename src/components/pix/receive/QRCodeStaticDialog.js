import React, { useState } from 'react';
import { View, StyleSheet, Share, Clipboard } from 'react-native';
import { Dialog, Portal, Button, Text, Snackbar } from 'react-native-paper';
import QRCodePlaceholder from './QRCodeCanvas';

export default function QRCodeStaticDialog({ visible, onDismiss, qrData }) {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleCopyCode = async () => {
    try {
      if (qrData?.emvqrcps) {
        await Clipboard.setString(qrData.emvqrcps);
        showSnackbar('Código copiado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      showSnackbar('Erro ao copiar código');
    }
  };

  const handleShare = async () => {
    try {
      if (qrData?.emvqrcps) {
        await Share.share({
          message: `Código PIX: ${qrData.emvqrcps}`,
          title: 'Compartilhar código PIX'
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      showSnackbar('Erro ao compartilhar');
    }
  };

  return (
    <Portal>
      <Dialog 
        visible={visible} 
        onDismiss={onDismiss} 
        style={styles.dialog}
      >
        <Dialog.Title style={styles.title}>QR Code Estático Gerado</Dialog.Title>
        
        <Dialog.Content style={styles.content}>
          <View style={styles.qrContainer}>
            <QRCodePlaceholder size={256} />
          </View>

          <View style={styles.codeContainer}>
            <Text style={styles.code} numberOfLines={3} ellipsizeMode="middle">
              {qrData?.emvqrcps}
            </Text>
          </View>
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <Button 
            onPress={handleShare}
            mode="outlined"
            style={[styles.button, styles.shareButton]}
            labelStyle={styles.shareButtonLabel}
            icon="share-variant"
          >
            Compartilhar
          </Button>
          <Button 
            onPress={handleCopyCode}
            mode="contained"
            style={[styles.button, styles.copyButton]}
            labelStyle={styles.copyButtonLabel}
            icon="content-copy"
          >
            Copiar Código
          </Button>
          <Button 
            onPress={onDismiss}
            textColor="#666"
            style={styles.closeButton}
          >
            Fechar
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
        theme={{ colors: { surface: '#333' } }}
      >
        {snackbarMessage}
      </Snackbar>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 340,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#fff'
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingTop: 16
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8
  },
  qrContainer: {
    marginVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  codeContainer: {
    width: '100%',
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  code: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace'
  },
  actions: {
    flexDirection: 'column',
    padding: 16,
    gap: 8
  },
  button: {
    marginVertical: 4,
    width: '100%',
    borderRadius: 8,
    height: 48
  },
  shareButton: {
    borderColor: '#682145',
    borderWidth: 2
  },
  shareButtonLabel: {
    color: '#682145',
    fontSize: 16,
    fontWeight: '600'
  },
  copyButton: {
    backgroundColor: '#E91E63'
  },
  copyButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  closeButton: {
    marginTop: 4
  },
  snackbar: {
    bottom: 16,
    backgroundColor: '#333'
  }
});
