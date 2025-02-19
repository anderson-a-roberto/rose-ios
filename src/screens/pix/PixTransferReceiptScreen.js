import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ReceiptBase from '../../components/receipt/ReceiptBase';
import MoneyValue from '../../components/receipt/MoneyValue';

const PixTransferReceiptScreen = ({ navigation, route }) => {
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

      const fileName = `comprovante-pix-${new Date().toISOString().slice(0,10)}.jpg`;
      
      const uri = await captureRef(receiptRef, {
        format: 'jpg',
        quality: 0.8,
        result: 'base64'
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

      <View ref={receiptRef} collapsable={false} style={styles.container}>
        <ReceiptBase
          transactionId={transferData.endToEndId}
          timestamp={new Date()}
          operationType="Transferência PIX"
        >
          {/* Valor */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Valor:</Text>
            <MoneyValue value={-transferData.amount} />
          </View>

          <Divider style={styles.divider} />

          {/* Descrição (se houver) */}
          {transferData.description && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Descrição:</Text>
                <Text style={styles.value}>{transferData.description}</Text>
              </View>
              <Divider style={styles.divider} />
            </>
          )}

          {/* Origem */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Origem</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nome:</Text>
              <Text style={styles.value}>{transferData.debitParty.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>CPF/CNPJ:</Text>
              <Text style={styles.value}>{transferData.debitParty.taxId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Instituição:</Text>
              <Text style={styles.value}>{transferData.debitParty.bank}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Destino */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destino</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nome:</Text>
              <Text style={styles.value}>{transferData.beneficiary.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>CPF/CNPJ:</Text>
              <Text style={styles.value}>{transferData.beneficiary.taxId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Instituição:</Text>
              <Text style={styles.value}>{transferData.beneficiary.bank}</Text>
            </View>
          </View>
        </ReceiptBase>
      </View>

      {/* Share Button */}
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 16,
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
  },
});

export default PixTransferReceiptScreen;
