import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import ReceiptBase from '../../receipt/ReceiptBase';

const TransferOutReceipt = ({ transaction }) => {
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
      'TEDTRANSFEROUT': 'Transferência entre contas',
      'TEFTRANSFEROUT': 'Transferência entre contas',
      'INTERNALTRANSFER': 'Transferência entre contas',
      'PIXDEBIT': 'PIX Enviado'
    };
    return types[movementType] || 'Transferência entre contas';
  };

  const title = 'Comprovante de Transferência Enviada';

  return (
    <ReceiptBase
      transactionId={transaction.id || ''}
      timestamp={transaction.createDate}
      operationType={getTransactionType(transaction.movementType)}
      hideValidation={true}
    >
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
        <Text style={[styles.value, styles.valueNegative]}>
          -{formatValue(transaction.amount)}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>CONFIRMADO</Text>
      </View>

      {transaction.description && (
        <View style={styles.row}>
          <Text style={styles.label}>Descrição:</Text>
          <Text style={styles.value}>{transaction.description}</Text>
        </View>
      )}

      {transaction.recipient && transaction.recipient.account && (
        <View style={styles.recipientInfo}>
          <Text style={styles.sectionTitle}>Dados do Destinatário</Text>
          {transaction.recipient.account && (
            <Text style={styles.value}>Conta: {transaction.recipient.account}</Text>
          )}
          {transaction.recipient.name && transaction.recipient.name !== `Conta ${transaction.recipient.account}` && (
            <Text style={styles.value}>{transaction.recipient.name}</Text>
          )}
          {transaction.recipient.documentNumber && transaction.recipient.documentNumber !== '-' && (
            <Text style={styles.value}>CPF/CNPJ: {transaction.recipient.documentNumber}</Text>
          )}
          {transaction.recipient.bankName && transaction.recipient.bankName !== 'Banco Inovação' && (
            <Text style={styles.value}>Banco: {transaction.recipient.bankName}</Text>
          )}
          {transaction.recipient.branch && transaction.recipient.branch !== '0001' && (
            <Text style={styles.value}>Agência: {transaction.recipient.branch}</Text>
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
  valueNegative: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  recipientInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
});

export default TransferOutReceipt;
