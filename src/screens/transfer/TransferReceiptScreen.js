import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ReceiptBase from '../../components/receipt/ReceiptBase';

const TransferReceiptScreen = ({ navigation, route }) => {
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

      const fileName = `comprovante-transferencia-${new Date().toISOString().slice(0,10)}.jpg`;
      
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

  const handleNewTransfer = () => {
    navigation.navigate('TransferAmount', { balance: transferData.balance });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
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
          transactionId={transferData.transactionId || '0000000000'}
          timestamp={new Date()}
          operationType="Transferência"
        >
          {/* Valor */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Valor:</Text>
            <Text style={[styles.value, { color: '#E91E63' }]}>
              -R$ {transferData.valor.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>
              {transferData.status === 'PROCESSING' ? 'Em processamento' : 'Concluída'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Beneficiário */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beneficiário</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nome:</Text>
              <Text style={styles.value}>{transferData.destinatario.nome}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>CPF/CNPJ:</Text>
              <Text style={styles.value}>{transferData.destinatario.documento}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Banco:</Text>
              <Text style={styles.value}>{transferData.destinatario.banco}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Agência:</Text>
              <Text style={styles.value}>{transferData.destinatario.agencia}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Conta:</Text>
              <Text style={styles.value}>{transferData.destinatario.conta}</Text>
            </View>
          </View>
        </ReceiptBase>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.shareButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          loading={loading}
          disabled={loading}
          icon="share-variant"
        >
          COMPARTILHAR COMPROVANTE
        </Button>

        <Button
          mode="outlined"
          onPress={handleNewTransfer}
          style={styles.newTransferButton}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: '#E91E63' }]}
        >
          NOVA TRANSFERÊNCIA
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
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  shareButton: {
    backgroundColor: '#E91E63',
    marginBottom: 8,
  },
  newTransferButton: {
    borderColor: '#E91E63',
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  }
});

export default TransferReceiptScreen;
