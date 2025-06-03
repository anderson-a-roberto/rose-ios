import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text } from 'react-native-paper';
import { useTransactionPassword } from '../contexts/TransactionPasswordContext';

const PinVerificationModal = ({ visible, onClose, onSuccess }) => {
  const { verifyTransactionPassword, isVerifying, error } = useTransactionPassword();
  const [pin, setPin] = useState('');
  const pinInputRef = useRef(null);
  
  // Limpar o PIN quando o modal é aberto ou fechado
  useEffect(() => {
    setPin('');
    if (visible && pinInputRef.current) {
      // Focar no input quando o modal é aberto
      setTimeout(() => {
        pinInputRef.current.focus();
      }, 300);
    }
  }, [visible]);
  
  // Mostrar erro se houver
  useEffect(() => {
    if (error && visible) {
      Alert.alert('Erro', error);
    }
  }, [error, visible]);
  
  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      Alert.alert('Erro', 'O PIN deve ter 6 dígitos');
      return;
    }
    
    try {
      const success = await verifyTransactionPassword(pin);
      if (success) {
        setPin('');
        onSuccess();
      }
    } catch (err) {
      console.error('Erro ao verificar PIN:', err);
    }
  };
  
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Verificação de Segurança</Text>
            <Text style={styles.subtitle}>Digite seu PIN de transação</Text>
            
            {/* Input para o PIN */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={pinInputRef}
                value={pin}
                onChangeText={(value) => {
                  // Aceitar apenas dígitos e limitar a 6 caracteres
                  const numericValue = value.replace(/[^0-9]/g, '');
                  if (numericValue.length <= 6) {
                    setPin(numericValue);
                  }
                }}
                style={styles.hiddenInput}
                keyboardType="numeric"
                maxLength={6}
                caretHidden
                secureTextEntry
              />
              
              {/* Visualização de bolinhas para o PIN */}
              <View style={styles.pinDisplay}>
                {Array(6).fill(0).map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.pinDot,
                      index < pin.length ? styles.pinDotFilled : styles.pinDotEmpty
                    ]}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isVerifying}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>
              
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
                  <Text style={styles.confirmButtonText}>CONFIRMAR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666666',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 50,
    width: '100%',
    zIndex: 1,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    height: 50,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  pinDotEmpty: {
    backgroundColor: '#E0E0E0',
  },
  pinDotFilled: {
    backgroundColor: '#E91E63',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E91E63',
  },
  cancelButtonText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PinVerificationModal;
