import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';
import { useCharge } from '../../contexts/ChargeContext';

const KEY_TYPES = {
  EVP: "Chave Aleatória",
  CPF: "CPF",
  EMAIL: "Email",
  PHONE: "Celular",
  CNPJ: "CNPJ"
};

const PixKeyItem = ({ keyId, type, value, selected, onSelect, account, owner }) => {
  return (
    <TouchableOpacity 
      style={styles.keyItem} 
      onPress={() => onSelect({ 
        id: keyId,
        type,
        value,
        key: keyId,
        keyType: type,
        account,
        owner
      })}
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

const CreateChargeKeyScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const { updateChargeData } = useCharge();

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

      const pixKeys = (keysData.body?.listKeys || []).map(item => ({
        id: item.key,
        type: item.keyType,
        value: item.key,
        key: item.key,
        keyType: item.keyType,
        account: item.account,
        owner: item.owner
      }));

      console.log('Chaves PIX mapeadas:', pixKeys);
      setKeys(pixKeys);
    } catch (err) {
      console.error('Erro ao buscar chaves:', err);
      setError('Não foi possível carregar suas chaves PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleKeySelect = (key) => {
    console.log('Chave selecionada:', key);
    setSelectedKey(key);
  };

  const handleNext = () => {
    if (selectedKey) {
      console.log('Navegando com a chave:', selectedKey);
      console.log('Dados do receiver:', {
        key: selectedKey.key,
        document: selectedKey.owner.documentNumber,
        account: selectedKey.account.account
      });
      updateChargeData({ 
        key: selectedKey.key,
        receiver: {
          document: selectedKey.owner.documentNumber,
          account: selectedKey.account.account
        }
      });
      navigation.navigate('CreateChargeFines');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
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
          <Text style={styles.headerTitle}>Chave PIX</Text>
          <Text style={styles.subtitle}>Selecione a chave que receberá o pagamento</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              onPress={fetchKeys}
              style={styles.retryButton}
            >
              Tentar Novamente
            </Button>
          </View>
        ) : (
          <>
            {keys.map((key) => (
              <PixKeyItem
                key={key.id}
                keyId={key.id}
                type={key.type}
                value={key.value}
                selected={selectedKey?.id === key.id}
                onSelect={handleKeySelect}
                account={key.account}
                owner={key.owner}
              />
            ))}
            {keys.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma chave PIX encontrada</Text>
                <Text style={styles.emptySubText}>É necessário cadastrar uma chave PIX para criar cobranças</Text>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('RegisterPixKey')}
                  style={styles.registerKeyButton}
                  labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
                >
                  CADASTRAR CHAVE PIX
                </Button>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      {keys.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: '#FFF' }]}
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
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#FFF',
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
  keyItem: {
    marginBottom: 12,
  },
  keyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  keyContentSelected: {
    backgroundColor: '#FCE4EC',
  },
  keyIconContainer: {
    marginRight: 16,
  },
  keyInfo: {
    flex: 1,
    marginLeft: 16,
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
    marginLeft: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#E91E63',
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
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#E91E63',
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateChargeKeyScreen;
