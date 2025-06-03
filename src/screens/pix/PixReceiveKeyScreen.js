import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';

const KEY_TYPES = {
  EVP: "Chave Aleatória",
  CPF: "CPF",
  EMAIL: "Email",
  PHONE: "Celular",
  CNPJ: "CNPJ"
};

const PixKeyItem = ({ keyId, type, value, selected, onSelect }) => {
  return (
    <TouchableOpacity 
      style={styles.keyItem} 
      onPress={() => onSelect({ id: keyId, type, value })}
    >
      <View style={[styles.keyContent, selected && styles.keyContentSelected]}>
        <View style={styles.keyIconContainer}>
          <MaterialCommunityIcons name="key-variant" size={24} color="#E91E63" />
        </View>
        <View style={styles.keyInfo}>
          <Text style={styles.keyType}>{KEY_TYPES[type] || type}</Text>
          <Text style={styles.keyValue}>{value}</Text>
        </View>
        {selected && (
          <View style={styles.checkContainer}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#E91E63" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const PixReceiveKeyScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const { amount } = route.params;

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
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

      // Buscar chaves PIX
      const { data: keysData, error: keysError } = await supabase.functions.invoke(
        'get-pix-keys',
        { body: { account: kycData.account } }
      );

      if (keysError) throw keysError;

      const pixKeys = keysData.body?.listKeys || [];
      setKeys(pixKeys);
    } catch (err) {
      console.error('Erro ao buscar chaves:', err);
      setError('Não foi possível carregar suas chaves PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleKeySelect = (key) => {
    setSelectedKey(key);
  };

  const handleContinue = () => {
    if (selectedKey) {
      navigation.navigate('PixReceiveConfirm', { amount, selectedKey });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Carregando suas chaves PIX...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Chave PIX</Text>
        <Text style={styles.subtitle}>Selecione uma chave para receber</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              mode="contained"
              onPress={fetchKeys}
              style={styles.retryButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              TENTAR NOVAMENTE
            </Button>
          </View>
        ) : (
          <ScrollView style={styles.keysList} showsVerticalScrollIndicator={false}>
            {keys.length > 0 ? (
              keys.map((key) => (
                <PixKeyItem
                  key={key.id}
                  keyId={key.id}
                  type={key.type}
                  value={key.value}
                  selected={selectedKey?.id === key.id}
                  onSelect={handleKeySelect}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma chave PIX encontrada</Text>
                <Text style={styles.emptySubText}>É necessário cadastrar uma chave PIX para receber pagamentos</Text>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('RegisterPixKey')}
                  style={styles.registerKeyButton}
                  labelStyle={styles.buttonLabel}
                >
                  CADASTRAR CHAVE PIX
                </Button>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Continue Button */}
      {keys.length > 0 && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            disabled={!selectedKey}
          >
            CONTINUAR
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    color: '#E91E63',
    fontSize: 32,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  keysList: {
    flex: 1,
  },
  keyItem: {
    marginBottom: 12,
  },
  keyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  keyContentSelected: {
    backgroundColor: '#FCE4EC',
  },
  keyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  keyInfo: {
    flex: 1,
  },
  keyType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  checkContainer: {
    marginLeft: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  registerKeyButton: {
    backgroundColor: '#E91E63',
    marginTop: 16,
    width: '100%',
    borderRadius: 4,
    height: 56,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueButton: {
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
  },
});

export default PixReceiveKeyScreen;
