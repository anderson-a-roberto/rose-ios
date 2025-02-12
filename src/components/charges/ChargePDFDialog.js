import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Linking } from 'react-native';
import { Dialog, Portal, Button, Text, ActivityIndicator } from 'react-native-paper';
import { WebView } from 'react-native-webview';

export default function ChargePDFDialog({ visible, onDismiss, pdfUrl }) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (visible && Platform.OS !== 'web') {
      handleViewPDF();
    }
  }, [visible]);

  const handleViewPDF = async () => {
    try {
      await Linking.openURL(pdfUrl);
      onDismiss(); // Fecha o dialog após abrir o PDF
    } catch (error) {
      console.error('Erro ao abrir PDF:', error);
    }
  };

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
        await handleViewPDF();
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  // Se for mobile, mostra apenas um loading enquanto abre o PDF
  if (Platform.OS !== 'web') {
    return (
      <Portal>
        <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
          <Dialog.Title>Boleto Gerado</Dialog.Title>
          <Dialog.Content>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.loadingText}>Abrindo PDF...</Text>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    );
  }

  // Versão web continua a mesma
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Boleto Gerado</Dialog.Title>
        
        <Dialog.Content>
          <View style={styles.pdfContainer}>
            <iframe
              src={pdfUrl}
              style={styles.pdfFrame}
              title="PDF Viewer"
            />
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
