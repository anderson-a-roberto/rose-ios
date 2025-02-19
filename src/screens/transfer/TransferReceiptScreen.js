import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

      <View ref={receiptRef} collapsable={false} style={styles.content}>
        <Text style={styles.title}>Comprovante</Text>
        <Text style={styles.transactionId}>ID: {transferData.transactionId || '0000000000'}</Text>
        
        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Data e Hora:</Text>
          <Text style={styles.value}>
            {new Date().toLocaleString('pt-BR')}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo de Operação:</Text>
          <Text style={styles.value}>Transferência</Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Valor:</Text>
          <Text style={[styles.value, styles.valueAmount, { color: '#E91E63' }]}>
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

        <View style={styles.infoRow}>
          <Text style={styles.label}>Beneficiário:</Text>
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este documento é uma representação digital de uma transação realizada em nossa plataforma.
          </Text>
          <Text style={styles.footerText}>
            Validação Digital: {transferData.transactionId || '0000000000'}
          </Text>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: '#E0E0E0',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  shareButton: {
    backgroundColor: '#E91E63',
    marginBottom: 12,
  },
  newTransferButton: {
    borderColor: '#E91E63',
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default TransferReceiptScreen;
