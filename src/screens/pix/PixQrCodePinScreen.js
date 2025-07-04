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

const PixQrCodePinScreen = ({ navigation, route }) => {
  const { verifyTransactionPassword, isVerifying, error: contextError } = useTransactionPassword();
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const pinInputRef = useRef(null);
  const { paymentData, emvData, dictData, amount } = route.params;
  
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
      console.log('[PixQrCodePinScreen] Verificando PIN...');
      const success = await verifyTransactionPassword(pin);
      
      if (success) {
        console.log('[PixQrCodePinScreen] PIN verificado com sucesso! Navegando para loading...');
        
        // Estruturar dados para o loading screen (igual ao Copy-Paste)
        const transferData = {
          amount: amount,
          description: emvData?.merchantName || dictData?.name || 'Pagamento PIX QR Code',
          beneficiary: {
            name: emvData?.merchantName || dictData?.name || 'Beneficiário',
            taxId: dictData?.documentnumber || 'N/A',
            bank: dictData?.participant || 'N/A'
          }
        };

        // Gerar clientCode único
        const clientCode = `QR${Date.now()}`;
        
        // Estruturar payload para API (usando mesma estrutura do Copy-Paste)
        const payload = {
          ...paymentData,
          clientCode
        };

        console.log('[PixQrCodePinScreen] Navegando para PixTransferLoading com:', {
          transferData,
          payload,
          isQrCode: true
        });

        // Navegar para loading screen que executará o pagamento
        navigation.replace('PixTransferLoading', {
          transferData,
          payload,
          isQrCode: true
        });
      } else {
        console.log('[PixQrCodePinScreen] Falha na verificação do PIN');
      }
    } catch (err) {
      console.error('[PixQrCodePinScreen] Erro ao verificar PIN:', err);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Ícone */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons name="qrcode" size={32} color="#E91E63" />
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>Digite seu PIN de segurança</Text>
          <Text style={styles.subtitle}>
            Para confirmar o pagamento PIX QR Code de {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(amount)}
          </Text>

          {/* Input do PIN */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={pinInputRef}
              mode="outlined"
              value={pin}
              onChangeText={setPin}
              placeholder="Digite seu PIN de 6 dígitos"
              secureTextEntry={!showPassword}
              keyboardType="numeric"
              maxLength={6}
              style={styles.pinInput}
              outlineColor="#E91E63"
              activeOutlineColor="#E91E63"
              autoFocus={true}
              theme={{
                colors: {
                  text: '#000000',
                  placeholder: '#666666',
                  primary: '#E91E63',
                }
              }}
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
    flex: 1,
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
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 8,
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

export default PixQrCodePinScreen;
