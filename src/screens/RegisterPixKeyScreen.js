import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Text, Button, Portal, Modal, RadioButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

const KEY_TYPES = {
  EVP: "Chave Aleatória",
  CPF: "CPF",
  EMAIL: "Email",
  PHONE: "Telefone",
  CNPJ: "CNPJ"
};

const getIconForKeyType = (keyType) => {
  switch (keyType) {
    case 'CPF':
      return 'card-account-details';
    case 'CNPJ':
      return 'domain';
    case 'EMAIL':
      return 'email';
    case 'PHONE':
      return 'phone';
    case 'EVP':
    default:
      return 'key-variant';
  }
};

const RegisterPixKeyScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState('EVP');
  const [keyValue, setKeyValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [userDocument, setUserDocument] = useState('');
  const [documentType, setDocumentType] = useState('');
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  // Buscar documento do usuário ao carregar a tela
  useEffect(() => {
    const fetchUserDocument = async () => {
      try {
        // Buscar usuário logado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Buscar CPF/CNPJ do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('document_number')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setUserDocument(profileData.document_number);
        
        // Determinar se é CPF ou CNPJ baseado no tamanho
        if (profileData.document_number.length <= 11) {
          setDocumentType('CPF');
        } else {
          setDocumentType('CNPJ');
        }
      } catch (err) {
        console.error('Erro ao buscar documento do usuário:', err);
      }
    };

    fetchUserDocument();
  }, []);

  const validateKeyValue = () => {
    if (selectedType === 'EVP') {
      return true; // Não precisa de validação para chave aleatória
    }

    if (!keyValue.trim()) {
      setError(`Por favor, informe um valor para a chave ${KEY_TYPES[selectedType]}`);
      return false;
    }

    // Validação específica para CPF e CNPJ
    if (selectedType === 'CPF' && documentType === 'CPF') {
      if (keyValue.replace(/[^0-9]/g, '') !== userDocument.replace(/[^0-9]/g, '')) {
        setError('Você só pode cadastrar o seu próprio CPF como chave PIX');
        return false;
      }
    } else if (selectedType === 'CNPJ' && documentType === 'CNPJ') {
      if (keyValue.replace(/[^0-9]/g, '') !== userDocument.replace(/[^0-9]/g, '')) {
        setError('Você só pode cadastrar o seu próprio CNPJ como chave PIX');
        return false;
      }
    }

    return true;
  };

  const handleCreateKey = async () => {
    try {
      if (!validateKeyValue()) {
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

      // Preparar dados para envio
      const requestBody = {
        account: kycData.account,
        keyType: selectedType
      };

      // Adicionar valor da chave apenas se não for EVP
      if (selectedType !== 'EVP') {
        requestBody.key = keyValue;
      }

      // Registrar chave PIX
      const { data: registerData, error: registerError } = await supabase.functions.invoke(
        'register-pix-key',
        { body: requestBody }
      );

      if (registerError) throw registerError;

      if (registerData.status === 'CONFIRMED') {
        setSuccessData({
          keyType: KEY_TYPES[selectedType],
          key: registerData.body?.key || keyValue
        });
        setShowSuccessModal(true);
        // Atualizar lista na tela anterior usando navegação direta
        navigation.navigate('PixKeys', { updatePixKeys: true });
      } else if (registerData.error) {
        throw new Error(registerData.error.message || 'Erro ao registrar chave PIX');
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

        {/* Content Container com KeyboardAvoidingView */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Key Type Options */}
            <View style={styles.optionsContainer}>
              {Object.entries(KEY_TYPES)
              // Filtrar para mostrar apenas CPF ou CNPJ de acordo com o tipo de conta
              .filter(([type]) => {
                // Sempre mostrar EVP, EMAIL e PHONE
                if (type === 'EVP' || type === 'EMAIL' || type === 'PHONE') {
                  return true;
                }
                // Mostrar CPF apenas se o usuário for PF
                if (type === 'CPF') {
                  return documentType === 'CPF';
                }
                // Mostrar CNPJ apenas se o usuário for PJ
                if (type === 'CNPJ') {
                  return documentType === 'CNPJ';
                }
                return false;
              })
              .map(([type, label]) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionCard,
                    selectedType === type && styles.optionCardSelected
                  ]}
                  onPress={() => {
                    setSelectedType(type);
                    setError(null);
                    
                    // Limpar o valor da chave ao mudar de tipo
                    if (type === 'EVP') {
                      setKeyValue('');
                    } else if ((type === 'CPF' && documentType === 'CPF') || 
                        (type === 'CNPJ' && documentType === 'CNPJ')) {
                      // Preencher com documento apenas para CPF/CNPJ
                      setKeyValue(userDocument);
                    } else {
                      // Para email e telefone, sempre limpar
                      setKeyValue('');
                      
                      // Se for email ou telefone, focar no input após um breve delay
                      if (type === 'EMAIL' || type === 'PHONE') {
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 300);
                      }
                    }
                  }}
                >
                  <View style={styles.optionContent}>
                    <MaterialCommunityIcons
                      name={getIconForKeyType(type)}
                      size={24}
                      color="#E91E63"
                    />
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>{label}</Text>
                      <Text style={styles.optionSubtitle}>
                        {type === 'EVP' 
                          ? 'Chave aleatória gerada automaticamente'
                          : type === 'CPF' 
                            ? 'Utilize seu CPF como chave PIX'
                            : type === 'CNPJ' 
                              ? 'Utilize seu CNPJ como chave PIX'
                              : type === 'EMAIL' 
                                ? 'Utilize seu email como chave PIX'
                                : 'Utilize seu telefone como chave PIX'}
                      </Text>
                    </View>
                  </View>
                  <RadioButton
                    value={type}
                    status={selectedType === type ? 'checked' : 'unchecked'}
                    color="#E91E63"
                  />
                </TouchableOpacity>
              ))}
          </View>
          
            {/* Campo para digitar valor da chave (exceto para EVP) */}
            {selectedType !== 'EVP' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Valor da Chave {KEY_TYPES[selectedType]}</Text>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={keyValue}
                  onChangeText={setKeyValue}
                  placeholder={`Digite seu ${KEY_TYPES[selectedType]}`}
                  keyboardType={selectedType === 'PHONE' ? 'phone-pad' : selectedType === 'EMAIL' ? 'email-address' : 'default'}
                  editable={(selectedType !== 'CPF' && selectedType !== 'CNPJ') || 
                           (selectedType === 'CPF' && documentType !== 'CPF') || 
                           (selectedType === 'CNPJ' && documentType !== 'CNPJ')}
                  onFocus={() => {
                    // Quando o input receber foco, rolar para ele
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
                {((selectedType === 'CPF' && documentType === 'CPF') || 
                  (selectedType === 'CNPJ' && documentType === 'CNPJ')) && (
                  <Text style={styles.infoText}>Você só pode cadastrar seu próprio {selectedType} como chave PIX</Text>
                )}
              </View>
            )}
            {/* Espaço adicional para garantir que o input fique visível acima do teclado */}
            <View style={styles.keyboardSpacer} />
          </ScrollView>

          {/* Register Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => {
                Keyboard.dismiss();
                handleCreateKey();
              }}
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
        </KeyboardAvoidingView>
      </View>
      
      {/* Success Modal */}
      <SuccessModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  keyboardSpacer: {
    height: 200, // Espaço adicional para garantir que o input fique visível
  },
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
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
