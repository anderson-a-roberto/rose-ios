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
import { useTransactionPassword } from '../../contexts/TransactionPasswordContext';
import { supabase } from '../../config/supabase';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PixCopyPastePinScreen = ({ navigation, route }) => {
  const { verifyTransactionPassword, isVerifying, error: contextError } = useTransactionPassword();
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const pinInputRef = useRef(null);
  const { 
    paymentData, 
    emvData, 
    dictData, 
    amount,
    isDynamicQrCode = false,
    isStaticQrCode = true,
    sourceFlow = 'copypaste'
  } = route.params;
  
  // Log do tipo de QR code recebido para debug
  console.log(`[PixCopyPastePinScreen] Tipo de QR code: ${isDynamicQrCode ? 'Dinâmico' : 'Estático'}`);
  console.log(`[PixCopyPastePinScreen] Origem: ${sourceFlow}`);
  
  // Mostrar erro do contexto se houver
  useEffect(() => {
    if (contextError) {
      setError('Erro ao verificar PIN');
    }
  }, [contextError]);
  
  const handleBack = () => {
    navigation.navigate('Dashboard2');
  };

  const handleForgotPin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || '';
      
      navigation.navigate('ForgotPin', { email: userEmail });
    } catch (error) {
      console.error('Erro ao obter email do usuário:', error);
      navigation.navigate('ForgotPin');
    }
  };
  
  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      setError('O PIN deve ter 6 dígitos');
      return;
    }
    
    setError(null);
    
    try {
      console.log('[PixCopyPastePinScreen] Verificando PIN...');
      const success = await verifyTransactionPassword(pin);
      
      if (success) {
        console.log('[PixCopyPastePinScreen] PIN verificado com sucesso!');
        
        // Estruturar dados para PixTransferLoadingScreen (igual ao PIX Transfer)
        const clientCode = `CP${Date.now()}`;
        
        // Dados para comprovante (transferData)
        const transferData = {
          amount: amount,
          description: emvData?.merchantName || dictData?.name || 'Pagamento PIX Copia e Cola',
          beneficiary: {
            name: emvData?.merchantName || dictData?.name || 'Beneficiário',
            taxId: dictData?.documentnumber || 'N/A',
            bank: dictData?.participant || 'N/A'
          }
        };

        // Usar os flags de QR code recebidos da tela anterior (baseados apenas no campo 'type')
        console.log(`[PixCopyPastePinScreen] Processando pagamento para QR code ${isDynamicQrCode ? 'dinâmico' : 'estático'}`);
        console.log(`[PixCopyPastePinScreen] Tipo de iniciação: ${paymentData.initiationType}`);
        
        // Dados para API (payload)
        const payload = {
          amount: parseFloat(amount),
          clientCode,
          endToEndId: dictData.endtoendid || `E${Date.now()}`,
          initiationType: paymentData.initiationType || "DICT", // Usar o tipo de iniciação da tela anterior
          paymentType: "IMMEDIATE",
          urgency: "HIGH",
          transactionType: "TRANSFER",
          debitParty: {
            account: paymentData.debitParty.account,
            branch: "1",
            taxId: paymentData.debitParty.taxId,
            name: paymentData.debitParty.name,
            accountType: "TRAN"
          },
          creditParty: {
            bank: dictData.participant,
            key: paymentData.creditParty.key || dictData.key, // Usar a chave do paymentData primeiro (mais seguro)
            account: dictData.account || "*********",
            branch: dictData.branch || "0",
            taxId: dictData.documentnumber,
            name: dictData.name,
            accountType: dictData.accounttype || "CACC" // Usar o accountType do DICT ou CACC como padrão
          },
          remittanceInformation: paymentData.remittanceInformation || "Pagamento PIX via Código EMV"
        };

        // Adicionar transactionIdentification ao payload conforme o tipo de QR code
        const transactionId = paymentData.transactionIdentification || emvData.transactionIdentification;
        
        if (isDynamicQrCode) {
          // Para QR codes dinâmicos, transactionIdentification é obrigatório e deve ter entre 26-35 caracteres
          console.log(`[PixCopyPastePinScreen] QR code dinâmico: adicionando ID de transação: ${transactionId}`);
          payload.transactionIdentification = transactionId;
          
          // Verificar tamanho do transactionIdentification conforme documentação
          if (transactionId && (transactionId.length < 26 || transactionId.length > 35)) {
            console.warn(`[PixCopyPastePinScreen] Atenção: ID de transação deve ter entre 26-35 caracteres para QR codes dinâmicos. Tamanho atual: ${transactionId.length}`);
          }
        } else {
          // Para QR codes estáticos, transactionIdentification é obrigatório mas com tamanho máximo de 25 caracteres
          console.log(`[PixCopyPastePinScreen] QR code estático: adicionando ID de transação: ${transactionId || '***'}`);
          
          // Se não houver transactionId para QR code estático, gerar um ID
          if (!transactionId) {
            payload.transactionIdentification = `ST${Date.now().toString().substring(0, 20)}`;
            console.log(`[PixCopyPastePinScreen] ID de transação gerado: ${payload.transactionIdentification}`);
          } else {
            payload.transactionIdentification = transactionId;
            
            // Verificar tamanho do transactionIdentification conforme documentação
            if (transactionId && transactionId.length > 25) {
              console.warn(`[PixCopyPastePinScreen] Atenção: ID de transação deve ter no máximo 25 caracteres para QR codes estáticos. Tamanho atual: ${transactionId.length}`);
            }
          }
        }
        
        // Log detalhado do payload para depuração e verificação de conformidade com a documentação
        console.log('[PixCopyPastePinScreen] PAYLOAD COMPLETO:', JSON.stringify(payload, null, 2));
        
        // Verificar campos obrigatórios conforme documentação
        const camposObrigatorios = [
          'amount', 'clientCode', 'endToEndId', 'initiationType', 'paymentType',
          'urgency', 'transactionType', 'debitParty.account', 'creditParty.bank',
          'creditParty.key', 'creditParty.name', 'creditParty.accountType'
        ];
        
        const verificarCampo = (obj, caminho) => {
          const partes = caminho.split('.');
          let valor = obj;
          for (const parte of partes) {
            if (valor === undefined || valor === null) return false;
            valor = valor[parte];
          }
          return valor !== undefined && valor !== null && valor !== '';
        };
        
        const camposFaltantes = camposObrigatorios.filter(campo => !verificarCampo(payload, campo));
        
        if (camposFaltantes.length > 0) {
          console.warn('[PixCopyPastePinScreen] ATENÇÃO: Campos obrigatórios ausentes:', camposFaltantes);
        } else {
          console.log('[PixCopyPastePinScreen] Todos os campos obrigatórios estão presentes!');
        }
        
        // Verificar tamanho do transactionIdentification
        if (isDynamicQrCode && payload.transactionIdentification) {
          if (payload.transactionIdentification.length < 26 || payload.transactionIdentification.length > 35) {
            console.warn(`[PixCopyPastePinScreen] ATENÇÃO: Para QR codes dinâmicos, transactionIdentification deve ter entre 26-35 caracteres. Tamanho atual: ${payload.transactionIdentification.length}`);
          }
        } else if (isStaticQrCode && payload.transactionIdentification) {
          if (payload.transactionIdentification.length > 25) {
            console.warn(`[PixCopyPastePinScreen] ATENÇÃO: Para QR codes estáticos, transactionIdentification deve ter no máximo 25 caracteres. Tamanho atual: ${payload.transactionIdentification.length}`);
          }
        }
        
        console.log('[PixCopyPastePinScreen] Navegando para PixTransferLoading com dados:', {
          transferData,
          payload: payload
        });

        // Navegar para a tela de loading com dados estruturados e flags de tipo de QR code
        navigation.replace('PixTransferLoading', {
          transferData,
          payload,
          isCopyPaste: sourceFlow === 'copypaste',
          isQrCode: sourceFlow === 'qrcode',
          isDynamicQrCode,
          isStaticQrCode
        });
      } else {
        console.log('[PixCopyPastePinScreen] Falha na verificação do PIN');
      }
    } catch (err) {
      console.error('[PixCopyPastePinScreen] Erro ao verificar PIN:', err);
    }
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
          {/* Ícone de segurança */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons name="lock" size={30} color="#E91E63" />
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
              (pin.length !== 6 || isVerifying) && styles.confirmButtonDisabled
            ]}
            onPress={handleVerifyPin}
            disabled={pin.length !== 6 || isVerifying}
          >
            {isVerifying ? (
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

export default PixCopyPastePinScreen;
