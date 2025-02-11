import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text, TextInput, Button, List } from 'react-native-paper';
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
          <TextInput
            mode="outlined"
            label="Chave PIX"
            value={pixKey}
            onChangeText={(text) => {
              setPixKey(text);
              setError(null);
            }}
            style={styles.input}
            placeholder="Digite a chave PIX"
            error={!!error}
            disabled={loading}
            outlineColor="#E0E0E0"
            activeOutlineColor="#E91E63"
            theme={{ colors: { error: '#E91E63' } }}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Options */}
          <View style={styles.optionsContainer}>
            <List.Item
              title="Favoritos"
              description="Você ainda não possui favoritos"
              left={props => <List.Icon {...props} icon="star" color="#E91E63" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
            
            <List.Item
              title="Agência e Conta"
              description="Insira os dados bancários caso não tenha uma chave para transferência"
              left={props => <List.Icon {...props} icon="bank" color="#E91E63" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
          </View>
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
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  errorText: {
    color: '#E91E63',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 16,
    marginLeft: 4,
  },
  optionsContainer: {
    marginTop: 24,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  listItemTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 14,
    color: '#666',
    opacity: 0.8,
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

export default PixTransferKeyScreen;
