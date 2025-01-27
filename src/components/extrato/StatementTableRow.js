import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

const StatementTableRow = ({ transaction, onPress }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value, type) => {
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

    return type === 'CREDIT' ? `+${formattedValue}` : `-${formattedValue}`;
  };

  const getTransactionType = (movementType) => {
    const types = {
      'TEFTRANSFERIN': 'TEF Recebida',
      'TEDTRANSFEROUT': 'TED Enviada',
      'ENTRYCREDIT': 'Crédito',
      'ENTRYDEBIT': 'Débito',
      'PIXCREDIT': 'PIX Recebido',
      'PIXDEBIT': 'PIX Enviado'
    };
    return types[movementType] || movementType;
  };

  return (
    <TouchableOpacity onPress={() => onPress(transaction)}>
      <View style={styles.row}>
        <Text style={[styles.cell, styles.dateCell]}>
          {formatDate(transaction.createDate)}
        </Text>
        <Text style={[styles.cell, styles.descriptionCell]}>
          {transaction.description || '-'}
        </Text>
        <Text style={[styles.cell, styles.typeCell]}>
          {getTransactionType(transaction.movementType)}
        </Text>
        <Text style={[
          styles.cell,
          styles.valueCell,
          { color: transaction.balanceType === 'CREDIT' ? '#4CAF50' : '#F44336' }
        ]}>
          {formatValue(transaction.amount, transaction.balanceType)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  cell: {
    fontSize: 14,
  },
  dateCell: {
    flex: 2,
  },
  descriptionCell: {
    flex: 3,
  },
  typeCell: {
    flex: 2,
  },
  valueCell: {
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
});

export default StatementTableRow;
