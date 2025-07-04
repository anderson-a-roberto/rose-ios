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
      console.log('[PixQrCodePaymentScreen] Chamando edge function pix-emv-full');
    
    // Decodificar o código EMV usando a nova edge function
    const { data: emvResponse, error: emvError } = await supabase.functions.invoke('pix-emv-full', {
      body: { emv: pixCode }
    });

      console.log('[PixQrCodePaymentScreen] Resposta pix-emv-full:', { emvResponse, emvError });

      if (emvError) {
        console.log('[PixQrCodePaymentScreen] Erro na chamada pix-emv-full:', emvError);
        throw new Error(emvError.message || 'Não foi possível ler o código QR PIX');
      }

      if (emvResponse.status === 'ERROR') {
        console.log('[PixQrCodePaymentScreen] Erro no status da resposta pix-emv-full:', emvResponse.error);
        throw new Error(emvResponse.error?.message || 'Não foi possível ler o código QR PIX');
      }

      console.log('[PixQrCodePaymentScreen] Dados EMV decodificados:', emvResponse.data);
      
      // Processar os dados EMV da nova estrutura (dentro do objeto body)
      const emvData = emvResponse.data.body || emvResponse.data;
      
      // Log detalhado para depuração
    console.log('[PixQrCodePaymentScreen] Resposta completa pix-emv-full:', JSON.stringify(emvResponse.data, null, 2));
    console.log('[PixQrCodePaymentScreen] Tipo de QR code declarado:', emvData.type);
    
    // Verificar se é um QR code dinâmico ou estático usando APENAS o campo type
    // Considerando DYNAMIC e IMMEDIATE como tipos dinâmicos
    const isDynamicQrCode = emvData.type === 'DYNAMIC' || emvData.type === 'IMMEDIATE';
    const isStaticQrCode = emvData.type === 'STATIC' || !isDynamicQrCode;
    
    // Log de outros indicadores apenas para referência
    console.log('[PixQrCodePaymentScreen] Outros indicadores (apenas para referência):', {
      hasTransactionId: !!emvData.transactionIdentification,
      pointOfInitiationMethod: emvData.pointOfInitiationMethod,
      canModifyAmount: emvData.amount?.canModifyFinalAmount
    });
    
    console.log(`[PixQrCodePaymentScreen] Tipo de QR code detectado: ${isDynamicQrCode ? 'Dinâmico' : 'Estático'}`);
    
    // Definir o tipo de iniciação recomendado com base no tipo de QR code conforme documentação
    // Para QR codes dinâmicos: DYNAMIC_QRCODE
    // Para QR codes estáticos: STATIC_QRCODE
    const recommendedInitiationType = isDynamicQrCode ? "DYNAMIC_QRCODE" : "STATIC_QRCODE";
    console.log(`[PixQrCodePaymentScreen] Tipo de iniciação recomendado: ${recommendedInitiationType}`);
    
    if (emvData.transactionIdentification) {
      console.log(`[PixQrCodePaymentScreen] ID de transação encontrado: ${emvData.transactionIdentification}`);
    }

      // Extrair a chave PIX do código QR da nova estrutura
      const pixKey = emvData.key || emvData.merchantAccountInformation?.key;
      
      console.log('[PixQrCodePaymentScreen] Chave PIX encontrada:', pixKey);
      
      if (!pixKey) {
        console.error('[PixQrCodePaymentScreen] Chave PIX não encontrada nos dados EMV', emvData);
        throw new Error('Chave PIX não encontrada no código QR');
      }
      
      // Extrair o valor da transação da nova estrutura
      const transactionAmount = emvData.amount?.final || emvData.amount?.original || emvData.transactionAmount;
      
      console.log(`[PixQrCodePaymentScreen] Valor da transação: ${transactionAmount}`);
      
      // Se o código não tem valor definido, inicializar o campo de valor
      if (!transactionAmount) {
        setPaymentAmount('');
      } else {
        setPaymentAmount(transactionAmount.toString());
      }
      
      // Atualizar o estado com os dados EMV processados
      setEmvData(emvData);

      // Chamar a nova edge function get-pix-dict-qrcode para obter informações do recebedor
      console.log(`[PixQrCodePaymentScreen] Consultando informações da chave PIX: ${pixKey}`);
      
      // Usar a conta do usuário autenticado
      const accountToUse = userAccount;
      console.log('[PixQrCodePaymentScreen] Usando conta do usuário:', accountToUse);
      
      const { data: dictResponse, error: dictError } = await supabase.functions.invoke('get-pix-dict', {
        body: { 
          key: pixKey,
          account: accountToUse 
        }
      });

      console.log(`[PixQrCodePaymentScreen] Resposta get-pix-dict-qrcode:`, dictResponse);

      // Verificar se houve erro na consulta DICT
      if (dictError || !dictResponse?.data || dictResponse?.error) {
        const errorMessage = dictError?.message || dictResponse?.error?.message || 'Erro ao consultar informações do recebedor';
        console.log('[PixQrCodePaymentScreen] Erro no status da resposta get-pix-dict-qrcode:', dictResponse?.error || dictError);
        
        // Para QR codes dinâmicos, podemos continuar mesmo sem dados do DICT
        if (isDynamicQrCode) {
          console.log('[PixQrCodePaymentScreen] QR code dinâmico - continuando mesmo sem dados DICT');
          // Criar dados DICT mínimos para continuar o fluxo
          dictResponse = {
            data: {
              name: emvData.merchantAccountInformation?.merchantName || 'Recebedor',
              key: pixKey,
              documentnumber: '',
              account: '',
              branch: '',
              participant: '',
              accounttype: 'CACC'
            }
          };
        } else {
          // Para QR codes estáticos, ainda precisamos dos dados DICT
          throw new Error(errorMessage);
        }
      }

      console.log('Dados DICT obtidos:', dictResponse.data);
      setDictData(dictResponse.data);
      
      console.log('Dados processados com sucesso - Navegando para tela de confirmação');
      
      // Preparar o valor para a tela de confirmação
      const amount = transactionAmount || parseFloat(paymentAmount || '0');
      
      console.log(`[PixQrCodePaymentScreen] Navegando para confirmação com dados:`, {
        amount,
        emvData,
        dictData: dictResponse.data,
        isDynamicQrCode,
        isStaticQrCode,
        initiationType: recommendedInitiationType
      });

      // Navegar para a tela de confirmação (unificando o fluxo com o Copy-Paste)
      navigation.navigate('PixCopyPasteConfirm', {
        amount,
        emvData,
        dictData: dictResponse.data,
        userAccount,
        userTaxId,
        userName,
        isDynamicQrCode,
        isStaticQrCode,
        recommendedInitiationType,
        sourceFlow: 'qrcode'
      });
      
    } catch (error) {
      console.error('Erro ao processar código QR PIX:', error);
      setError(error.message || 'Ocorreu um erro ao processar o código QR PIX');
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao processar o código QR PIX');
    } finally {
      setIsProcessing(false);
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
                  onPress={() => navigation.navigate('PixCopyPasteConfirm', {
                    amount: emvData.transactionAmount || parseFloat(paymentAmount),
                    emvData: emvData,
                    dictData: dictData,
                    userAccount,
                    userTaxId,
                    userName,
                    sourceFlow: 'qrcode'
                  })}
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
