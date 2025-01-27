import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';

const ActionButton = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionButton}>
    <MaterialCommunityIcons name={icon} size={24} color="#FF1493" />
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

const TransactionItem = ({ date, description, value, isPositive }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionLeft}>
      <Text style={styles.transactionDate}>{date}</Text>
      <Text style={styles.transactionDescription}>{description}</Text>
    </View>
    <Text style={[styles.transactionValue, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
      {isPositive ? '+' : '-'}R$ {value}
    </Text>
  </View>
);

const Dashboard2Screen = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const fetchTransactions = async (account, documentNumber) => {
    try {
      // Por enquanto usando datas fixas para teste
      const { data: statementData, error: statementError } = await supabase.functions.invoke('get-account-statement', {
        body: {
          account: account,
          documentNumber: documentNumber,
          dateFrom: '2025-01-19',
          dateTo: '2025-01-24'
        }
      });

      if (statementError) throw statementError;
      
      if (statementData.status === 'SUCCESS' && statementData.body?.movements) {
        setTransactions(statementData.body.movements);
      } else {
        throw new Error('Erro ao obter extrato');
      }

    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Não foi possível carregar o extrato. Tente novamente mais tarde.');
    }
  };

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar CPF do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;

      // Buscar número da conta no kyc_proposals_v2
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycError) throw kycError;

      // Chamar edge function para obter saldo
      const { data: balanceData, error: balanceError } = await supabase.functions.invoke('get-account-balance', {
        body: {
          account: kycData.account,
          documentNumber: profileData.document_number
        }
      });

      if (balanceError) throw balanceError;

      setBalance(balanceData.body.amount);

      // Buscar transações após obter o saldo
      await fetchTransactions(kycData.account, profileData.document_number);

    } catch (err) {
      console.error('Erro ao buscar saldo:', err);
      setError('Não foi possível carregar o saldo. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <MaterialCommunityIcons name="account-circle" size={24} color="#FFF" />
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Boa tarde</Text>
            <Text style={styles.userName}>Usuário</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="menu" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponível</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.balanceValue}>
            R$ {formatCurrency(balance || 0)}
          </Text>
        )}
      </View>

      {/* Action Buttons Grid */}
      <View style={styles.actionGrid}>
        <View style={styles.actionRow}>
          <ActionButton icon="cash-fast" label="PIX" />
          <ActionButton icon="barcode" label="Pagar conta" />
        </View>
        <View style={styles.actionRow}>
          <ActionButton icon="text-box-outline" label="Extrato" />
          <ActionButton icon="bank-transfer" label="Transferir" />
        </View>
        <View style={styles.actionRow}>
          <ActionButton icon="cash-multiple" label="Cobranças" />
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Últimas transações</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color="#FF1493" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              date={new Date(transaction.createDate).toLocaleString('pt-BR')}
              description={transaction.description}
              value={formatCurrency(transaction.amount)}
              isPositive={transaction.balanceType === 'CREDIT'}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF1493',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    marginLeft: 10,
  },
  greetingText: {
    color: '#FFF',
    fontSize: 14,
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
  },
  balanceLabel: {
    color: '#FFF',
    fontSize: 14,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  errorText: {
    color: '#FFB6C1',
    fontSize: 14,
    marginTop: 5,
  },
  actionGrid: {
    padding: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    elevation: 2,
  },
  actionButtonText: {
    color: '#333',
    marginTop: 5,
    fontSize: 12,
  },
  transactionsContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
    marginTop: 10,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FF1493',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Dashboard2Screen;
