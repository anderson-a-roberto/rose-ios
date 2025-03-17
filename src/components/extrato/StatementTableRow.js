import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Função para extrair o nome do destinatário/remetente a partir do clientCode ou description
const getRecipientName = (clientCode, description, movementType) => {
  // Para pagamentos de contas, podemos tentar extrair o nome do beneficiário
  if (movementType === 'BILLPAYMENT' && description) {
    return description;
  }
  
  // Para outros tipos de transação, não exibimos o nome do destinatário
  // já que não temos essa informação de forma confiável
  return '';
};

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

  const isPositive = transaction.balanceType === 'CREDIT';

  // Determinar o tipo de transação e o título correspondente
  let title = '';
  let subtitle = '';
  let transactionType = '';
  
  if (transaction.movementType === 'PIXPAYMENTOUT') {
    title = 'Transferência enviada';
    subtitle = getRecipientName(transaction.clientCode, transaction.description, transaction.movementType);
    transactionType = 'PIX';
  } else if (transaction.movementType === 'PIXPAYMENTIN') {
    title = 'Transferência recebida';
    subtitle = getRecipientName(transaction.clientCode, transaction.description, transaction.movementType);
    transactionType = 'PIX';
  } else if (transaction.movementType === 'BILLPAYMENT') {
    title = 'Pagamento efetuado';
    subtitle = getRecipientName(transaction.clientCode, transaction.description, transaction.movementType);
    transactionType = '';
  } else if (transaction.movementType === 'TEFTRANSFEROUT') {
    title = 'Transferência enviada';
    subtitle = getRecipientName(transaction.clientCode, transaction.description, transaction.movementType);
    transactionType = 'Transferência';
  } else if (transaction.movementType === 'TEFTRANSFERIN') {
    title = 'Transferência recebida';
    subtitle = getRecipientName(transaction.clientCode, transaction.description, transaction.movementType);
    transactionType = 'Transferência';
  } else if (transaction.movementType === 'PIXREVERSALOUT') {
    title = 'Estorno enviado';
    subtitle = getRecipientName(transaction.clientCode, transaction.description, transaction.movementType);
    transactionType = 'PIX';
  } else if (transaction.movementType === 'ENTRYCREDIT') {
    title = 'Crédito recebido';
    subtitle = getRecipientName(transaction.clientCode, transaction.description, transaction.movementType);
    transactionType = '';
  } else {
    title = transaction.description || 'Transação';
    subtitle = getRecipientName(transaction.clientCode, transaction.description, transaction.movementType);
    transactionType = '';
  }

  return (
    <TouchableOpacity onPress={() => onPress(transaction)}>
      <View style={styles.transactionItem}>
        <View style={[styles.transactionTypeContainer, { backgroundColor: isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }]}>
          <MaterialCommunityIcons 
            name={isPositive ? "arrow-down" : "arrow-up"} 
            size={24} 
            color={isPositive ? '#4CAF50' : '#F44336'} 
          />
        </View>
        
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.transactionSubtitle}>{subtitle}</Text> : null}
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionValue}>R$ {transaction.amount.toFixed(2).replace('.', ',')}</Text>
            {transactionType ? <Text style={styles.transactionMethod}>{transactionType}</Text> : null}
          </View>
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    height: 100,
  },
  transactionTypeContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  transactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginRight: 8,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#999999',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999999',
  },
});

export default StatementTableRow;
