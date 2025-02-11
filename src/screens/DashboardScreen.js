import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#FF00FF" />
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

const TransactionItem = ({ description, date, amount }) => (
  <View style={styles.transactionItem}>
    <View>
      <Text style={styles.transactionDescription}>{description}</Text>
      <Text style={styles.transactionDate}>{date}</Text>
    </View>
    <Text style={[
      styles.transactionAmount,
      { color: amount.startsWith('-') ? '#FF0000' : '#00AA00' }
    ]}>
      {amount}
    </Text>
  </View>
);

const DashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#682145" barStyle="light-content" />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Boa tarde</Text>
            <Text style={styles.userName}>Maria</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponível</Text>
          <Text style={styles.balanceValue}>R$ 0,00</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsRow}>
            <ActionButton icon="qr-code-outline" label="PIX" />
            <ActionButton icon="document-text-outline" label="Pagar conta" />
          </View>
          <View style={styles.actionButtonsRow}>
            <ActionButton icon="document-outline" label="Extrato" />
            <ActionButton icon="arrow-redo-outline" label="Transferir" />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.transactionsTitle}>Últimas transações</Text>
          <TransactionItem
            description="PIX recebido - João Silva"
            date="19/03/2024"
            amount="R$ 150,00"
          />
          <TransactionItem
            description="Conta de luz"
            date="18/03/2024"
            amount="-R$ 245,90"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#682145',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    color: '#FFF',
    fontSize: 16,
  },
  userName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: '#FF00FF',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLabel: {
    color: '#FFF',
    fontSize: 16,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  actionButtonsContainer: {
    padding: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  actionButtonText: {
    color: '#000',
    marginTop: 8,
    fontSize: 14,
  },
  transactionsContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF00FF',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DashboardScreen;
