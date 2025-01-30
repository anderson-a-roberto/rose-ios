import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import StatementForm from '../components/extrato/StatementForm';
import PaymentForm from '../components/payment/PaymentForm';
import TransferForm from '../components/transfer/TransferForm';
import PixOptionsForm from '../components/pix/PixOptionsForm';
import PixKeysForm from '../components/pix/PixKeysForm';
import PixTransferForm from '../components/pix/transfer/PixTransferForm';
import PixReceiveForm from '../components/pix/receive/PixReceiveForm';
import ChargesOptionsForm from '../components/charges/ChargesOptionsForm';
import CreateChargeForm from '../components/charges/CreateChargeForm';
import ManageChargesForm from '../components/charges/ManageChargesForm';
import useDashboard from '../hooks/useDashboard';
import ProfileSettingsForm from '../components/profile/ProfileSettingsForm';

const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionButtonText}>{label}</Text>
    <View style={styles.actionButtonIconContainer}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color="#FFFFFF" 
      />
    </View>
  </TouchableOpacity>
);

const formatValue = (value, type) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

  return type === 'CREDIT' ? `${formattedValue}` : `${formattedValue}`;
};

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

const TransactionItem = ({ date, description, value, isPositive, movementType }) => (
  <View style={styles.transactionItem}>
    <Text style={[styles.transactionType, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
      {isPositive ? '+' : '-'}
    </Text>
    
    <View style={styles.transactionContent}>
      <Text style={styles.transactionTitle}>{description}</Text>
      <Text style={styles.transactionSubtitle}>
        {formatValue(value, isPositive ? 'CREDIT' : 'DEBIT')} | Usuário
      </Text>
      <Text style={styles.transactionDate}>{formatDate(date)}</Text>
    </View>
  </View>
);

export default function Dashboard2Screen({ navigation }) {
  const { userAccount, userTaxId } = useDashboard();
  const [balance, setBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showStatement, setShowStatement] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [showPixKeys, setShowPixKeys] = useState(false);
  const [showPixTransfer, setShowPixTransfer] = useState(false);
  const [showPixReceive, setShowPixReceive] = useState(false);
  const [showCharges, setShowCharges] = useState(false);
  const [showCreateCharge, setShowCreateCharge] = useState(false);
  const [showManageCharges, setShowManageCharges] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('Usuário');

  const menuItems = [
    { id: 'pix', icon: 'bank-transfer', label: 'Pix', onPress: () => navigation.navigate('HomePix', { balance }) },
    { id: 'transfer', icon: 'transfer', label: 'Transferir', onPress: () => navigation.navigate('TransferAmount', { balance }) },
    { id: 'payment', icon: 'barcode', label: 'Pagar Conta', onPress: () => navigation.navigate('PayBill', { balance }) },
    { id: 'statement', icon: 'text-box-outline', label: 'Extrato', onPress: () => navigation.navigate('Statement', { balance }) },
    { id: 'charges', icon: 'cash-multiple', label: 'Cobranças', onPress: () => navigation.navigate('Charges') },
  ];

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
        console.log('Primeira transação:', statementData.body.movements[0]);
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
    setShowStatement(false);
    setShowPayment(false);
    setShowTransfer(false);
    setShowPix(false);
    setShowPixKeys(false);
    setShowPixTransfer(false);
    setShowPixReceive(false);
    setShowCharges(false);
    setShowCreateCharge(false);
    setShowManageCharges(false);
    setShowSettings(false);

    switch (section) {
      case 'statement':
        setShowStatement(true);
        break;
      case 'payment':
        setShowPayment(true);
        break;
      case 'transfer':
        setShowTransfer(true);
        break;
      case 'pix':
        setShowPix(true);
        break;
      case 'pixKeys':
        setShowPixKeys(true);
        break;
      case 'pixTransfer':
        setShowPixTransfer(true);
        break;
      case 'pixReceive':
        setShowPixReceive(true);
        break;
      case 'charges':
        setShowCharges(true);
        break;
      case 'createCharge':
        setShowCreateCharge(true);
        break;
      case 'manageCharges':
        setShowManageCharges(true);
        break;
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

  const loadUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    } catch (error) {
      console.error('Erro ao carregar nome do usuário:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
    loadUserName();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>OLÁ, {userName.toUpperCase()}</Text>
            <Text style={styles.accountInfo}>Agência: {userAccount?.substring(0, 4) || '----'} | Conta: {userAccount?.substring(4) || '----'}</Text>
          </View>
        </View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>nk</Text>
        </View>
      </View>

      {/* Frame do Saldo */}
      <View style={styles.balanceFrame}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceValueContainer}>
              {showBalance ? (
                <Text style={styles.balanceValue}>
                  {balance ? formatValue(balance) : 'R$ 0,00'}
                </Text>
              ) : (
                <View style={styles.hiddenBalanceContainer}>
                  {[...Array(5)].map((_, index) => (
                    <View key={index} style={styles.hiddenBalanceDot} />
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <MaterialCommunityIcons 
                name={showBalance ? "eye" : "eye-off"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addBalanceButton}>
            <Text style={styles.addBalanceText}>+ ADICIONAR SALDO</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsContainer}>
        <FlatList
          data={menuItems}
          renderItem={({ item }) => (
            <ActionButton
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
            />
          )}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={116} // 111 (width) + 5 (gap)
          decelerationRate="fast"
          contentContainerStyle={styles.actionsList}
        />
      </View>

      {/* Transactions Section */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Últimas Transações</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#682145" />
          </View>
        ) : (
          <ScrollView>
            {transactions.map((transaction, index) => (
              <TransactionItem
                key={index}
                date={transaction.createDate}
                description={transaction.description}
                value={transaction.amount}
                isPositive={transaction.movementType.includes('CREDIT') || transaction.movementType.includes('IN')}
                movementType={transaction.movementType}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Forms */}
      {showPayment ? (
        <PaymentForm onBack={() => showSection(null)} onSubmit={handlePaymentSubmit} />
      ) : showStatement ? (
        <StatementForm onBack={() => showSection(null)} onSubmit={handleStatementSubmit} />
      ) : showTransfer ? (
        <TransferForm onBack={() => showSection(null)} onSubmit={handleTransferSubmit} />
      ) : showPixKeys ? (
        <PixKeysForm onBack={() => showSection('pix')} />
      ) : showPixTransfer ? (
        <PixTransferForm 
          onBack={() => showSection('pix')} 
          userAccount={userAccount}
          userTaxId={userTaxId}
        />
      ) : showPixReceive ? (
        <PixReceiveForm onBack={() => showSection('pix')} />
      ) : showCharges ? (
        <ChargesOptionsForm 
          onBack={() => showSection(null)}
          onCreate={() => showSection('createCharge')}
          onManage={() => showSection('manageCharges')}
        />
      ) : showCreateCharge ? (
        <CreateChargeForm onBack={() => showSection('charges')} />
      ) : showManageCharges ? (
        <ManageChargesForm onBack={() => showSection('charges')} />
      ) : showPix ? (
        <PixOptionsForm
          onTransfer={() => showSection('pixTransfer')}
          onReceive={() => showSection('pixReceive')}
          onKeys={() => showSection('pixKeys')}
        />
      ) : (
        <></>
      )}
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  userDetails: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountInfo: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
  },
  logo: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#682145',
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceFrame: {
    width: 343,
    height: 130,
    alignSelf: 'center',
  },
  balanceContainer: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 16,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginLeft: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    marginTop: 4,
    height: 48,
  },
  balanceValueContainer: {
    width: 190,
    height: 48,
    marginLeft: 16,
    justifyContent: 'center',
  },
  balanceValue: {
    color: '#FFFFFF',
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
  addBalanceButton: {
    width: 144,
    height: 36,
    marginLeft: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBalanceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    height: 130,
    marginBottom: 30,
  },
  actionsList: {
    paddingHorizontal: 20,
    gap: 5,
  },
  actionButton: {
    backgroundColor: 'rgba(104, 33, 69, 0.3)',
    borderRadius: 12,
    padding: 16,
    width: 111,
    height: 130,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonIconContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    padding: 20,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    height: 84,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});
