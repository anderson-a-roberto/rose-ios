import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import ReceiptBase from './ReceiptBase';

const DepositReceipt = ({ transaction }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatValue = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTransactionType = (movementType) => {
    const types = {
      'TEFTRANSFERIN': 'Transferência TEF Recebida',
      'ENTRYCREDIT': 'Depósito',
      'PIXCREDIT': 'PIX Recebido'
    };
    return types[movementType] || movementType;
  };

  return (
    <ReceiptBase transactionId={transaction.id}>
      <View style={styles.row}>
        <Text style={styles.label}>Data e Hora:</Text>
        <Text style={styles.value}>{formatDate(transaction.createDate)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Tipo de Operação:</Text>
        <Text style={styles.value}>{getTransactionType(transaction.movementType)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Valor:</Text>
        <Text style={[styles.value, styles.valuePositive]}>
          +{formatValue(transaction.amount)}
        </Text>
      </View>

      {transaction.description && (
        <View style={styles.row}>
          <Text style={styles.label}>Descrição:</Text>
          <Text style={styles.value}>{transaction.description}</Text>
        </View>
      )}

      {transaction.sender && (
        <View style={styles.senderInfo}>
          <Text style={styles.sectionTitle}>Dados do Remetente</Text>
          <Text style={styles.value}>{transaction.sender.name}</Text>
          <Text style={styles.value}>CPF/CNPJ: {transaction.sender.documentNumber}</Text>
          {transaction.sender.bankName && (
            <Text style={styles.value}>Banco: {transaction.sender.bankName}</Text>
          )}
        </View>
      )}
    </ReceiptBase>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  valuePositive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  senderInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
});

export default DepositReceipt;
