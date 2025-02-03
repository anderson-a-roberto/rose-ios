import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transferir</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Para quem você quer transferir?</Text>

      {/* Key Input */}
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          label="Chave PIX"
          value={pixKey}
          onChangeText={(text) => {
            setPixKey(text);
            setError(null);
          }}
          style={styles.input}
          error={!!error}
          disabled={loading}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Favorites Section */}
      <View style={styles.favoritesSection}>
        <View style={styles.favoriteHeader}>
          <MaterialCommunityIcons name="star" size={20} color="#682145" />
          <Text style={styles.favoriteTitle}>Favoritos</Text>
        </View>
        <Text style={styles.favoriteSubtitle}>Você ainda não possui favoritos</Text>
      </View>

      {/* Agency and Account Section */}
      <View style={styles.agencySection}>
        <View style={styles.agencyHeader}>
          <MaterialCommunityIcons name="bank" size={20} color="#682145" />
          <Text style={styles.agencyTitle}>Agência e Conta</Text>
        </View>
        <Text style={styles.agencySubtitle}>Insira os dados bancários caso não tenha uma chave para transferência</Text>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          labelStyle={styles.continueButtonLabel}
          loading={loading}
          disabled={loading || !pixKey.trim()}
        >
          CONTINUAR
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  favoritesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  favoriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteTitle: {
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  favoriteSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  agencySection: {
    paddingHorizontal: 16,
  },
  agencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agencyTitle: {
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  agencySubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 25,
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#fff',
  },
});

export default PixTransferKeyScreen;
