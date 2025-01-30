import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
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
          <MaterialCommunityIcons name="key-variant" size={24} color="#682145" />
        </View>
        <View style={styles.keyInfo}>
          <Text style={styles.keyType}>{KEY_TYPES[type] || type}</Text>
          <Text style={styles.keyValue}>{value}</Text>
        </View>
        {selected && (
          <View style={styles.checkContainer}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
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
      console.log('PIX Keys:', pixKeys); // Para debug
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
    if (!selectedKey) return;
    navigation.navigate('PixReceiveConfirm', { 
      amount,
      selectedKey
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#682145" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chaves</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Selecione uma chave</Text>

      <ScrollView style={styles.keysList}>
        {keys.map((key) => (
          <PixKeyItem
            key={key.id || `${key.type}-${key.value}`}
            keyId={key.id}
            type={key.type}
            value={key.value}
            selected={selectedKey?.id === key.id}
            onSelect={handleKeySelect}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          labelStyle={styles.continueButtonLabel}
          disabled={!selectedKey}
        >
          CONTINUAR
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  keysList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  keyItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  keyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  keyContentSelected: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  keyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  footer: {
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

export default PixReceiveKeyScreen;
