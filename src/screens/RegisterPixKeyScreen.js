import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text, Button, Portal, Modal, RadioButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

const KEY_TYPES = {
  EVP: "Chave Aleatória"
};

const getIconForKeyType = (key) => {
  return 'key-variant';
};

const RegisterPixKeyScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState('EVP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleCreateKey = async () => {
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

      // Registrar chave PIX
      const { data: registerData, error: registerError } = await supabase.functions.invoke(
        'register-pix-key',
        {
          body: {
            account: kycData.account,
            keyType: 'EVP',
            key: undefined
          }
        }
      );

      if (registerError) throw registerError;

      if (registerData.status === 'CONFIRMED') {
        setSuccessData({
          keyType: KEY_TYPES['EVP'],
          key: registerData.body.key
        });
        setShowSuccessModal(true);
        // Atualizar lista na tela anterior usando navegação direta
        navigation.navigate('PixKeys', { updatePixKeys: true });
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
          navigation.navigate('PixKeys', { updatePixKeys: true });
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <MaterialCommunityIcons
            name="check-circle"
            size={64}
            color="#E91E63"
            style={styles.modalIcon}
          />
          <Text style={styles.modalTitle}>Chave PIX cadastrada!</Text>
          <Text style={styles.modalSubtitle}>
            {successData?.keyType}: {successData?.key}
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              setShowSuccessModal(false);
              navigation.navigate('PixKeys', { updatePixKeys: true });
            }}
            style={styles.modalButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            VOLTAR PARA MINHAS CHAVES
          </Button>
        </View>
      </Modal>
    </Portal>
  );

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
            <Text style={styles.headerTitle}>Cadastrar Chave</Text>
            <Text style={styles.subtitle}>
              Selecione uma chave para cadastrar. Cada chave só poderá ser vinculada a uma única conta.
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Key Type Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              key="EVP"
              style={[
                styles.optionCard,
                styles.optionCardSelected
              ]}
              onPress={() => setSelectedType('EVP')}
            >
              <View style={styles.optionContent}>
                <MaterialCommunityIcons
                  name="key-variant"
                  size={24}
                  color="#E91E63"
                />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Chave Aleatória</Text>
                  <Text style={styles.optionSubtitle}>
                    Chave aleatória gerada automaticamente
                  </Text>
                </View>
              </View>
              <RadioButton
                value="EVP"
                status="checked"
                color="#E91E63"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Register Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleCreateKey}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading || !selectedType}
          >
            CADASTRAR CHAVE
          </Button>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>
      
      {/* Success Modal */}
      <SuccessModal />
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
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    borderColor: '#E91E63',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
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
  errorText: {
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
    elevation: 4,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    width: '100%',
  },
});

export default RegisterPixKeyScreen;
