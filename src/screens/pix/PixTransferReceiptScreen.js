import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const PixTransferReceiptScreen = ({ navigation, route }) => {
  const { transferData } = route.params;

  const handleShare = async () => {
    try {
      const message = `Comprovante de Transferência PIX\n\n` +
        `Valor: ${formatCurrency(transferData.amount)}\n` +
        `ID: ${transferData.endToEndId}\n` +
        `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n` +
        `Origem:\n` +
        `Nome: ${transferData.debitParty.name}\n` +
        `CPF: ${transferData.debitParty.taxId}\n` +
        `Banco: ${transferData.debitParty.bank}\n\n` +
        `Destino:\n` +
        `Nome: ${transferData.beneficiary.name}\n` +
        `CPF: ${transferData.beneficiary.taxId}\n` +
        `Banco: ${transferData.beneficiary.bank}`;

      await Share.share({
        message,
        title: 'Comprovante PIX'
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('HomePix', { 
            balance: transferData.debitParty.balance || 0 
          })}
        >
          <MaterialCommunityIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Meu Comprovante</Text>

      {/* Receipt Content */}
      <View style={styles.content}>
        <Text style={styles.transactionType}>Transferência Pix Realizada</Text>
        <Text style={styles.amount}>{formatCurrency(transferData.amount)}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID/Transação</Text>
          <View style={styles.infoValueContainer}>
            <Text style={styles.infoValue}>{transferData.endToEndId}</Text>
            <TouchableOpacity>
              <MaterialCommunityIcons name="content-copy" size={20} color="#682145" />
            </TouchableOpacity>
          </View>
        </View>

        {transferData.description && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descrição</Text>
            <Text style={styles.infoValue}>{transferData.description}</Text>
          </View>
        )}

        {/* Origin Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Origem</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{transferData.debitParty.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CPF/CNPJ</Text>
            <Text style={styles.infoValue}>{transferData.debitParty.taxId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Instituição Financeira</Text>
            <Text style={styles.infoValue}>{transferData.debitParty.bank}</Text>
          </View>
        </View>

        {/* Destination Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destino</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{transferData.beneficiary.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CPF/CNPJ</Text>
            <Text style={styles.infoValue}>{transferData.beneficiary.taxId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Instituição Financeira</Text>
            <Text style={styles.infoValue}>{transferData.beneficiary.bank}</Text>
          </View>
        </View>
      </View>

      {/* Share Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.shareButton}
          labelStyle={styles.shareButtonLabel}
        >
          COMPARTILHAR
        </Button>
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionType: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    marginRight: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  shareButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 25,
  },
  shareButtonLabel: {
    fontSize: 16,
    color: '#fff',
  },
});

export default PixTransferReceiptScreen;
