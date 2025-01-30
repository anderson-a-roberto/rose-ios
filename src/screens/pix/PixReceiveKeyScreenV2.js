import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, Portal, Modal, RadioButton, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';

const KEY_TYPES = {
  EVP: "Chave Aleatória",
  CPF: "CPF",
  EMAIL: "Email",
  PHONE: "Celular",
  CNPJ: "CNPJ"
};

const PixReceiveKeyScreenV2 = ({ navigation, route }) => {
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keys, setKeys] = useState([]);
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

      <ScrollView style={styles.content}>
        <RadioButton.Group
          onValueChange={value => {
            const key = keys.find(k => k.key === value);
            setSelectedKey(key);
          }}
          value={selectedKey?.key}
        >
          {keys.map((key) => (
            <TouchableOpacity
              key={key.key} // Usando key.key como identificador único
              style={styles.keyItem}
              onPress={() => {
                setSelectedKey(key);
              }}
            >
              <View style={styles.keyContent}>
                <View style={styles.keyIconContainer}>
                  <MaterialCommunityIcons name="key-variant" size={24} color="#682145" />
                </View>
                <View style={styles.keyInfo}>
                  <Text style={styles.keyType}>{KEY_TYPES[key.keyType] || key.keyType}</Text>
                  <Text style={styles.keyValue}>{key.key}</Text>
                </View>
                <RadioButton value={key.key} />
              </View>
            </TouchableOpacity>
          ))}
        </RadioButton.Group>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  keyItem: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  keyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
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
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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

export default PixReceiveKeyScreenV2;
