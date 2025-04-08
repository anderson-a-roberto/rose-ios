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
import { supabase } from '../../config/supabase';
import { useQueryClient } from '@tanstack/react-query';

const PixQrCodePaymentScreen = ({ navigation, route }) => {
  const queryClient = useQueryClient();
  const [pixCode, setPixCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [emvData, setEmvData] = useState(null);
  const [dictData, setDictData] = useState(null);
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

  // Verificar se foi recebido um código QR da tela de escaneamento
  useEffect(() => {
    if (route.params?.pixCode) {
      console.log('==========================================');
      console.log('PIXQRCODEPAYMENT - CÓDIGO QR RECEBIDO:');
      console.log(route.params.pixCode);
      console.log('PIXQRCODEPAYMENT - TAMANHO DO CÓDIGO:', route.params.pixCode.length);
      console.log('==========================================');
      
      setPixCode(route.params.pixCode);
      
      // Processar o código automaticamente após carregar os dados do usuário
      if (!isLoadingUserData && userAccount) {
        handleProcessPix();
      }
    }
  }, [route.params?.pixCode, isLoadingUserData, userAccount]);

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
    console.log('handleProcessPix chamado - Iniciando processamento do código QR PIX');
    
    if (!pixCode.trim()) {
      console.log('Erro: Código PIX vazio');
      Alert.alert('Erro', 'Código QR PIX inválido ou vazio.');
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
      console.log('Chamando edge function pix-emv com código QR:', pixCode.substring(0, 20) + '...');
      
      // Decodificar o código EMV
      const { data: emvResponse, error: emvError } = await supabase.functions.invoke('pix-emv', {
        body: { emv: pixCode }
      });

      console.log('Resposta pix-emv:', { emvResponse, emvError });

      if (emvError) {
        console.log('Erro na chamada pix-emv:', emvError);
        throw new Error(emvError.message || 'Não foi possível ler o código QR PIX');
      }

      if (emvResponse.status === 'ERROR') {
        console.log('Erro no status da resposta pix-emv:', emvResponse.error);
        throw new Error(emvResponse.error?.message || 'Não foi possível ler o código QR PIX');
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
      
      console.log('Dados processados com sucesso');
    } catch (error) {
      console.error('Erro ao processar código QR PIX:', error);
      setError(error.message || 'Ocorreu um erro ao processar o código QR PIX');
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao processar o código QR PIX');
    } finally {
      setIsProcessing(false);
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
        remittanceInformation: emvData.additionalDataField?.referenceLabel || "Pagamento PIX via QR Code" // Informação adicional
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
      
      // Navegar para a tela de processamento com os dados do pagamento
      navigation.navigate('PixQrCodeLoading', { paymentData });
      
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      setError(error.message || 'Ocorreu um erro ao processar o pagamento');
      Alert.alert('Erro no Pagamento', error.message || 'Ocorreu um erro ao processar o pagamento');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
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
            <Text style={styles.headerTitle}>Pagamento via QR Code</Text>
            <Text style={styles.subtitle}>Processando seu pagamento via QR Code PIX</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Indicador de carregamento dos dados do usuário */}
            {isLoadingUserData && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>Carregando dados da conta...</Text>
              </View>
            )}

            {/* Processando o código QR */}
            {!isLoadingUserData && isProcessing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>Processando QR Code PIX...</Text>
              </View>
            )}

            {/* Exibir detalhes do código QR */}
            {!isLoadingUserData && !isProcessing && emvData && dictData && (
              <View style={styles.qrCodeDetails}>
                <Text style={styles.detailsTitle}>Detalhes do Pagamento</Text>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Beneficiário:</Text>
                  <Text style={styles.detailValue}>{dictData.name}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Instituição:</Text>
                  <Text style={styles.detailValue}>{dictData.psp_name || 'Não informado'}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Chave PIX:</Text>
                  <Text style={styles.detailValue}>{emvData.merchantAccountInformation?.key || 'Não informado'}</Text>
                </View>
                
                {emvData.additionalDataField?.referenceLabel && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Descrição:</Text>
                    <Text style={styles.detailValue}>{emvData.additionalDataField.referenceLabel}</Text>
                  </View>
                )}
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Valor:</Text>
                  {emvData.transactionAmount ? (
                    <Text style={styles.detailValue}>R$ {parseFloat(emvData.transactionAmount).toFixed(2)}</Text>
                  ) : (
                    <TextInput
                      mode="outlined"
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                      placeholder="Informe o valor"
                      keyboardType="numeric"
                      style={styles.valueInput}
                      outlineColor="#ddd"
                      activeOutlineColor="#E91E63"
                      theme={{
                        colors: {
                          text: '#000000',
                          placeholder: '#666666',
                          primary: '#E91E63',
                        }
                      }}
                    />
                  )}
                </View>
                
                <Button
                  mode="contained"
                  onPress={handleConfirmPayment}
                  style={styles.confirmButton}
                  labelStyle={styles.confirmButtonLabel}
                  disabled={!emvData.transactionAmount && (!paymentAmount || parseFloat(paymentAmount) <= 0)}
                  uppercase={false}
                >
                  Confirmar Pagamento
                </Button>
              </View>
            )}

            {/* Exibir erro */}
            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.tryAgainButton}
                  labelStyle={styles.tryAgainButtonLabel}
                >
                  Tentar Novamente
                </Button>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>


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
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  headerContent: {
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  qrCodeDetails: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  valueInput: {
    backgroundColor: '#fff',
    height: 50,
  },
  confirmButton: {
    backgroundColor: '#E91E63',
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tryAgainButton: {
    borderColor: '#E91E63',
    borderWidth: 2,
  },
  tryAgainButtonLabel: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PixQrCodePaymentScreen;
