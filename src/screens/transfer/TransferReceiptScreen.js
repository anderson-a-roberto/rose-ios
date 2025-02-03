import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const TransferReceiptScreen = ({ navigation, route }) => {
  const { transferData } = route.params;

  const handleShare = async () => {
    try {
      const message = `Comprovante de Transferência\n\n` +
        `Valor: ${formatCurrency(transferData.valor)}\n` +
        `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n` +
        `Destino:\n` +
        `Nome: ${transferData.destinatario}\n` +
        `Conta: ${transferData.conta}\n` +
        `Status: ${transferData.status === 'PROCESSING' ? 'Em processamento' : 'Concluída'}`;

      await Share.share({
        message,
        title: 'Comprovante de Transferência'
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('Dashboard2')}
        >
          <MaterialCommunityIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Meu Comprovante</Text>

      {/* Receipt Content */}
      <View style={styles.content}>
        <Text style={styles.transactionType}>Transferência Realizada</Text>
        <Text style={styles.amount}>{formatCurrency(transferData.valor)}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>
            {transferData.status === 'PROCESSING' ? 'Em processamento' : 'Concluída'}
          </Text>
        </View>

        {/* Destination Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destino</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{transferData.destinatario}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Conta</Text>
            <Text style={styles.infoValue}>{transferData.conta}</Text>
          </View>
        </View>

        {/* Share Button */}
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.shareButton}
          icon="share-variant"
        >
          <Text style={styles.shareButtonLabel}>Compartilhar comprovante</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  transactionType: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#682145',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#000',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  shareButton: {
    marginTop: 'auto',
    backgroundColor: '#000',
    borderRadius: 25,
  },
  shareButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TransferReceiptScreen;
