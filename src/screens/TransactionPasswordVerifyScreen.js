import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TransactionPasswordVerifyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onSuccess } = route.params || {};
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const passwordInputRef = useRef(null);
  
  // Removido useFocusEffect em favor do autoFocus nativo do TextInput do React Native Paper
  
  const handleBack = () => {
    // Usar navigation.reset para forçar a navegação para a tela de Welcome
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleForgotPassword = async () => {
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

  const handlePasswordChange = (value) => {
    // Aceitar apenas dígitos e limitar a 6 caracteres
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 6) {
      setPassword(numericValue);
      setError('');
    }
  };

  // Removido o handleKeyPress para usar apenas o teclado nativo

  const handleVerifyPassword = () => {
    // Aqui você implementará a verificação real da senha
    // Por enquanto, vamos simular uma verificação básica
    if (password.length === 6) {
      // Simulação: senha 123456 é aceita
      if (password === '123456') {
        if (onSuccess) {
          onSuccess();
        } else {
          navigation.goBack();
        }
      } else {
        setError('Senha incorreta. Tente novamente.');
        setPassword('');
      }
    } else {
      setError('Digite a senha completa de 6 dígitos.');
    }
  };

  const renderPasswordDots = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View 
          key={i} 
          style={[
            styles.passwordDot,
            i < password.length && styles.passwordDotFilled
          ]}
        >
          {(showPassword && i < password.length) ? (
            <Text style={styles.passwordText}>{password[i]}</Text>
          ) : null}
        </View>
      );
    }
    return dots;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1D1D1D" />
          </TouchableOpacity>
        </View>

      <View style={styles.content}>
        <View style={styles.lockIconContainer}>
          <MaterialCommunityIcons name="lock" size={30} color="#2E7BFF" />
        </View>
        
        <Text style={styles.title}>Digite a senha de transação</Text>
        <Text style={styles.subtitle}>É usada para autorizar operações no app</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            mode="flat"
            ref={passwordInputRef}
            value={showPassword ? password : '•'.repeat(password.length)}
            onChangeText={(value) => {
              if (showPassword) {
                const clean = value.replace(/[^0-9]/g, '').slice(0, 6);
                setPassword(clean);
              } else {
                const prevLen = password.length;
                const currLen = value.length;

                if (currLen > prevLen) {
                  const last = value.charAt(value.length - 1);
                  if (/\d/.test(last)) setPassword((p) => (p + last).slice(0, 6));
                } else if (currLen < prevLen) {
                  setPassword((p) => p.slice(0, -1));
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
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#2E7BFF" />
        </TouchableOpacity>
      </View>

      {/* Teclado nativo do iOS será usado */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            password.length !== 6 && styles.continueButtonDisabled
          ]}
          onPress={handleVerifyPassword}
          disabled={password.length !== 6}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 0,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(46, 123, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  },
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    width: '100%',
  },
  passwordDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666666',
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginBottom: 16,
  },
  forgotPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#2E7BFF',
    fontSize: 14,
    marginRight: 4,
  },
  keyboardContainer: {
    display: 'none',
  },
  // Adicionando os estilos faltantes
  inputContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  pinInput: {
    height: 56,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  keyboardKey: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 8,
    marginHorizontal: 3,
  },
  keyboardKeyText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  keyboardKeySubText: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  okButtonActive: {
    backgroundColor: '#2E7BFF',
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  okButtonTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  continueButton: {
    backgroundColor: '#682145',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
