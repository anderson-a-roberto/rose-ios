import React, { useState } from 'react';
import { View, StyleSheet, Platform, Linking } from 'react-native';
import { Dialog, Portal, Button, Text, ActivityIndicator } from 'react-native-paper';
import { WebView } from 'react-native-webview';

export default function ChargePDFDialog({ visible, onDismiss, pdfUrl }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      if (Platform.OS === 'web') {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `boleto-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        await Linking.openURL(pdfUrl);
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Boleto Gerado</Dialog.Title>
        
        <Dialog.Content>
          <View style={styles.pdfContainer}>
            {Platform.OS === 'web' ? (
              <iframe
                src={pdfUrl}
                style={styles.pdfFrame}
                title="PDF Viewer"
              />
            ) : (
              <WebView
                source={{ uri: pdfUrl }}
                style={styles.pdfFrame}
              />
            )}
          </View>
        </Dialog.Content>

        <Dialog.Actions>
          <Button 
            onPress={handleDownload}
            loading={downloading}
            disabled={downloading}
          >
            Baixar PDF
          </Button>
          <Button onPress={onDismiss}>Fechar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 600,
    width: '90%',
    alignSelf: 'center',
  },
  pdfContainer: {
    width: '100%',
    height: 500,
    marginVertical: 16,
  },
  pdfFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});
