import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';

const ResetPinScreen = ({ route, navigation }) => {
  const { token } = route.params || {};
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  
  const pinInputRef = useRef(null);
  const confirmPinInputRef = useRef(null);
  
  // Validações do PIN
  const hasMinLength = pin.length === 6;
  const hasFourDifferentDigits = new Set(pin.split('')).size >= 4;
  const hasNoSequence = !/(123|321|111|222|333|444|555|666|777|888|999|000)/.test(pin);
  const pinsMatch = pin === confirmPin && pin.length > 0;
  const isValid = hasMinLength && hasFourDifferentDigits && hasNoSequence && pinsMatch;
  
  // Verificar o token quando a tela é carregada
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token de recuperação inválido ou ausente.');
        setVerifying(false);
        return;
      }
      
      try {
        // Chamar a edge function para verificar o token
        const { data, error: functionError } = await supabase.functions.invoke('pin-reset-2', {
          body: { 
            action: "verify",
            token: token
          }
        });
        
        if (functionError) {
          console.error('[ResetPinScreen] Erro ao verificar token:', functionError);
          throw new Error(functionError.message || 'Token inválido ou expirado');
        }
        
        if (!data || !data.email) {
          throw new Error('Token inválido ou expirado');
        }
        
        // Token válido, guardar o email do usuário
        setUserEmail(data.email);
        setTokenValid(true);
      } catch (error) {
        console.error('[ResetPinScreen] Erro:', error);
        setError(error.message || 'Não foi possível verificar o token. Solicite um novo link de recuperação.');
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  const handleResetPin = async () => {
    if (!isValid || !tokenValid) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Chamar a edge function para redefinir o PIN
      const { error: resetError } = await supabase.functions.invoke('pin-reset-2', {
        body: { 
          action: "reset",
          token: token,
          pin: pin
        }
      });
      
      if (resetError) {
        console.error('[ResetPinScreen] Erro ao redefinir PIN:', resetError);
        throw new Error(resetError.message || 'Erro ao redefinir o PIN');
      }
      
      // Redefinição bem-sucedida, mostrar alerta e navegar para a tela de login
      Alert.alert(
        'PIN Redefinido',
        'Seu PIN de transação foi redefinido com sucesso.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navegar para a tela de login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('[ResetPinScreen] Erro:', error);
      setError(error.message || 'Não foi possível redefinir o PIN. Tente novamente.');
    } finally {
      setLoading(false);
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Welcome')}
            disabled={loading}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          {/* Ícone de segurança */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons name="lock-reset" size={36} color="#E91E63" />
            </View>
          </View>
          
          {/* Título */}
          <Text style={styles.title}>Redefinir PIN de transação</Text>
          
          {verifying ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.loadingText}>Verificando token...</Text>
            </View>
          ) : tokenValid ? (
            <>
              <Text style={styles.subtitle}>
                Crie um novo PIN de 6 dígitos para sua conta {userEmail}
              </Text>
              
              {/* Input para o novo PIN */}
              <View style={styles.inputContainer}>
                <TextInput
                  mode="flat"
                  ref={pinInputRef}
                  label="Novo PIN"
                  value={showPin ? pin : '•'.repeat(pin.length)}
                  onChangeText={(value) => {
                    if (showPin) {
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
                  keyboardType="number-pad"
                  autoFocus
                  right={
                    <TextInput.Icon
                      icon={showPin ? 'eye-off' : 'eye'}
                      onPress={() => setShowPin(!showPin)}
                      color="#666"
                    />
                  }
                  style={styles.pinInput}
                />
                
                <TextInput
                  mode="flat"
                  ref={confirmPinInputRef}
                  label="Confirmar PIN"
                  value={showConfirmPin ? confirmPin : '•'.repeat(confirmPin.length)}
                  onChangeText={(value) => {
                    if (showConfirmPin) {
                      const clean = value.replace(/[^0-9]/g, '').slice(0, 6);
                      setConfirmPin(clean);
                    } else {
                      const prevLen = confirmPin.length;
                      const currLen = value.length;
                      if (currLen > prevLen) {
                        const last = value.charAt(value.length - 1);
                        if (/\d/.test(last)) setConfirmPin((p) => (p + last).slice(0, 6));
                      } else if (currLen < prevLen) {
                        setConfirmPin((p) => p.slice(0, -1));
                      }
                    }
                    setError('');
                  }}
                  keyboardType="number-pad"
                  right={
                    <TextInput.Icon
                      icon={showConfirmPin ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPin(!showConfirmPin)}
                      color="#666"
                    />
                  }
                  style={styles.pinInput}
                />
              </View>
              
              {/* Instruções e validação */}
              <View style={styles.instructionsContainer}>
                <Text style={[styles.instructionText, hasMinLength && styles.validInstruction]}>
                  • Deve ter 6 dígitos
                </Text>
                <Text style={[styles.instructionText, hasFourDifferentDigits && styles.validInstruction]}>
                  • Deve conter pelo menos 4 dígitos diferentes
                </Text>
                <Text style={[styles.instructionText, hasNoSequence && styles.validInstruction]}>
                  • Não pode conter sequências como 123, 321 ou dígitos repetidos
                </Text>
                <Text style={[styles.instructionText, pinsMatch && styles.validInstruction]}>
                  • Os PINs devem ser idênticos
                </Text>
              </View>
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
              
              {/* Botão de redefinir */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!isValid || loading) && styles.confirmButtonDisabled
                ]}
                onPress={handleResetPin}
                disabled={!isValid || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>REDEFINIR PIN</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={64} color="#B00020" style={styles.errorIcon} />
              <Text style={styles.errorTitle}>Token inválido</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.requestNewButton}
                onPress={() => navigation.navigate('ForgotPin')}
              >
                <Text style={styles.requestNewButtonText}>SOLICITAR NOVO LINK</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 32,
    color: '#000000',
    marginTop: -4,
  },
  content: {
    flex: 0,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    marginTop: -20,
  },
  iconContainer: {
    marginBottom: 10,
    marginTop: 0,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  pinInput: {
    backgroundColor: 'transparent',
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#000000',
    width: '100%',
    height: 50,
    marginBottom: 10,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
    width: '100%',
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  pinDotEmpty: {
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  pinDotCurrent: {
    borderColor: '#E91E63',
    borderWidth: 2,
    transform: [{scale: 1.1}],
  },
  instructionsContainer: {
    width: '100%',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  validInstruction: {
    color: '#000000',
  },
  confirmButton: {
    backgroundColor: '#E91E63',
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B00020',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  requestNewButton: {
    backgroundColor: '#E91E63',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  requestNewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ResetPinScreen;
