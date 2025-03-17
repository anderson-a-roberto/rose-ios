import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';

const TransferAccountScreen = ({ navigation, route }) => {
  const { amount } = route.params;
  const [destinationAccount, setDestinationAccount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccountChange = (text) => {
    // Remove tudo que não for número
    const numbers = text.replace(/\D/g, '');
    setDestinationAccount(numbers);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!destinationAccount) {
        setError('Digite o número da conta');
        return;
      }

      setLoading(true);
      setError('');

      // Buscar usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar número da conta
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycError) throw kycError;

      // Montar payload para a edge function
      const payload = {
        debitParty: {
          account: kycData.account,
          branch: "1",
          taxId: profileData.document_number,
          name: profileData.full_name
        },
        creditParty: {
          account: destinationAccount,
          branch: "1"
        },
        amount: amount,
        clientRequestId: `T${Date.now()}`,
        description: "Transferência interna"
      };

      // Chamar edge function
      const { data: transferResult, error: transferError } = await supabase.functions.invoke(
        'internal-transfer',
        { body: payload }
      );

      if (transferError) throw transferError;

      // Aceita tanto SUCCESS quanto PROCESSING como estados válidos
      if (transferResult.status === 'SUCCESS' || transferResult.status === 'PROCESSING') {
        const transferData = {
          status: transferResult.status,
          destinatario: transferResult.body.creditParty.name || 'Beneficiário',
          conta: destinationAccount,
          valor: amount,
          data: new Date().toISOString()
        };
        
        navigation.navigate('TransferSuccess', { transferData });
      } else {
        throw new Error('Erro ao processar transferência');
      }

    } catch (err) {
      console.error('Erro ao realizar transferência:', err);
      setError(err.message || 'Erro ao realizar transferência. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Processando transferência...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
            <Text style={styles.headerTitle}>Conta de destino</Text>
            <Text style={styles.subtitle}>Digite o número da conta</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Account Input */}
          <View style={styles.inputContainer}>
            <TextInput
              mode="flat"
              value={destinationAccount}
              onChangeText={handleAccountChange}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Digite o número da conta"
              placeholderTextColor="#666"
              autoFocus={true}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              selectionColor="#E91E63"
              error={!!error}
              theme={{
                colors: {
                  text: '#000000',
                  placeholder: '#666666',
                  primary: '#E91E63',
                }
              }}
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            disabled={!destinationAccount || loading}
          >
            CONTINUAR
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#FFF',
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
  headerContent: {
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 20,
    paddingHorizontal: 0,
    height: 56,
    color: '#000000'
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    marginTop: 8,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFF',
  },
});

export default TransferAccountScreen;
