import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import StatementTableRow from '../components/extrato/StatementTableRow';
import ReceiptModal from '../components/extrato/receipts/ReceiptModal';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatementScreen({ route }) {
  const navigation = useNavigation();
  const { balance } = route.params;
  const [showBalance, setShowBalance] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Buscar usuário logado
      const { data: { user } } = await supabase.auth.getUser();

      // Buscar CPF do usuário
      const { data: profileData } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();

      // Buscar número da conta
      const { data: kycData } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Buscar extrato
      const { data: statementData, error: statementError } = await supabase.functions.invoke('get-account-statement', {
        body: {
          account: kycData.account,
          documentNumber: profileData.document_number,
          dateFrom: '',
          dateTo: ''
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
    } finally {
      setLoading(false);
    }
  };

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

      setLoading(true);

      // Buscar usuário logado
      const { data: { user } } = await supabase.auth.getUser();

      // Buscar CPF do usuário
      const { data: profileData } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();

      // Buscar número da conta
      const { data: kycData } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Formatar datas para ISO string (apenas a data, sem hora)
      const dateFrom = parsedStartDate.toISOString().split('T')[0];
      const dateTo = parsedEndDate.toISOString().split('T')[0];

      // Buscar extrato
      const { data: statementData, error: statementError } = await supabase.functions.invoke('get-account-statement', {
        body: {
          account: kycData.account,
          documentNumber: profileData.document_number,
          dateFrom,
          dateTo
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
    } finally {
      setLoading(false);
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
              theme={{
                colors: {
                  background: '#682145',
                  placeholder: '#e92176',
                  text: 'white',
                  onSurfaceVariant: 'white'
                },
                roundness: 25,
              }}
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
              theme={{
                colors: {
                  background: '#682145',
                  placeholder: '#e92176',
                  text: 'white',
                  onSurfaceVariant: 'white'
                },
                roundness: 25,
              }}
            />
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.searchButton}
              buttonColor="#e92176"
              textColor="white"
              loading={loading}
            >
              Buscar
            </Button>
          </View>
        </View>
      </View>

      {/* Lista de Transações */}
      <View style={styles.transactionsContainer}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#682145" />
          </View>
        ) : (
          <ScrollView>
            {transactions.map((transaction, index) => (
              <StatementTableRow
                key={transaction.id || index}
                transaction={transaction}
                onPress={handleTransactionPress}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <ReceiptModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        transaction={selectedTransaction}
      />
    </SafeAreaView>
  );
};

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
  searchButton: {
    height: 40,
    justifyContent: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
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
  hiddenBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hiddenBalanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
});
