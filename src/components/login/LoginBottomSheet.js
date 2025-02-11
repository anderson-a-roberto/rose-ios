import React, { useEffect, useState } from 'react';
import { 
  View, 
  Modal, 
  StyleSheet, 
  Animated, 
  TouchableWithoutFeedback,
  Dimensions 
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

const formatDocument = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 11) {
    // CPF
    return numbers.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    );
  } else {
    // CNPJ
    return numbers.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }
};

const LoginBottomSheet = ({ visible, onDismiss, onContinue, loading }) => {
  const [document, setDocument] = useState('');
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleDocumentChange = (text) => {
    const formatted = formatDocument(text);
    setDocument(formatted);
  };

  const handleContinue = () => {
    const documentNumbers = document.replace(/\D/g, '');
    if (documentNumbers.length === 11 || documentNumbers.length === 14) {
      const accountType = documentNumbers.length === 11 ? 'PF' : 'PJ';
      onContinue(documentNumbers, accountType);
      setDocument('');
    }
  };

  const isValidDocument = () => {
    const numbers = document.replace(/\D/g, '');
    return numbers.length === 11 || numbers.length === 14;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.indicator} />
              <Text style={styles.title}>CPF/CNPJ</Text>
              <TextInput
                mode="flat"
                value={document}
                onChangeText={handleDocumentChange}
                placeholder="000.000.000-00"
                style={styles.input}
                contentStyle={styles.inputContent}
                theme={{
                  colors: {
                    primary: '#E91E63',
                    error: '#B00020',
                    onSurfaceVariant: '#666666',
                    onSurface: '#000000',
                  },
                }}
                keyboardType="numeric"
                maxLength={18}
                disabled={loading}
              />
              <TouchableWithoutFeedback>
                <Text style={styles.forgotPassword}>
                  Esqueceu a senha? Clique aqui
                </Text>
              </TouchableWithoutFeedback>
              <Button
                mode="contained"
                style={[styles.button, !isValidDocument() && styles.buttonDisabled]}
                labelStyle={styles.buttonLabel}
                onPress={handleContinue}
                disabled={!isValidDocument() || loading}
                loading={loading}
              >
                {loading ? 'VERIFICANDO...' : 'CONTINUAR'}
              </Button>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: '40%',
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 24,
    borderRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  forgotPassword: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    paddingVertical: 8,
  },
});

export default LoginBottomSheet;
