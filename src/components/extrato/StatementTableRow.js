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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatValue = (value, type) => {
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

    return type === 'CREDIT' ? `${formattedValue}` : `${formattedValue}`;
  };

  const isPositive = transaction.balanceType === 'CREDIT' || transaction.movementType.includes('IN');

  return (
    <TouchableOpacity onPress={() => onPress(transaction)}>
      <View style={styles.transactionItem}>
        <Text style={[styles.transactionType, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
          {isPositive ? '+' : '-'}
        </Text>
        
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>{transaction.description || '-'}</Text>
          <Text style={styles.transactionSubtitle}>
            {formatValue(transaction.amount, transaction.balanceType)} | Usuário
          </Text>
          <Text style={styles.transactionDate}>{formatDate(transaction.createDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    height: 84,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  transactionType: {
    width: 24,
    height: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 16,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999999',
  },
});

export default StatementTableRow;
