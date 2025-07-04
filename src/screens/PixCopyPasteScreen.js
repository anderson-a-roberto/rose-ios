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

const PixCopyPasteScreen = ({ navigation, route }) => {
  const [pixCode, setPixCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [emvData, setEmvData] = useState(null);
  const [dictData, setDictData] = useState(null);
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
      console.log('Código QR recebido da tela de escaneamento:', route.params.pixCode);
      setPixCode(route.params.pixCode);
      // Processar o código automaticamente após um breve delay
      setTimeout(() => {
        handleProcessPix();
      }, 500);
    }
  }, [route.params?.pixCode]);

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
      console.log('Chamando edge function pix-emv-full com código:', pixCode.substring(0, 20) + '...');
    
    // Decodificar o código EMV com a nova edge function
    const { data: emvResponse, error: emvError } = await supabase.functions.invoke('pix-emv-full', {
      body: { emv: pixCode }
    });

    console.log('Resposta pix-emv-full:', { emvResponse, emvError });

      if (emvError) {
        console.log('Erro na chamada pix-emv-full:', emvError);
        throw new Error(emvError.message || 'Não foi possível ler o código PIX');
      }

      if (emvResponse.status === 'ERROR') {
        console.log('Erro no status da resposta pix-emv-full:', emvResponse.error);
        throw new Error(emvResponse.error?.message || 'Não foi possível ler o código PIX');
      }

      console.log('Dados EMV decodificados:', emvResponse.data);
      
      // Processar os dados EMV da nova estrutura (dentro do objeto body)
      const emvData = emvResponse.data.body || emvResponse.data;
      
      // Verificar se é um QR code dinâmico ou estático usando as novas propriedades
      const isDynamicQrCode = emvData.type === 'DYNAMIC' || emvData.transactionIdentification;
      const initiationType = emvData.recommendedInitiationType || (isDynamicQrCode ? "MANUAL" : "DICT");
      
      console.log(`[PixCopyPasteScreen] Tipo de QR code detectado: ${isDynamicQrCode ? 'Dinâmico' : 'Estático'}`);
      console.log(`[PixCopyPasteScreen] Tipo de iniciação recomendado: ${initiationType}`);
      
      if (emvData.transactionIdentification) {
        console.log(`[PixCopyPasteScreen] ID de transação encontrado: ${emvData.transactionIdentification}`);
      }
      
      // Armazenar os dados EMV processados
      setEmvData(emvData);

      // Extrair o valor da transação da nova estrutura
      const transactionAmount = emvData.amount?.final || emvData.amount?.original || emvData.transactionAmount;
      
      console.log(`[PixCopyPasteScreen] Valor da transação: ${transactionAmount}`);
      
      // Se o código não tem valor definido, inicializar o campo de valor
      if (!transactionAmount) {
        setPaymentAmount('');
      } else {
        setPaymentAmount(transactionAmount.toString());
      }

      // Extrair a chave PIX da nova estrutura de resposta
      // Na nova edge function pix-emv-full, a chave está diretamente no objeto body como 'key'
      // ou pode estar dentro de merchantAccountInformation.key como na versão antiga
      const pixKey = emvData.key || emvData.merchantAccountInformation?.key;
      
      console.log('[PixCopyPasteScreen] Chave PIX encontrada:', pixKey);
      
      if (!pixKey) {
        console.log('Erro: Chave PIX não encontrada nos dados EMV', emvData);
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
    
    // Preparar o valor para a tela de confirmação
    const amount = transactionAmount || parseFloat(paymentAmount || '0');
    
    console.log('[PixCopyPasteScreen] Navegando para confirmação com dados:', {
      amount,
      emvData,
      dictData: dictResponse.data
    });
    
    navigation.navigate('PixCopyPasteConfirm', {
      amount,
      emvData,
      dictData: dictResponse.data,
      userAccount,
      userTaxId,
      userName
    });
      
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

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Indicador de carregamento dos dados do usuário */}
            {isLoadingUserData && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>Carregando dados da conta...</Text>
              </View>
            )}

            {/* Input do código PIX */}
            {!isLoadingUserData && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Código PIX</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    mode="outlined"
                    value={pixCode}
                    onChangeText={setPixCode}
                    placeholder="Cole o código PIX aqui"
                    multiline
                    numberOfLines={4}
                    style={styles.input}
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
            )}
            
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="qrcode" size={64} color="#E91E63" />
            </View>
            
            <Text style={styles.description}>
              Cole um código PIX para realizar um pagamento de forma rápida e segura.
            </Text>
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
    backgroundColor: '#FFF'
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});

export default PixCopyPasteScreen;
