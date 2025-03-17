import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';

const PixTransferKeyScreen = ({ navigation, route }) => {
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { amount } = route.params;

  const handleContinue = async () => {
    try {
      if (!pixKey.trim()) {
        setError('Digite uma chave PIX');
        return;
      }

      setLoading(true);
      setError(null);

      // Buscar usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar CPF do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number')
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

      // Consultar PIX Dict
      const { data: dictResponse, error: dictError } = await supabase.functions.invoke(
        'get-pix-dict',
        {
          body: {
            key: pixKey,
            account: kycData.account
          }
        }
      );

      if (dictError) throw dictError;

      if (dictResponse.status === 'ERROR') {
        throw new Error(dictResponse.error?.message || 'Erro ao consultar chave PIX');
      }

      // Navegar para tela de confirmação
      navigation.navigate('PixTransferConfirm', {
        amount,
        pixKey,
        dictData: dictResponse.data,
        accountData: {
          account: kycData.account,
          documentNumber: profileData.document_number
        }
      });

    } catch (err) {
      console.error('Erro ao consultar PIX:', err);
      setError(err.message || 'Erro ao consultar chave PIX');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Transferir</Text>
            <Text style={styles.subtitle}>Para quem você quer transferir?</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Key Input */}
          <Text style={styles.label}>Chave PIX</Text>
          <TextInput
            value={pixKey}
            onChangeText={(text) => {
              setPixKey(text);
              setError(null);
            }}
            style={[styles.input, pixKey && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={pixKey ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: pixKey ? '600' : '400' } } }}
            placeholder="Digite a chave PIX"
            error={!!error}
            disabled={loading}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading || !pixKey.trim()}
          >
            CONTINUAR
          </Button>
        </View>
      </View>
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
    paddingHorizontal: 20,
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
  },
  filledInput: {
    backgroundColor: '#FFF',
  },
  errorText: {
    color: '#E91E63',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#E91E63',
    height: 48,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  }
});

export default PixTransferKeyScreen;
