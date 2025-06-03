import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Constantes
const OWNER_TYPES = [
  { label: 'Sócio', value: 'SOCIO' },
  { label: 'Representante Legal', value: 'REPRESENTANTE' },
  { label: 'Demais Sócios', value: 'DEMAIS SOCIOS' },
];

// Funções de formatação
const formatCPF = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatPhone = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

const formatDate = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/^(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
};

const formatCEP = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/^(\d{5})(\d{3})/, '$1-$2');
};

const PartnerFormScreen = ({ navigation, route }) => {
  // Receber parâmetros da rota
  const { initialData, existingPartners = [] } = route.params || {};
  
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [partnerData, setPartnerData] = useState({
    ownerType: '',
    documentNumber: '',
    fullName: '',
    socialName: '',
    birthDate: '',
    motherName: '',
    email: '',
    phoneNumber: '',
    isPoliticallyExposedPerson: false,
    address: {
      postalCode: '',
      street: '',
      number: '',
      addressComplement: '',
      neighborhood: '',
      city: '',
      state: '',
    }
  });

  // Atualiza o estado do formulário quando recebe dados iniciais (para edição)
  useEffect(() => {
    if (initialData) {
      setPartnerData(initialData);
    } else {
      // Reset form quando abrir para um novo sócio
      setPartnerData({
        ownerType: '',
        documentNumber: '',
        fullName: '',
        socialName: '',
        birthDate: '',
        motherName: '',
        email: '',
        phoneNumber: '',
        isPoliticallyExposedPerson: false,
        address: {
          postalCode: '',
          street: '',
          number: '',
          addressComplement: '',
          neighborhood: '',
          city: '',
          state: '',
        }
      });
    }
  }, [initialData]);

  // Função para determinar quais tipos de sócios estão disponíveis
  const getAvailableOwnerTypes = () => {
    // Se estiver editando um sócio existente, mantém o tipo atual disponível
    if (initialData) {
      return OWNER_TYPES;
    }
    
    // Se não houver sócios, permite SOCIO ou REPRESENTANTE
    if (existingPartners.length === 0) {
      return OWNER_TYPES.filter(type => 
        type.value === 'SOCIO' || type.value === 'REPRESENTANTE'
      );
    }
    
    // Verifica se já existe um sócio do tipo SOCIO
    const hasSocio = existingPartners.some(partner => partner.ownerType === 'SOCIO');
    
    // Se já existe um SOCIO, só permite adicionar DEMAIS SOCIOS
    if (hasSocio) {
      return OWNER_TYPES.filter(type => type.value === 'DEMAIS SOCIOS');
    }
    
    // Se o primeiro sócio for REPRESENTANTE, permite adicionar SOCIO ou DEMAIS SOCIOS
    return OWNER_TYPES.filter(type => type.value !== 'REPRESENTANTE');
  };

  const handleCEPChange = async (text) => {
    const formattedCEP = formatCEP(text);
    setPartnerData(prev => ({
      ...prev,
      address: { ...prev.address, postalCode: formattedCEP }
    }));

    if (text.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${text.replace(/\D/g, '')}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setPartnerData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: data.logradouro || prev.address.street,
              neighborhood: data.bairro || prev.address.neighborhood,
              city: data.localidade || prev.address.city,
              state: data.uf || prev.address.state,
            }
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const isPartnerValid = () => {
    return (
      partnerData.ownerType && 
      partnerData.documentNumber && 
      partnerData.fullName && 
      partnerData.birthDate && 
      partnerData.motherName && 
      partnerData.email && 
      partnerData.phoneNumber
    );
  };

  const handleSave = () => {
    if (isPartnerValid()) {
      // Navegar de volta para a tela anterior com os dados do sócio
      navigation.navigate('PartnerData', { 
        newPartner: partnerData,
        action: initialData ? 'update' : 'add'
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <Text style={styles.headerTitle}>
            {initialData ? 'Editar Sócio' : 'Adicionar Sócio'}
          </Text>
          <Text style={styles.subtitle}>
            Informe os dados do sócio
          </Text>
        </View>
      </View>

      {/* Wrapper para o KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Container principal que envolve o ScrollView e o botão */}
        <View style={styles.mainContainer}>
          {/* ScrollView com o formulário */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              {/* Tipo de Sócio */}
              <Text style={styles.label}>Tipo</Text>
              <Menu
                visible={showTypeMenu}
                onDismiss={() => setShowTypeMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={[styles.input, styles.menuButton]}
                    onPress={() => setShowTypeMenu(true)}
                  >
                    <Text style={[
                      styles.menuButtonText,
                      partnerData.ownerType && { color: '#000', fontWeight: '600' }
                    ]}>
                      {partnerData.ownerType
                        ? OWNER_TYPES.find(t => t.value === partnerData.ownerType)?.label
                        : 'Selecione o tipo'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                  </TouchableOpacity>
                }
              >
                {getAvailableOwnerTypes().map((type) => (
                  <Menu.Item
                    key={type.value}
                    onPress={() => {
                      setPartnerData(prev => ({ ...prev, ownerType: type.value }));
                      setShowTypeMenu(false);
                    }}
                    title={type.label}
                  />
                ))}
              </Menu>

              {partnerData.ownerType === 'REPRESENTANTE' && (
                <Text style={styles.infoMessage}>
                  Será obrigatório o envio da procuração de poderes.
                </Text>
              )}

              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                value={partnerData.fullName}
                onChangeText={(text) => setPartnerData(prev => ({ ...prev, fullName: text }))}
                style={[styles.input, partnerData.fullName && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.fullName ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.fullName ? '600' : '400' } } }}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>CPF</Text>
              <TextInput
                value={partnerData.documentNumber}
                onChangeText={(text) => setPartnerData(prev => ({ ...prev, documentNumber: formatCPF(text) }))}
                style={[styles.input, partnerData.documentNumber && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.documentNumber ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.documentNumber ? '600' : '400' } } }}
                keyboardType="numeric"
                maxLength={14}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                value={partnerData.birthDate}
                onChangeText={(text) => {
                  const formatted = formatDate(text);
                  setPartnerData(prev => ({ ...prev, birthDate: formatted }));
                }}
                style={[styles.input, partnerData.birthDate && styles.filledInput]}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.birthDate ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.birthDate ? '600' : '400' } } }}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Nome da Mãe</Text>
              <TextInput
                value={partnerData.motherName}
                onChangeText={(text) => setPartnerData(prev => ({ ...prev, motherName: text }))}
                style={[styles.input, partnerData.motherName && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.motherName ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.motherName ? '600' : '400' } } }}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>E-mail</Text>
              <TextInput
                value={partnerData.email}
                onChangeText={(text) => setPartnerData(prev => ({ ...prev, email: text }))}
                style={[styles.input, partnerData.email && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.email ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.email ? '600' : '400' } } }}
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Telefone</Text>
              <TextInput
                value={partnerData.phoneNumber}
                onChangeText={(text) => setPartnerData(prev => ({ ...prev, phoneNumber: formatPhone(text) }))}
                style={[styles.input, partnerData.phoneNumber && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.phoneNumber ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.phoneNumber ? '600' : '400' } } }}
                keyboardType="phone-pad"
                maxLength={15}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              {/* PPE */}
              <TouchableOpacity
                style={styles.pepContainer}
                onPress={() => setPartnerData(prev => ({ 
                  ...prev, 
                  isPoliticallyExposedPerson: !prev.isPoliticallyExposedPerson 
                }))}
              >
                <MaterialCommunityIcons
                  name={partnerData.isPoliticallyExposedPerson ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={24}
                  color="#E91E63"
                />
                <Text style={styles.pepText}>Pessoa Politicamente Exposta</Text>
              </TouchableOpacity>

              {/* Endereço - Sempre visível */}
              <Text style={styles.sectionTitle}>Endereço</Text>

              <Text style={styles.label}>CEP</Text>
              <TextInput
                value={partnerData.address.postalCode}
                onChangeText={handleCEPChange}
                style={[styles.input, partnerData.address.postalCode && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.address.postalCode ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.address.postalCode ? '600' : '400' } } }}
                keyboardType="numeric"
                maxLength={9}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Rua</Text>
              <TextInput
                value={partnerData.address.street}
                onChangeText={(value) => setPartnerData(prev => ({
                  ...prev,
                  address: { ...prev.address, street: value }
                }))}
                style={[styles.input, partnerData.address.street && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.address.street ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.address.street ? '600' : '400' } } }}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Número</Text>
              <TextInput
                value={partnerData.address.number}
                onChangeText={(value) => setPartnerData(prev => ({
                  ...prev,
                  address: { ...prev.address, number: value }
                }))}
                style={[styles.input, partnerData.address.number && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.address.number ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.address.number ? '600' : '400' } } }}
                keyboardType="numeric"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Complemento</Text>
              <TextInput
                value={partnerData.address.addressComplement}
                onChangeText={(value) => setPartnerData(prev => ({
                  ...prev,
                  address: { ...prev.address, addressComplement: value }
                }))}
                style={[styles.input, partnerData.address.addressComplement && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.address.addressComplement ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.address.addressComplement ? '600' : '400' } } }}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Bairro</Text>
              <TextInput
                value={partnerData.address.neighborhood}
                onChangeText={(value) => setPartnerData(prev => ({
                  ...prev,
                  address: { ...prev.address, neighborhood: value }
                }))}
                style={[styles.input, partnerData.address.neighborhood && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.address.neighborhood ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.address.neighborhood ? '600' : '400' } } }}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Cidade</Text>
              <TextInput
                value={partnerData.address.city}
                onChangeText={(value) => setPartnerData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: value }
                }))}
                style={[styles.input, partnerData.address.city && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.address.city ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.address.city ? '600' : '400' } } }}
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />

              <Text style={styles.label}>Estado</Text>
              <TextInput
                value={partnerData.address.state}
                onChangeText={(value) => setPartnerData(prev => ({
                  ...prev,
                  address: { ...prev.address, state: value }
                }))}
                style={[styles.input, partnerData.address.state && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={partnerData.address.state ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: partnerData.address.state ? '600' : '400' } } }}
                maxLength={2}
                autoCapitalize="characters"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
              />
            </View>
          </ScrollView>
          
          {/* Botão de continuar - sempre visível */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              uppercase={false}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.saveButton, !isPartnerValid() && styles.saveButtonDisabled]}
              labelStyle={styles.saveButtonLabel}
              disabled={!isPartnerValid()}
              uppercase={false}
            >
              {initialData ? 'Atualizar' : 'Adicionar'}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Container principal para o KeyboardAvoidingView
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Container que envolve o ScrollView e o botão
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFF',
  },
  // ScrollView que contém o formulário
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
    marginTop: -4,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  form: {
    paddingVertical: 16,
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    fontSize: 16,
    height: 48,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
  },
  filledInput: {
    fontWeight: '500',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuButtonText: {
    fontSize: 16,
    color: '#999',
  },
  pepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  pepText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  infoMessage: {
    fontSize: 12,
    color: '#682145',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    flexDirection: 'row',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#E91E63',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
  },
  cancelButtonLabel: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#E91E63',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  saveButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PartnerFormScreen;
