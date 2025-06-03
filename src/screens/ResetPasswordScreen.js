import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { token } = route.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de recuperação inválido ou ausente');
    }
  }, [token]);

  const validatePassword = () => {
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    
    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Chamar a Edge Function para redefinir a senha
      const { data, error: functionError } = await supabase.functions.invoke('password-reset', {
        body: {
          token,
          newPassword,
          action: 'reset'
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erro ao redefinir senha');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSuccess(true);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      
      // Mensagens de erro mais específicas
      if (error.message.includes('Token inválido')) {
        setError('O link de recuperação é inválido.');
      } else if (error.message.includes('Token expirado')) {
        setError('O link de recuperação expirou. Solicite um novo link.');
      } else if (error.message.includes('já foi utilizado')) {
        setError('Este link já foi utilizado. Solicite um novo link se necessário.');
      } else {
        setError('Não foi possível redefinir sua senha. O link pode ter expirado ou já foi utilizado.');
      }
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
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!success ? (
            <>
              <Text style={styles.title}>Redefinir senha</Text>
              <Text style={styles.subtitle}>
                Digite sua nova senha para acessar sua conta
              </Text>

              <View style={styles.form}>
                <TextInput
                  mode="flat"
                  label="Nova senha"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  error={!!error}
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
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                      color="#666666"
                    />
                  }
                  autoFocus
                  disabled={!token || loading}
                />
                
                <TextInput
                  mode="flat"
                  label="Confirmar nova senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  error={!!error}
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
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      color="#666666"
                    />
                  }
                  disabled={!token || loading}
                />
                
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#E91E63" style={styles.successIcon} />
              <Text style={styles.successTitle}>Senha atualizada!</Text>
              <Text style={styles.successText}>
                Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {!success ? (
            <TouchableOpacity
              style={[
                styles.button, 
                (!token || !newPassword || !confirmPassword || loading) && styles.buttonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={!token || !newPassword || !confirmPassword || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'REDEFININDO...' : 'REDEFINIR SENHA'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>IR PARA LOGIN</Text>
            </TouchableOpacity>
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
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  button: {
    backgroundColor: '#E91E63',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default ResetPasswordScreen;
