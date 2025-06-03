import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView, TextInput as RNTextInput } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';

// Função para validar senha forte
const validatePassword = (password) => {
  // Verifica se tem pelo menos 8 caracteres
  const hasMinLength = password.length >= 8;
  
  // Verifica se tem pelo menos uma letra maiúscula
  const hasUpperCase = /[A-Z]/.test(password);
  
  // Verifica se tem pelo menos uma letra minúscula
  const hasLowerCase = /[a-z]/.test(password);
  
  // Verifica se tem pelo menos um número
  const hasNumber = /[0-9]/.test(password);
  
  // Verifica se tem pelo menos um caractere especial
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return {
    isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar
  };
};

const PasswordScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  // Validar senha sempre que ela mudar
  useEffect(() => {
    if (formData.password) {
      setPasswordValidation(validatePassword(formData.password));
    }
  }, [formData.password]);

  const handleNext = async () => {
    // Verificar se as senhas coincidem
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    // Verificar se a senha é forte
    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      setError('A senha não atende aos requisitos mínimos de segurança');
      return;
    }

    if (onboardingData.accountType === 'PJ') {
      setError('Fluxo inválido para PJ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Salvar senha
      updateOnboardingData({
        securityData: {
          password: formData.password
        }
      });

      // 2. Navegar para a próxima tela
      navigation.navigate('OnboardingPhone');
    } catch (err) {
      console.log('Erro ao salvar senha:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <Text style={styles.headerTitle}>Senha do App</Text>
          <Text style={styles.subtitle}>
            Nesta etapa, você vai precisar cadastrar uma senha de acesso ao app
          </Text>
        </View>
      </View>

      {/* Wrapper para o KeyboardAvoidingView */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Container principal que envolve o ScrollView e o botão */}
        <View style={styles.mainContainer}>
          {/* ScrollView com o formulário */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                value={showPassword ? formData.password : "•".repeat(formData.password.length)}
                onChangeText={(value) => {
                  // Se estiver mostrando a senha real, atualizamos normalmente
                  if (showPassword) {
                    setFormData(prev => ({ ...prev, password: value }));
                  } else {
                    // Se estiver mostrando os pontos, precisamos determinar se o usuário adicionou ou removeu caracteres
                    const previousLength = formData.password.length;
                    const currentLength = value.length;
                    
                    if (currentLength > previousLength) {
                      // Adicionou caracteres - pegamos apenas o último caractere adicionado
                      const lastChar = value.charAt(value.length - 1);
                      if (lastChar !== '•') { // Certifique-se de que não estamos adicionando um ponto
                        setFormData(prev => ({ ...prev, password: prev.password + lastChar }));
                      }
                    } else if (currentLength < previousLength) {
                      // Removeu caracteres - removemos o último caractere da senha real
                      setFormData(prev => ({ ...prev, password: prev.password.slice(0, -1) }));
                    }
                  }
                }}
                secureTextEntry={false}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#666666"
                  />
                }
                style={[styles.input, formData.password && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />

              <Text style={styles.label}>Confirmar Senha</Text>
              <TextInput
                value={showConfirmPassword ? formData.confirmPassword : "•".repeat(formData.confirmPassword.length)}
                onChangeText={(value) => {
                  // Se estiver mostrando a senha real, atualizamos normalmente
                  if (showConfirmPassword) {
                    setFormData(prev => ({ ...prev, confirmPassword: value }));
                  } else {
                    // Se estiver mostrando os pontos, precisamos determinar se o usuário adicionou ou removeu caracteres
                    const previousLength = formData.confirmPassword.length;
                    const currentLength = value.length;
                    
                    if (currentLength > previousLength) {
                      // Adicionou caracteres - pegamos apenas o último caractere adicionado
                      const lastChar = value.charAt(value.length - 1);
                      if (lastChar !== '•') { // Certifique-se de que não estamos adicionando um ponto
                        setFormData(prev => ({ ...prev, confirmPassword: prev.confirmPassword + lastChar }));
                      }
                    } else if (currentLength < previousLength) {
                      // Removeu caracteres - removemos o último caractere da senha real
                      setFormData(prev => ({ ...prev, confirmPassword: prev.confirmPassword.slice(0, -1) }));
                    }
                  }
                }}
                secureTextEntry={false}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    color="#666666"
                  />
                }
                style={[styles.input, formData.confirmPassword && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />

              {/* Requisitos de senha */}
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>A senha deve conter:</Text>
                <View style={styles.requirementItem}>
                  <View style={[styles.checkCircle, passwordValidation.hasMinLength && styles.validCheck]}>
                    {passwordValidation.hasMinLength && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.requirementText, passwordValidation.hasMinLength && styles.validRequirement]}>Mínimo de 8 caracteres</Text>
                </View>
                <View style={styles.requirementItem}>
                  <View style={[styles.checkCircle, passwordValidation.hasUpperCase && styles.validCheck]}>
                    {passwordValidation.hasUpperCase && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.requirementText, passwordValidation.hasUpperCase && styles.validRequirement]}>Pelo menos uma letra maiúscula</Text>
                </View>
                <View style={styles.requirementItem}>
                  <View style={[styles.checkCircle, passwordValidation.hasLowerCase && styles.validCheck]}>
                    {passwordValidation.hasLowerCase && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.requirementText, passwordValidation.hasLowerCase && styles.validRequirement]}>Pelo menos uma letra minúscula</Text>
                </View>
                <View style={styles.requirementItem}>
                  <View style={[styles.checkCircle, passwordValidation.hasNumber && styles.validCheck]}>
                    {passwordValidation.hasNumber && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.requirementText, passwordValidation.hasNumber && styles.validRequirement]}>Pelo menos um número</Text>
                </View>
                <View style={styles.requirementItem}>
                  <View style={[styles.checkCircle, passwordValidation.hasSpecialChar && styles.validCheck]}>
                    {passwordValidation.hasSpecialChar && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.requirementText, passwordValidation.hasSpecialChar && styles.validRequirement]}>Pelo menos um caractere especial</Text>
                </View>
              </View>
              
              {error ? (
                <Text style={styles.errorText}>
                  {error}
                </Text>
              ) : null}
              
              {/* Espaço extra no final para garantir que o último campo seja visível acima do botão */}
              <View style={styles.bottomPadding} />
            </View>
          </ScrollView>

          {/* Botão de continuar - sempre visível */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.continueButton}
              labelStyle={styles.continueButtonLabel}
              loading={loading}
              disabled={loading || !formData.password || !formData.confirmPassword || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
            >
              {loading ? 'SALVANDO...' : 'CONTINUAR'}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  // Container principal para o KeyboardAvoidingView
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Container que envolve o ScrollView e o botão
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFF',
  },
  // ScrollView que contém o formulário
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    fontSize: 16,
    height: 48,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
    marginBottom: 16,
    ...(Platform.OS === 'ios' && {
      height: 56, // Altura fixa para iOS
      paddingVertical: 8, // Adicionar padding vertical para melhorar a visibilidade do cursor
    }),
  },
  filledInput: {
    fontWeight: '500',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
  },
  passwordRequirements: {
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validCheck: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkMark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: 13,
    color: '#666',
  },
  validRequirement: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  // Espaço extra no final do formulário para garantir que o último campo fique visível acima do botão
  bottomPadding: {
    height: 100,
  },
  // Container do botão - sempre visível na parte inferior
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  continueButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});

export default PasswordScreen;
