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
import PixTransferForm from '../components/pix/transfer/PixTransferForm';
import PixReceiveForm from '../components/pix/receive/PixReceiveForm';
import ChargesOptionsForm from '../components/charges/ChargesOptionsForm';
import CreateChargeForm from '../components/charges/CreateChargeForm';
import ManageChargesForm from '../components/charges/ManageChargesForm';
import useDashboard from '../hooks/useDashboard';
import ProfileSettingsForm from '../components/profile/ProfileSettingsForm';

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

export default function Dashboard2Screen() {
  const { userAccount, userTaxId } = useDashboard();
  const [balance, setBalance] = useState(null);
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
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => showSection(null)}>
              <MaterialCommunityIcons name="account-circle" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Boa tarde</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <MaterialCommunityIcons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {showSettings ? (
          <ProfileSettingsForm onBack={() => setShowSettings(false)} />
        ) : (
          <>
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
                <ActionButton 
                  icon="cash-multiple" 
                  label="Cobranças"
                  onPress={() => showSection('charges')}
                />
              </View>
            </View>

            {/* Content Section */}
            <View style={[styles.transactionsContainer, (showStatement || showPayment || showTransfer || showPix || showPixKeys || showPixTransfer || showPixReceive || showCharges || showCreateCharge || showManageCharges) && styles.contentContainer]}>
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
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF1493',
  },
  scrollView: {
    flex: 1,
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
