import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTransactionPassword } from '../contexts/TransactionPasswordContext';
import { supabase } from '../config/supabase';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PayBillPinScreen = ({ navigation, route }) => {
  const { verifyTransactionPassword, isVerifying, error: contextError } = useTransactionPassword();
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isExecutingPayment, setIsExecutingPayment] = useState(false);
  // Removida a contagem de tentativas
  const pinInputRef = useRef(null);
  const { billData, balance } = route.params;
  
  // Removido useFocusEffect em favor do autoFocus nativo do TextInput do React Native Paper
  
  // Mostrar erro do contexto se houver
  useEffect(() => {
    if (contextError) {
      // Simplificar a mensagem de erro
      setError('Erro ao verificar PIN');
    }
  }, [contextError]);
  
  const handleBack = () => {
    // Redirecionar para a tela inicial em vez da tela de pagamento de contas
    // para manter o comportamento consistente com as outras telas de PIN
    navigation.navigate('Dashboard2');
  };

  const handleForgotPin = async () => {
    // Navegar para a tela de recuperação de PIN
    try {
      // Obter o email do usuário logado para preencher automaticamente
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || '';
      
      // Navegar para a tela de recuperação de PIN com o email pré-preenchido
      navigation.navigate('ForgotPin', { email: userEmail });
    } catch (error) {
      console.error('Erro ao obter email do usuário:', error);
      // Mesmo com erro, navegar para a tela de recuperação sem email pré-preenchido
      navigation.navigate('ForgotPin');
    }
  };
  
  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      setError('O PIN deve ter 6 dígitos');
      return;
    }
    
    // Limpar erro anterior
    setError(null);
    
    try {
      console.log('[PayBillPinScreen] Verificando PIN...');
      const success = await verifyTransactionPassword(pin);
      
      if (success) {
        console.log('[PayBillPinScreen] PIN verificado com sucesso!');
        // PIN verificado com sucesso - executar pagamento imediatamente
        await executePayment();
      } else {
        console.log('[PayBillPinScreen] Falha na verificação do PIN');
      }
    } catch (err) {
      console.error('[PayBillPinScreen] Erro ao verificar PIN:', err);
      // Não definimos o erro aqui, pois ele será tratado pelo useEffect que monitora contextError
    }
  };
  
  const executePayment = async () => {
    if (isExecutingPayment) return; // Evitar dupla execução
    
    try {
      setIsExecutingPayment(true);
      console.log('[PayBillPinScreen] Executando pagamento...');
      
      // Gera um UUID único para a transação
      const clientRequestId = `PB${Date.now()}`;

      // Chama a edge function segura para realizar o pagamento
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('bill-payment-secure', {
        body: {
          barCodeInfo: {
            digitable: billData.barCode.digitable
          },
          clientRequestId,
          amount: billData.value,
          account: billData.userAccount, // Usar o número real da conta do usuário
          transactionIdAuthorize: billData.transactionId
        }
      });

      if (paymentError) throw paymentError;

      // Verifica se o status é PROCESSING (caso de sucesso da Celcoin)
      if (paymentData.status === "PROCESSING") {
        console.log('[PayBillPinScreen] Pagamento iniciado, navegando para loading...');
        // Navega para tela de loading com dados para polling
        navigation.replace('PayBillLoading', {
          clientRequestId,
          celcoinId: paymentData.body?.id, // ID da Celcoin para polling
          billData,
          paymentResponse: paymentData
        });
      } else {
        // Caso de erro ou status inesperado
        throw new Error(paymentData.error?.message || 'Status de pagamento inesperado');
      }

    } catch (error) {
      console.error('[PayBillPinScreen] Erro no pagamento:', error);
      setIsExecutingPayment(false); // Reset loading apenas em caso de erro
      navigation.replace('PayBillError', {
        error: error.message || 'Não foi possível processar o pagamento. Tente novamente.',
        billData
      });
    }
    // Não resetamos isExecutingPayment em caso de sucesso pois navegamos para outra tela
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {/* Header com botão de voltar */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={isVerifying}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.content}>
          {/* Ícone de cadeado */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons name="lock" size={40} color="#E91E63" />
            </View>
          </View>
          
          {/* Título e subtítulo */}
          <Text style={styles.title}>Digite a senha de transação</Text>
          <Text style={styles.subtitle}>É usada para autorizar operações no app</Text>
          
          {/* Input do PIN */}
          <View style={styles.inputContainer}>
            <TextInput
              mode="flat"
              ref={pinInputRef}
              value={showPassword ? pin : '•'.repeat(pin.length)}
              onChangeText={(value) => {
                if (showPassword) {
                  const clean = value.replace(/[^0-9]/g, '').slice(0, 6);
                  setPin(clean);
                } else {
                  const prevLen = pin.length;
                  const currLen = value.length;

                  if (currLen > prevLen) {
                    const last = value.charAt(value.length - 1);
                    if (/\d/.test(last)) setPin((p) => (p + last).slice(0, 6));
                  } else if (currLen < prevLen) {
                    setPin((p) => p.slice(0, -1));
                  }
                }
                setError('');
              }}
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
              maxLength={6}
              underlineColor="#E91E63"
              activeUnderlineColor="#E91E63"
              placeholder="Digite sua senha de 6 dígitos"
              placeholderTextColor="#666"
              autoFocus
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#666"
                />
              }
              style={styles.pinInput}
            />
            
            {/* Mensagem de erro */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Link para recuperação de PIN */}
            <TouchableOpacity 
              style={styles.forgotPinButton}
              onPress={handleForgotPin}
            >
              <Text style={styles.forgotPinText}>Esqueci meu PIN</Text>
            </TouchableOpacity>
          </View>
          
          {/* Botão de confirmar */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (pin.length !== 6 || isVerifying || isExecutingPayment) && styles.confirmButtonDisabled
            ]}
            onPress={handleVerifyPin}
            disabled={pin.length !== 6 || isVerifying || isExecutingPayment}
          >
            {isVerifying || isExecutingPayment ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Continuar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
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
  content: {
    flex: 0,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
    marginTop: 10,
  },
  iconBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'normal',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  pinInput: {
    backgroundColor: 'transparent',
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#000000',
    width: '100%',
    height: 56,
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#E91E63',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
    marginBottom: 30,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    textAlign: 'center',
  },
  forgotPinButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPinText: {
    color: '#E91E63',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default PayBillPinScreen;
