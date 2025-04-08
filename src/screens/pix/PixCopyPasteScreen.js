import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../../config/supabase';
import PixConfirmationModal from '../../components/pix/copypaste/PixConfirmationModal';
import PixCopyPasteReceipt from '../../components/pix/copypaste/PixCopyPasteReceipt';
import PixReceiptModal from '../../components/pix/copypaste/PixReceiptModal';
import { useQueryClient } from '@tanstack/react-query';

const PixCopyPasteScreen = ({ navigation, route }) => {
  const queryClient = useQueryClient();
  const [pixCode, setPixCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [emvData, setEmvData] = useState(null);
  const [dictData, setDictData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Estados para armazenar os dados do usuário
  const [userAccount, setUserAccount] = useState(null);
  const [userTaxId, setUserTaxId] = useState(null);
  const [userName, setUserName] = useState('Usuário');
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Buscar dados do usuário ao montar o componente
  useEffect(() => {
    fetchUserData();
  }, []);

  // Função para buscar dados do usuário diretamente do Supabase
  const fetchUserData = async () => {
    try {
      setIsLoadingUserData(true);
      
      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Obter document_number do perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUserTaxId(profile.document_number);
      setUserName('Usuário'); // Nome padrão, já que não temos acesso ao nome real

      // Obter conta do usuário
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profile.document_number)
        .eq('onboarding_create_status', 'CONFIRMED')
        .single();

      if (kycError) throw kycError;

      setUserAccount(kycData.account);
      
      console.log('Dados do usuário carregados:', {
        account: kycData.account,
        taxId: profile.document_number
      });
      
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      Alert.alert('Erro', 'Não foi possível carregar seus dados. Tente novamente mais tarde.');
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const handleProcessPix = async () => {
    console.log('handleProcessPix chamado - Iniciando processamento do código PIX');
    
    if (!pixCode.trim()) {
      console.log('Erro: Código PIX vazio');
      Alert.alert('Erro', 'Por favor, insira um código PIX válido.');
      return;
    }

    if (!userAccount) {
      console.log('Erro: Conta do usuário não disponível', { userAccount });
      Alert.alert('Erro', 'Não foi possível obter os dados da sua conta. Tente novamente mais tarde.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Chamando edge function pix-emv com código:', pixCode.substring(0, 20) + '...');
      
      // Decodificar o código EMV
      const { data: emvResponse, error: emvError } = await supabase.functions.invoke('pix-emv', {
        body: { emv: pixCode }
      });

      console.log('Resposta pix-emv:', { emvResponse, emvError });

      if (emvError) {
        console.log('Erro na chamada pix-emv:', emvError);
        throw new Error(emvError.message || 'Não foi possível ler o código PIX');
      }

      if (emvResponse.status === 'ERROR') {
        console.log('Erro no status da resposta pix-emv:', emvResponse.error);
        throw new Error(emvResponse.error?.message || 'Não foi possível ler o código PIX');
      }

      console.log('Dados EMV decodificados:', emvResponse.data);
      setEmvData(emvResponse.data);

      // Se o código não tem valor definido, inicializar o campo de valor
      if (!emvResponse.data.transactionAmount) {
        setPaymentAmount('');
      } else {
        setPaymentAmount(emvResponse.data.transactionAmount.toString());
      }

      // Extrair a chave PIX corretamente da estrutura merchantAccountInformation
      const pixKey = emvResponse.data.merchantAccountInformation?.key;
      
      if (!pixKey) {
        console.log('Erro: Chave PIX não encontrada nos dados EMV');
        throw new Error('Chave PIX não encontrada no código QR');
      }

      // Consultar informações do destinatário pelo DICT
      console.log('Antes de chamar get-pix-dict - Parâmetros:', {
        pixKey: pixKey,
        account: userAccount
      });
      
      const { data: dictResponse, error: dictError } = await supabase.functions.invoke('get-pix-dict', {
        body: { 
          key: pixKey,
          account: userAccount
        }
      });

      console.log('Resposta get-pix-dict:', { dictResponse, dictError });

      if (dictError) {
        console.log('Erro na chamada get-pix-dict:', dictError);
        throw new Error(dictError.message || 'Não foi possível obter informações do destinatário');
      }

      if (dictResponse.status === 'ERROR') {
        console.log('Erro no status da resposta get-pix-dict:', dictResponse.error);
        throw new Error(dictResponse.error?.message || 'Não foi possível obter informações do destinatário');
      }

      console.log('Dados DICT obtidos:', dictResponse.data);
      setDictData(dictResponse.data);
      
      console.log('Abrindo modal de confirmação');
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Erro ao processar código PIX:', error);
      setError(error.message || 'Ocorreu um erro ao processar o código PIX');
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao processar o código PIX');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setPixCode(text);
        Alert.alert('Sucesso', 'Código PIX colado com sucesso!');
      } else {
        Alert.alert('Aviso', 'Não há texto na área de transferência.');
      }
    } catch (error) {
      console.error('Erro ao colar do clipboard:', error);
      Alert.alert('Erro', 'Não foi possível colar o código. Tente inserir manualmente.');
    }
  };

  const handleConfirmPayment = async () => {
    console.log('handleConfirmPayment chamado - Iniciando confirmação de pagamento');
    
    if (!emvData || !dictData) {
      console.log('Erro: Dados incompletos para pagamento', { emvData: !!emvData, dictData: !!dictData });
      Alert.alert('Erro', 'Dados incompletos para realizar o pagamento.');
      return;
    }

    // Verificar se é necessário informar o valor
    if (!emvData.transactionAmount && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
      console.log('Erro: Valor de pagamento inválido', { paymentAmount });
      Alert.alert('Erro', 'Por favor, informe um valor válido para o pagamento.');
      return;
    }

    setIsPaymentProcessing(true);
    setError(null);

    try {
      const amount = emvData.transactionAmount || parseFloat(paymentAmount);
      
      // Gerar clientCode único para a transação
      const generateClientCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };
      
      const clientCode = generateClientCode();
      console.log('ClientCode gerado para a transação:', clientCode);
      
      // Estrutura completa do payload conforme esperado pela edge function
      const paymentData = {
        amount: amount,
        clientCode: clientCode,
        endToEndId: dictData.endtoendid, // Usar sempre o endToEndId retornado pelo DICT
        initiationType: "STATIC_QRCODE", // Alterado para pagamentos via QR Code estático
        paymentType: "IMMEDIATE", // Valor fixo para pagamentos imediatos
        urgency: "HIGH", // Valor fixo para urgência alta
        transactionType: "TRANSFER", // Valor fixo para transferências
        debitParty: {
          account: userAccount,
          branch: "1", // Valor padrão
          taxId: userTaxId,
          name: userName || "Titular da Conta", // Nome do usuário ou fallback
          accountType: "TRAN" // Valor padrão para conta de transação
        },
        creditParty: {
          bank: dictData.participant, // Banco do recebedor, vem da resposta do DICT
          key: emvData.merchantAccountInformation.key, // Chave PIX do recebedor, vem do EMV
          account: dictData.account, // Conta do recebedor, vem da resposta do DICT
          branch: dictData.branch || "0", // Agência do recebedor, vem da resposta do DICT
          taxId: dictData.documentnumber, // CPF/CNPJ do recebedor, vem do DICT
          name: dictData.name, // Nome do recebedor, vem do DICT
          accountType: dictData.accounttype || "TRAN" // Tipo de conta do recebedor, vem do DICT
        },
        remittanceInformation: emvData.description || "Pagamento PIX via Código EMV" // Informação adicional
      };

      console.log('Chamando edge function pix-cash-out com dados:', JSON.stringify(paymentData));

      const { data: paymentResponse, error: paymentError } = await supabase.functions.invoke('pix-cash-out', {
        body: paymentData
      });

      console.log('Resposta pix-cash-out:', { paymentResponse, paymentError });

      if (paymentError) {
        console.log('Erro na chamada pix-cash-out:', paymentError);
        throw new Error(paymentError.message || 'Não foi possível processar o pagamento');
      }

      if (paymentResponse.status === 'ERROR') {
        console.log('Erro no status da resposta pix-cash-out:', paymentResponse.error);
        throw new Error(paymentResponse.error?.message || 'Não foi possível processar o pagamento');
      }

      // Consideramos PROCESSING como sucesso, já que o status final será atualizado via webhook
      console.log('Pagamento processado com sucesso:', paymentResponse);
      
      // Invalidar o cache de transações para que o extrato seja atualizado
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['balance']);
      
      // Usar paymentResponse diretamente como resultado do pagamento
      setPaymentResult(paymentResponse);
      setShowConfirmModal(false);
      setShowReceiptModal(true);
    } catch (error) {
      console.error('Erro ao realizar pagamento PIX:', error);
      setError(error.message || 'Ocorreu um erro ao processar o pagamento');
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao processar o pagamento');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceiptModal(false);
    navigation.navigate('Dashboard2');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>PIX Copia e Cola</Text>
            <Text style={styles.subtitle}>Cole o código PIX para realizar o pagamento</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Indicador de carregamento dos dados do usuário */}
            {isLoadingUserData && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>Carregando dados da conta...</Text>
              </View>
            )}

            {/* Conteúdo principal */}
            {!isLoadingUserData && (
              <>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="qrcode" size={64} color="#E91E63" />
                </View>
                
                <Text style={styles.description}>
                  Cole um código PIX para realizar um pagamento de forma rápida e segura.
                </Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Código PIX</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      mode="flat"
                      value={pixCode}
                      onChangeText={setPixCode}
                      placeholder="Cole o código PIX aqui"
                      multiline
                      numberOfLines={3}
                      style={styles.input}
                      underlineColor="#E0E0E0"
                      activeUnderlineColor="#E91E63"
                      theme={{
                        colors: {
                          text: '#333333',
                          placeholder: '#999999',
                          background: '#F8F8F8',
                          primary: '#E91E63',
                        }
                      }}
                    />
                  </View>
                  <View style={styles.buttonRow}>
                    <Button
                      mode="outlined"
                      onPress={handlePasteFromClipboard}
                      style={styles.pasteButton}
                      icon="content-paste"
                      textColor="#E91E63"
                      buttonColor="#FFF"
                    >
                      Colar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => {
                        console.log('Botão Continuar clicado');
                        handleProcessPix();
                      }}
                      style={styles.processButton}
                      loading={isProcessing}
                      disabled={isProcessing || !pixCode.trim()}
                      buttonColor="#E91E63"
                      textColor="#FFF"
                    >
                      Continuar
                    </Button>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Confirmação */}
      <PixConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPayment}
        emvData={emvData}
        dictData={dictData}
        amount={paymentAmount}
        setAmount={setPaymentAmount}
        isLoading={isPaymentProcessing}
      />

      {/* Modal de Recibo */}
      <PixReceiptModal
        visible={showReceiptModal}
        onClose={handleCloseReceipt}
        paymentResult={paymentResult}
        emvData={emvData}
        dictData={dictData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    color: '#E91E63',
    fontSize: 32,
    fontWeight: '300',
  },
  headerContent: {
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputRow: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8F8F8',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    paddingHorizontal: 0,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pasteButton: {
    flex: 1,
    marginRight: 12,
    borderColor: '#E91E63',
    borderWidth: 1,
    borderRadius: 4,
  },
  processButton: {
    flex: 2,
    borderRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
});

export default PixCopyPasteScreen;
