import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';

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

  const handleNext = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Senha do App</Text>
          <Text style={styles.subtitle}>
            Nesta etapa, você vai precisar cadastrar uma senha de acesso ao app
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <TextInput
              label="Senha"
              value={formData.password}
              onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#666666"
                />
              }
              mode="flat"
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
            />

            <TextInput
              label="Confirmar Senha"
              value={formData.confirmPassword}
              onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color="#666666"
                />
              }
              mode="flat"
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
            />

            {error ? (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            ) : null}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.continueButton}
            labelStyle={styles.continueButtonLabel}
            loading={loading}
            disabled={loading || !formData.password || !formData.confirmPassword}
          >
            {loading ? 'SALVANDO...' : 'CONTINUAR'}
          </Button>
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
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    minHeight: '100%',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  inputContent: {
    backgroundColor: '#FFF',
    fontSize: 16,
    paddingHorizontal: 0,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
    backgroundColor: '#E91E63',
    borderRadius: 4,
    paddingVertical: 8,
    height: 48,
    justifyContent: 'center',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default PasswordScreen;
