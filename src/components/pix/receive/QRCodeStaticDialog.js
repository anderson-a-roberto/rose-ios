import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Dialog, Portal, Button, Text, Snackbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';

export default function QRCodeStaticDialog({ visible, onDismiss, qrData }) {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleCopyCode = async () => {
    try {
      if (qrData?.emvqrcps) {
        await navigator.clipboard.writeText(qrData.emvqrcps);
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Erro ao copiar código:', error);
    }
  };

  const qrCodeHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
      </head>
      <body style="display: flex; justify-content: center; align-items: center; margin: 0;">
        <div id="qrcode"></div>
        <script type="text/javascript">
          new QRCode(document.getElementById("qrcode"), {
            text: "${qrData?.emvqrcps || ''}",
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
          });
        </script>
      </body>
    </html>
  `;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>QR Code Estático Gerado</Dialog.Title>
        
        <Dialog.Content style={styles.content}>
          <View style={styles.qrContainer}>
            {qrData?.emvqrcps && (
              Platform.OS === 'web' ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: qrCodeHtml 
                  }} 
                  style={{ width: 256, height: 256 }}
                />
              ) : (
                <WebView
                  source={{ html: qrCodeHtml }}
                  style={{ width: 256, height: 256 }}
                />
              )
            )}
          </View>

          <View style={styles.codeContainer}>
            <Text style={styles.code} numberOfLines={3} ellipsizeMode="middle">
              {qrData?.emvqrcps}
            </Text>
          </View>
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
}

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
});
