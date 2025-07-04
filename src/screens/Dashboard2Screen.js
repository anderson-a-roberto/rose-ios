import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Dimensions, Image, StatusBar } from 'react-native';
import { Text, Menu } from 'react-native-paper';
import { normalize, FontSizes, Spacing } from '../utils/scaling';
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
import { useBalanceQuery } from '../hooks/useBalanceQuery';
import { useTransactionsQuery } from '../hooks/useTransactionsQuery';
import ProfileSettingsForm from '../components/profile/ProfileSettingsForm';
import ReceiptModal from '../components/extrato/receipts/ReceiptModal';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const TransactionItem = ({ date, description, value, isPositive, movementType, onPress, clientCode }) => {
  // Determinar o tipo de transação e o título correspondente
  let title = '';
  let subtitle = '';
  let transactionType = '';
  
  if (movementType === 'PIXPAYMENTOUT') {
    title = 'Transferência enviada';
    subtitle = getRecipientName(clientCode, description, movementType);
    transactionType = 'PIX';
  } else if (movementType === 'PIXPAYMENTIN') {
    title = 'Transferência recebida';
    subtitle = getRecipientName(clientCode, description, movementType);
    transactionType = 'PIX';
  } else if (movementType === 'BILLPAYMENT') {
    title = 'Pagamento efetuado';
    subtitle = getRecipientName(clientCode, description, movementType);
    transactionType = '';
  } else if (movementType === 'TEFTRANSFEROUT') {
    title = 'Transferência enviada';
    subtitle = getRecipientName(clientCode, description, movementType);
    transactionType = 'Transferência';
  } else if (movementType === 'TEFTRANSFERIN') {
    title = 'Transferência recebida';
    subtitle = getRecipientName(clientCode, description, movementType);
    transactionType = 'Transferência';
  } else if (movementType === 'PIXREVERSALOUT') {
    title = 'Estorno enviado';
    subtitle = getRecipientName(clientCode, description, movementType);
    transactionType = 'PIX';
  } else if (movementType === 'ENTRYCREDIT') {
    title = 'Crédito recebido';
    subtitle = getRecipientName(clientCode, description, movementType);
    transactionType = '';
  } else {
    title = description || 'Transação';
    subtitle = getRecipientName(clientCode, description, movementType);
    transactionType = '';
  }

  return (
    <TouchableOpacity style={styles.transactionItem} onPress={onPress}>
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
          <Text style={styles.transactionValue}>R$ {value.toFixed(2).replace('.', ',')}</Text>
          {transactionType ? <Text style={styles.transactionMethod}>{transactionType}</Text> : null}
        </View>
        <Text style={styles.transactionDate}>{formatDate(date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function Dashboard2Screen({ navigation }) {
  const { userAccount, userTaxId } = useDashboard();
  const { 
    data: balance, 
    isLoading: balanceLoading, 
    error: balanceError,
    refetch: refetchBalance
  } = useBalanceQuery();
  const { 
    data, 
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useTransactionsQuery(userAccount, userTaxId);
  
  // Extrair as transações do objeto data
  const transactions = data?.data || [];

  const [showBalance, setShowBalance] = useState(true);
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const menuItems = [
    { id: 'pix', icon: 'bank-transfer', label: 'Pix', onPress: () => navigation.navigate('HomePix', { balance }) },
    { id: 'statement', icon: 'text-box-outline', label: 'Extrato', onPress: () => navigation.navigate('Statement', { balance }) },
    { id: 'payment', icon: 'barcode', label: 'Pagar Boleto', onPress: () => navigation.navigate('PayBill', { balance }) },
    { id: 'transfer', icon: 'transfer', label: 'Transf. Contas Rose', onPress: () => navigation.navigate('TransferAmount', { balance }) },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Resetar a navegação completamente e ir para Welcome
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setError('Erro ao fazer logout. Tente novamente.');
      setMenuVisible(false); // Fechar o menu em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserName();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#682145" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => setMenuVisible(true)}
              >
                <MaterialCommunityIcons 
                  name="account-circle" 
                  size={40} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('ProfileSettings');
              }}
              title="Configurações"
              leadingIcon="cog"
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
              title="Sair"
              leadingIcon="logout"
              disabled={loading}
            />
          </Menu>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>OLÁ, {userName.split(' ')[0].toUpperCase()}</Text>
            <Text style={styles.accountInfo}>Agência: 0001 | Conta: {userAccount || '----'}</Text>
          </View>
        </View>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
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
          <TouchableOpacity 
            style={styles.addBalanceButton}
            onPress={() => navigation.navigate('PixReceiveAmount')}
          >
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
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Últimas Transações</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setRefreshing(true);
              Promise.all([
                refetchBalance(),
                refetchTransactions()
              ]).finally(() => {
                setTimeout(() => setRefreshing(false), 500);
              });
            }}
          >
            {refreshing ? (
              <ActivityIndicator 
                size="small" 
                color="#682145" 
                style={styles.refreshLoader} 
              />
            ) : (
              <MaterialCommunityIcons 
                name="refresh" 
                size={20} 
                color="#682145" 
                style={styles.refreshIcon} 
              />
            )}
          </TouchableOpacity>
        </View>
        {transactionsError ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons 
              name="alert-circle-outline" 
              size={48} 
              color="#682145" 
            />
            <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
            <Text style={styles.errorMessage}>
              {transactionsError.message || "Ocorreu um erro ao buscar os dados. Tente novamente mais tarde."}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                Promise.all([
                  refetchBalance(),
                  refetchTransactions()
                ]);
              }}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : transactionsLoading ? (
          <ActivityIndicator size="large" color="#682145" style={styles.loader} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="calendar-blank" 
              size={48} 
              color="#682145" 
            />
            <Text style={styles.emptyText}>
              Nenhuma transação encontrada nos últimos 7 dias
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions
              .sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
              .slice(0, 5)}
            renderItem={({ item }) => (
              <TransactionItem
                date={item.createDate}
                description={item.description}
                value={item.amount}
                isPositive={item.balanceType === 'CREDIT'}
                movementType={item.movementType}
                onPress={() => handleTransactionPress(item)}
                clientCode={item.clientCode}
              />
            )}
            keyExtractor={(item) => item.id}
            style={styles.transactionsList}
          />
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
    width: 40,
    height: 40,
    tintColor: '#FFFFFF'
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
    fontSize: normalize(32),
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
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
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
    fontSize: normalize(12),
    fontWeight: '500',
  },
  actionsContainer: {
    height: 130,
    marginTop: 29,
    marginBottom: 29,
  },
  actionsList: {
    paddingHorizontal: 20,
    gap: 5,
  },
  actionButton: {
    backgroundColor: '#73294f',
    borderRadius: 12,
    padding: 16,
    width: 111,
    height: 130,
    position: 'relative',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
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
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#333333',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(105, 33, 69, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  refreshLoader: {
    marginLeft: 8,
  },
  refreshIcon: {
    marginRight: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 84,
  },
  transactionTypeContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionTypeSymbol: {
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  transactionContent: {
    flex: 1,
    paddingBottom: 8,
  },
  transactionTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: normalize(4),
  },
  transactionSubtitle: {
    fontSize: normalize(14),
    color: '#666666',
    marginBottom: normalize(4),
  },
  transactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  transactionValue: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#333333',
    marginRight: normalize(8),
  },
  transactionMethod: {
    fontSize: normalize(12),
    color: '#999999',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
  },
  transactionDate: {
    fontSize: normalize(12),
    color: '#999999',
    marginBottom: normalize(4),
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    margin: 16,
  },
  errorTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#333333',
    marginBottom: normalize(8),
  },
  errorMessage: {
    fontSize: normalize(14),
    color: '#666666',
    marginBottom: normalize(16),
  },
  retryButton: {
    backgroundColor: '#682145',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: normalize(14),
    fontWeight: '500',
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
