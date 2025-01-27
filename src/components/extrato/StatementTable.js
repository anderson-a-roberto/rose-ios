import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import StatementTableHeader from './StatementTableHeader';
import StatementTableRow from './StatementTableRow';
import ReceiptModal from './receipts/ReceiptModal';

const StatementTable = ({ transactions, loading, error }) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF1493" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Nenhuma transação encontrada no período selecionado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatementTableHeader />
      <ScrollView style={styles.scrollView}>
        {transactions.map((transaction, index) => (
          <StatementTableRow
            key={transaction.id || index}
            transaction={transaction}
            onPress={handleTransactionPress}
          />
        ))}
      </ScrollView>

      <ReceiptModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        transaction={selectedTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scrollView: {
    maxHeight: 400,
  },
  centerContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
});

export default StatementTable;
