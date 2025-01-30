import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, Portal, Modal, RadioButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';

const KEY_TYPES = {
  EVP: "Chave Aleatória",
  CPF: "CPF",
  EMAIL: "Email",
  PHONE: "Telefone",
  CNPJ: "CNPJ"
};

const RegisterPixKeyScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleCreateKey = async () => {
    try {
      if (!selectedType) {
        setError('Selecione um tipo de chave');
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

      // Registrar chave PIX
      const { data: registerData, error: registerError } = await supabase.functions.invoke(
        'register-pix-key',
        {
          body: {
            account: kycData.account,
            keyType: selectedType,
            key: selectedType === 'EVP' ? undefined : profileData.document_number
          }
        }
      );

      if (registerError) throw registerError;

      if (registerData.status === 'CONFIRMED') {
        setSuccessData({
          keyType: KEY_TYPES[selectedType],
          key: registerData.body.key
        });
        setShowSuccessModal(true);
        // Atualizar lista na tela anterior usando navegação direta
        navigation.navigate('PixKeysScreen', { updatePixKeys: true });
      } else {
        throw new Error('Erro ao registrar chave PIX');
      }

    } catch (err) {
      console.error('Erro ao criar chave PIX:', err);
      setError(err.message || 'Erro ao criar chave PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const SuccessModal = () => (
    <Portal>
      <Modal
        visible={showSuccessModal}
        onDismiss={() => {
          setShowSuccessModal(false);
          navigation.navigate('PixKeysScreen', { updatePixKeys: true });
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <MaterialCommunityIcons
            name="check-circle"
            size={48}
            color="#4CAF50"
            style={styles.successIcon}
          />
          <Text style={styles.modalTitle}>Chave cadastrada com sucesso!</Text>
          <Text style={styles.modalText}>
            Agora usuários do PIX podem fazer transações para você informando essa chave, 
            sem a necessidade de digitar seus dados. Esses usuários terão visibilidade 
            dos dados atrelado a essa chave.
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              setShowSuccessModal(false);
              navigation.navigate('PixKeysScreen', { updatePixKeys: true });
            }}
            style={styles.okButton}
            labelStyle={styles.okButtonLabel}
          >
            OK
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Chave</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>
        Selecione uma chave para cadastrar. Cada chave só poderá ser vinculada a uma única conta.
      </Text>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Selecione a chave desejada</Text>

        <RadioButton.Group
          onValueChange={value => setSelectedType(value)}
          value={selectedType}
        >
          {Object.entries(KEY_TYPES).map(([type, label]) => (
            <TouchableOpacity
              key={type}
              style={styles.radioItem}
              onPress={() => setSelectedType(type)}
            >
              <View style={styles.radioLeft}>
                <MaterialCommunityIcons
                  name={type === 'EVP' ? 'key-variant' : type === 'PHONE' ? 'phone' : 'email'}
                  size={24}
                  color="#682145"
                />
                <View style={styles.radioTextContainer}>
                  <Text style={styles.radioLabel}>{label}</Text>
                  {type === 'CPF' && <Text style={styles.radioValue}>123.456.789-10</Text>}
                  {type === 'PHONE' && <Text style={styles.radioValue}>(11) 91234-5678</Text>}
                  {type === 'EMAIL' && <Text style={styles.radioValue}>exemplo@email.com</Text>}
                </View>
              </View>
              <RadioButton value={type} color="#682145" />
            </TouchableOpacity>
          ))}
        </RadioButton.Group>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleCreateKey}
          style={styles.registerButton}
          labelStyle={styles.registerButtonLabel}
          loading={loading}
          disabled={loading || !selectedType}
        >
          CADASTRAR CHAVE
        </Button>
      </View>

      <SuccessModal />
    </View>
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  radioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioTextContainer: {
    marginLeft: 16,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  radioValue: {
    fontSize: 14,
    color: '#000',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  registerButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 25,
  },
  registerButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorText: {
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: '#1B1B1B',
    width: '100%',
    borderRadius: 25,
  },
  okButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default RegisterPixKeyScreen;
