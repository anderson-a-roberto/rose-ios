import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import StatementForm from '../components/extrato/StatementForm';
import PaymentForm from '../components/payment/PaymentForm';
import TransferForm from '../components/transfer/TransferForm';
import PixOptionsForm from '../components/pix/PixOptionsForm';
import PixKeysForm from '../components/pix/PixKeysForm';

const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
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
  const [showStatement, setShowStatement] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [showPixKeys, setShowPixKeys] = useState(false);

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

  const handleStatementSubmit = async (startDate, endDate) => {
    try {
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

      // Buscar número da conta
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycError) throw kycError;

      // Formatar datas para ISO string (apenas a data, sem hora)
      const dateFrom = startDate.toISOString().split('T')[0];
      const dateTo = endDate.toISOString().split('T')[0];

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
        return { transactions: statementData.body.movements };
      } else {
        throw new Error('Erro ao obter extrato');
      }

    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      return { error: 'Não foi possível carregar o extrato. Tente novamente mais tarde.' };
    }
  };

  const handlePaymentSubmit = async (barcode) => {
    // Implementar lógica de pagamento aqui
    console.log('Pagamento:', barcode);
  };

  const handleTransferSubmit = async (amount, destinationAccount) => {
    // Implementar lógica de transferência aqui
    console.log('Transferência:', { amount, destinationAccount });
  };

  const handlePixTransfer = () => {
    console.log('PIX: Transferir');
  };

  const handlePixReceive = () => {
    console.log('PIX: Receber');
  };

  const handlePixKeys = () => {
    setShowPix(false);
    setShowPixKeys(true);
  };

  const showSection = (section) => {
    setShowStatement(section === 'statement');
    setShowPayment(section === 'payment');
    setShowTransfer(section === 'transfer');
    setShowPix(section === 'pix');
    setShowPixKeys(false);
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
          <ActionButton 
            icon="cash-fast" 
            label="PIX" 
            onPress={() => showSection('pix')}
          />
          <ActionButton 
            icon="barcode" 
            label="Pagar conta" 
            onPress={() => showSection('payment')}
          />
        </View>
        <View style={styles.actionRow}>
          <ActionButton 
            icon="text-box-outline" 
            label="Extrato" 
            onPress={() => showSection('statement')}
          />
          <ActionButton 
            icon="bank-transfer" 
            label="Transferir"
            onPress={() => showSection('transfer')}
          />
        </View>
        <View style={styles.actionRow}>
          <ActionButton icon="cash-multiple" label="Cobranças" />
        </View>
      </View>

      {/* Content Section */}
      <View style={[styles.transactionsContainer, (showStatement || showPayment || showTransfer || showPix || showPixKeys) && styles.contentContainer]}>
        {showPayment ? (
          <PaymentForm onSubmit={handlePaymentSubmit} />
        ) : showStatement ? (
          <StatementForm onSubmit={handleStatementSubmit} />
        ) : showTransfer ? (
          <TransferForm onSubmit={handleTransferSubmit} />
        ) : showPixKeys ? (
          <PixKeysForm />
        ) : showPix ? (
          <PixOptionsForm
            onTransfer={handlePixTransfer}
            onReceive={handlePixReceive}
            onManageKeys={handlePixKeys}
          />
        ) : (
          <>
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
          </>
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
    opacity: 0.8,
  },
  userName: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  balanceLabel: {
    color: '#FFF',
    opacity: 0.8,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  actionGrid: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    width: '40%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    marginTop: 5,
    color: '#333',
  },
  transactionsContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    color: '#666',
    fontSize: 12,
  },
  transactionDescription: {
    color: '#333',
    marginTop: 2,
  },
  transactionValue: {
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
});

export default Dashboard2Screen;
