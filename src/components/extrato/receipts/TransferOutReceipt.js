import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { format } from 'date-fns';

const TransferOutReceipt = ({ transaction }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm");
  };

  const formatValue = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTransactionType = (movementType) => {
    const types = {
      'TEDTRANSFEROUT': 'Transferência entre contas',
      'TEFTRANSFEROUT': 'Transferência entre contas',
      'INTERNALTRANSFER': 'Transferência entre contas',
      'PIXDEBIT': 'PIX Enviado'
    };
    return types[movementType] || 'Transferência entre contas';
  };

  // Determinar o tipo de operação baseado no movementType
  const operationType = "TED ENVIADA";

  return (
    <View style={styles.receiptContainer} id="transfer-out-receipt">
      {/* Header limpo com logo + título */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/logorosa.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Comprovante</Text>
      </View>

      {/* Seção TRANSAÇÃO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRANSAÇÃO</Text>
        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.valueHighlight}>{operationType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.valueMedium}>{formatDate(transaction.createDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.valueBold}>{formatValue(transaction.amount)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.valueMedium, { color: '#4CAF50' }]}>CONFIRMADO</Text>
          </View>
        </View>
      </View>

      {/* Seção DE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DE</Text>
        <Text style={styles.personName}>Banco Rose</Text>
        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Banco:</Text>
            <Text style={styles.valueMedium}>CELCOIN INSTITUICAO DE PAGAMENTO S.A.</Text>
          </View>
        </View>
      </View>

      {/* Seção PARA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PARA</Text>
        {transaction.recipient && transaction.recipient.name && transaction.recipient.name !== `Conta ${transaction.recipient.account}` ? (
          <Text style={styles.personName}>{transaction.recipient.name}</Text>
        ) : (
          <Text style={styles.personName}>Beneficiário</Text>
        )}
        <View style={styles.infoGroup}>
          {transaction.recipient && transaction.recipient.bankName && transaction.recipient.bankName !== 'Banco Inovação' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Banco:</Text>
              <Text style={styles.valueMedium}>{transaction.recipient.bankName}</Text>
            </View>
          )}
          {transaction.recipient && transaction.recipient.documentNumber && transaction.recipient.documentNumber !== '-' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Documento:</Text>
              <Text style={styles.valueMedium}>
                {transaction.recipient.documentNumber ? 
                  `***${transaction.recipient.documentNumber.substring(3, transaction.recipient.documentNumber.length-2)}**` : 
                  '-'}
              </Text>
            </View>
          )}
          {transaction.recipient && transaction.recipient.branch && transaction.recipient.branch !== '0001' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Agência:</Text>
              <Text style={styles.valueMedium}>{transaction.recipient.branch}</Text>
            </View>
          )}
          {transaction.recipient && transaction.recipient.account && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Conta:</Text>
              <Text style={styles.valueMedium}>{transaction.recipient.account}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Seção DETALHES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALHES</Text>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.valueMonospace}>{transaction.id || ''}</Text>
        </View>
        
        {transaction.description && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.valueMedium}>{transaction.description}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  receiptContainer: {
    backgroundColor: '#fff',
    padding: 20, // Padronizado para 20
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    height: 50,
    width: 160,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  infoGroup: {
    marginTop: 4,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  valueMedium: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  valueBold: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  valueHighlight: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  valueMonospace: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'left',
  },
});

export default TransferOutReceipt;
