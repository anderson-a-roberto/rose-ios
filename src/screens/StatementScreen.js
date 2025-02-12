import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import StatementTableRow from '../components/extrato/StatementTableRow';
import ReceiptModal from '../components/extrato/receipts/ReceiptModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionsQuery } from '../hooks/useTransactionsQuery';
import useDashboard from '../hooks/useDashboard';

export default function StatementScreen({ route }) {
  const navigation = useNavigation();
  const { userAccount, userTaxId } = useDashboard();
  const { balance } = route.params;
  const [showBalance, setShowBalance] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchDates, setSearchDates] = useState({ dateFrom: null, dateTo: null });

  const { 
    data: transactions = [], 
    isLoading: loading,
    error,
    refetch: refetchTransactions
  } = useTransactionsQuery(
    userAccount, 
    userTaxId,
    searchDates.dateFrom,
    searchDates.dateTo
  );

  const formatDate = (text) => {
    const numbers = text.replace(/\D/g, '');
    let formatted = numbers;
    if (numbers.length > 2) formatted = numbers.replace(/^(\d{2})/, '$1/');
    if (numbers.length > 4) formatted = numbers.replace(/^(\d{2})(\d{2})/, '$1/$2/');
    if (numbers.length > 4) {
      formatted = numbers.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
    }
    return formatted;
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, preencha as datas inicial e final');
      return;
    }

    if (startDate.length !== 10 || endDate.length !== 10) {
      alert('Por favor, preencha as datas no formato DD/MM/AAAA');
      return;
    }

    try {
      const parsedStartDate = parseDate(startDate);
      const parsedEndDate = parseDate(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        alert('Data inválida. Use o formato DD/MM/AAAA');
        return;
      }

      if (parsedEndDate < parsedStartDate) {
        alert('A data final não pode ser menor que a data inicial');
        return;
      }

      // Atualizar as datas de busca para disparar uma nova query
      setSearchDates({
        dateFrom: parsedStartDate.toISOString().split('T')[0],
        dateTo: parsedEndDate.toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Erro ao processar datas:', err);
      alert('Erro ao processar as datas. Verifique o formato.');
    }
  };

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const formatValue = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const toggleBalance = () => setShowBalance(!showBalance);

  return (
    <SafeAreaView style={styles.container}>
      {/* Card do Topo */}
      <View style={styles.topCard}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard2')}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Extrato</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Card de Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
          <View style={styles.balanceRow}>
            {showBalance ? (
              <Text style={styles.balanceValue}>
                {formatValue(balance)}
              </Text>
            ) : (
              <View style={styles.hiddenBalanceContainer}>
                {[...Array(5)].map((_, index) => (
                  <View key={index} style={styles.hiddenBalanceDot} />
                ))}
              </View>
            )}
            <TouchableOpacity onPress={toggleBalance}>
              <MaterialCommunityIcons 
                name={showBalance ? "eye" : "eye-off"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <View style={styles.dateInputsRow}>
            <TextInput
              style={styles.dateInput}
              mode="outlined"
              placeholder="Data Inicial"
              value={startDate}
              onChangeText={(text) => setStartDate(formatDate(text))}
              keyboardType="numeric"
              maxLength={10}
              outlineColor="#e92176"
              activeOutlineColor="#e92176"
              textColor="white"
            />
            <TextInput
              style={styles.dateInput}
              mode="outlined"
              placeholder="Data Final"
              value={endDate}
              onChangeText={(text) => setEndDate(formatDate(text))}
              keyboardType="numeric"
              maxLength={10}
              outlineColor="#e92176"
              activeOutlineColor="#e92176"
              textColor="white"
            />
          </View>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.filterButton}
            buttonColor="#e92176"
            labelStyle={styles.filterButtonLabel}
          >
            Filtrar
          </Button>
        </View>
      </View>

      {/* Lista de Transações */}
      <ScrollView style={styles.transactionsContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons 
              name="refresh-circle" 
              size={48} 
              color="#E91E63" 
            />
            <Text style={styles.errorText}>
              Não foi possível carregar o extrato
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refetchTransactions}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color="#E91E63" style={styles.loader} />
        ) : transactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
        ) : (
          transactions.map((transaction, index) => (
            <StatementTableRow
              key={index}
              transaction={transaction}
              onPress={() => handleTransactionPress(transaction)}
            />
          ))
        )}
      </ScrollView>

      <ReceiptModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        transaction={selectedTransaction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topCard: {
    backgroundColor: '#682145',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#682145',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  hiddenBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    justifyContent: 'flex-start',
  },
  hiddenBalanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  filterContainer: {
    paddingHorizontal: 16,
  },
  dateInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#682145',
    height: 40,
  },
  filterButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#e92176',
    width: '100%',
    marginTop: 16,
    marginBottom: 8,
  },
  filterButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  transactionsList: {
    paddingVertical: 16,
  },
});
