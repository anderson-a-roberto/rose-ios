import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share, StatusBar } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.navigate('Dashboard2')}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Comprovante</Text>
          <Text style={styles.subtitle}>Transferência realizada</Text>
        </View>
      </View>

      {/* Receipt Content */}
      <View style={styles.content}>
        <Text style={styles.amount}>{formatCurrency(transferData.valor)}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.sectionValue}>
            {transferData.status === 'PROCESSING' ? 'Em processamento' : 'Concluída'}
          </Text>
        </View>

        <Divider style={styles.divider} />

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

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data e hora</Text>
          <Text style={styles.sectionValue}>
            {new Date(transferData.data).toLocaleString('pt-BR')}
          </Text>
        </View>
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
        >
          Compartilhar comprovante
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
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 12,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  closeText: {
    color: '#E91E63',
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 40,
  },
  headerContent: {
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginVertical: 32,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 16,
    color: '#000',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
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
    color: '#FFF',
  },
});

export default TransferReceiptScreen;
