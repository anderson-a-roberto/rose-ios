import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Menu } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';

const OWNER_TYPES = [
  { label: 'Sócio', value: 'SOCIO' },
  { label: 'Representante Legal', value: 'REPRESENTANTE' },
  { label: 'Demais Sócios', value: 'DEMAIS SOCIOS' },
];

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

const PartnerFormModal = ({ visible, onDismiss, onSave, initialData = null, existingPartners = [] }) => {
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
  }, [initialData, visible]);

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
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
            }
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const isPartnerValid = () => {
    const requiredMainFields = ['ownerType', 'documentNumber', 'fullName', 'birthDate', 'motherName', 'email', 'phoneNumber'];
    const requiredAddressFields = ['postalCode', 'street', 'number', 'neighborhood', 'city', 'state'];

    const mainFieldsValid = requiredMainFields.every(field => partnerData[field]?.trim());
    const addressFieldsValid = requiredAddressFields.every(field => partnerData.address[field]?.trim());

    return mainFieldsValid && addressFieldsValid;
  };

  const handleSave = () => {
    if (isPartnerValid()) {
      const partnerDataToSave = {
        id: initialData?.id || Math.random().toString(36).substring(2, 15),
        ownerType: partnerData.ownerType,
        documentNumber: partnerData.documentNumber,
        fullName: partnerData.fullName,
        socialName: partnerData.socialName,
        birthDate: partnerData.birthDate,
        motherName: partnerData.motherName,
        email: partnerData.email,
        phoneNumber: partnerData.phoneNumber,
        isPoliticallyExposedPerson: partnerData.isPoliticallyExposedPerson,
        address: {
          postalCode: partnerData.address.postalCode,
          street: partnerData.address.street,
          number: partnerData.address.number,
          addressComplement: partnerData.address.addressComplement,
          neighborhood: partnerData.address.neighborhood,
          city: partnerData.address.city,
          state: partnerData.address.state,
        }
      };
      onSave(partnerDataToSave);
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {initialData ? 'Editar Sócio' : 'Adicionar Sócio'}
          </Text>
          <Text style={styles.subtitle}>
            Informe os dados do sócio
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.mainContainer}>
            <ScrollView 
              style={styles.content} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
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

            <Text style={styles.label}>Complemento (opcional)</Text>
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
            
            <View style={styles.footer}>
              <Button
                mode="outlined"
                onPress={onDismiss}
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
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 480,
    alignSelf: 'center',
    width: '90%',
    maxHeight: '95%',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    display: 'flex',
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  content: {
    padding: 0,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  form: {
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
  },
  filledInput: {
    backgroundColor: '#FFF',
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default PartnerFormModal;
