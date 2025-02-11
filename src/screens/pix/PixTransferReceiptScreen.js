import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share, StatusBar, ScrollView } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.navigate('HomePix', { 
                balance: transferData.debitParty.balance || 0 
              })}
            >
              <Text style={styles.closeText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Comprovante</Text>
            <Text style={styles.subtitle}>Transferência realizada com sucesso</Text>
          </View>
        </View>

        {/* Receipt Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountValue}>{formatCurrency(transferData.amount)}</Text>
            <Text style={styles.amountLabel}>Transferência PIX</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID/Transação</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{transferData.endToEndId}</Text>
                <TouchableOpacity style={styles.copyButton}>
                  <MaterialCommunityIcons name="content-copy" size={20} color="#E91E63" />
                </TouchableOpacity>
              </View>
            </View>

            {transferData.description && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Descrição</Text>
                <Text style={styles.infoValue}>{transferData.description}</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

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
              <Text style={styles.infoLabel}>Instituição</Text>
              <Text style={styles.infoValue}>{transferData.debitParty.bank}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

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
              <Text style={styles.infoLabel}>Instituição</Text>
              <Text style={styles.infoValue}>{transferData.beneficiary.bank}</Text>
            </View>
          </View>
        </ScrollView>

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
            COMPARTILHAR COMPROVANTE
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
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
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
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
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountValue: {
    fontSize: 32,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
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

export default PixTransferReceiptScreen;
