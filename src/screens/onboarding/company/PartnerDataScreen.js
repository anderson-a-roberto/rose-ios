import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button, List, Menu, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const OWNER_TYPES = [
  { label: 'Sócio', value: 'SOCIO' },
  { label: 'Representante Legal', value: 'REPRESENTANTE' },
  { label: 'Demais Sócios', value: 'DEMAIS_SOCIOS' },
];

const formatCPF = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatPhone = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/^(\d{2})(\d{5})(\d{4})/, '+55$1$2$3');
};

const formatDate = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/^(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
};

const formatCEP = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/^(\d{5})(\d{3})/, '$1-$2');
};

const PartnerDataScreen = ({ navigation }) => {
  const { onboardingData, addPartner, updatePartner, removePartner, updateOnboardingData } = useOnboarding();
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [currentPartner, setCurrentPartner] = useState({
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
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleCEPChange = async (text) => {
    const formattedCEP = formatCEP(text);
    setCurrentPartner(prev => ({
      ...prev,
      address: { ...prev.address, postalCode: formattedCEP }
    }));

    if (text.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${text.replace(/\D/g, '')}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setCurrentPartner(prev => ({
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

    const mainFieldsValid = requiredMainFields.every(field => currentPartner[field]?.trim());
    const addressFieldsValid = requiredAddressFields.every(field => currentPartner.address[field]?.trim());

    return mainFieldsValid && addressFieldsValid;
  };

  const handleSavePartner = () => {
    if (editingIndex >= 0) {
      updatePartner(editingIndex, currentPartner);
    } else {
      addPartner(currentPartner);
    }
    
    // Reset form
    setCurrentPartner({
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
    setEditingIndex(-1);
    setShowAddressForm(false);
  };

  const handleEditPartner = (index) => {
    setCurrentPartner(onboardingData.partners[index]);
    setEditingIndex(index);
    setShowAddressForm(true);
  };

  const handleNext = () => {
    if (onboardingData.partners?.length > 0) {
      navigation.navigate('CompanyPassword');
    } else {
      // Mostrar erro se não houver sócios cadastrados
      alert('É necessário cadastrar pelo menos um sócio');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#E91E63" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dados do sócio</Text>
          <Text style={styles.subtitle}>
            Informe os dados do sócio administrador
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Lista de sócios já adicionados */}
          {onboardingData.partners.map((partner, index) => (
            <List.Item
              key={index}
              title={partner.fullName}
              description={`${OWNER_TYPES.find(t => t.value === partner.ownerType)?.label} - ${partner.documentNumber}`}
              left={props => <List.Icon {...props} icon="account" />}
              right={props => (
                <View style={styles.partnerActions}>
                  <TouchableOpacity onPress={() => handleEditPartner(index)}>
                    <MaterialCommunityIcons name="pencil" size={24} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removePartner(index)}>
                    <MaterialCommunityIcons name="delete" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.partnerItem}
            />
          ))}

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
                    currentPartner.ownerType && { color: '#000', fontWeight: '600' }
                  ]}>
                    {currentPartner.ownerType
                      ? OWNER_TYPES.find(t => t.value === currentPartner.ownerType)?.label
                      : 'Selecione o tipo'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                </TouchableOpacity>
              }
            >
              {OWNER_TYPES.map((type) => (
                <Menu.Item
                  key={type.value}
                  onPress={() => {
                    setCurrentPartner(prev => ({ ...prev, ownerType: type.value }));
                    setShowTypeMenu(false);
                  }}
                  title={type.label}
                />
              ))}
            </Menu>

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              value={currentPartner.fullName}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, fullName: text }))}
              style={[styles.input, currentPartner.fullName && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={currentPartner.fullName ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: currentPartner.fullName ? '600' : '400' } } }}
            />

            <Text style={styles.label}>CPF</Text>
            <TextInput
              value={currentPartner.documentNumber}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, documentNumber: formatCPF(text) }))}
              style={[styles.input, currentPartner.documentNumber && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={currentPartner.documentNumber ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: currentPartner.documentNumber ? '600' : '400' } } }}
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              value={currentPartner.birthDate}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, birthDate: formatDate(text) }))}
              style={[styles.input, currentPartner.birthDate && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={currentPartner.birthDate ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: currentPartner.birthDate ? '600' : '400' } } }}
              keyboardType="numeric"
              maxLength={10}
              placeholder="DD/MM/AAAA"
            />

            <Text style={styles.label}>Nome da Mãe</Text>
            <TextInput
              value={currentPartner.motherName}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, motherName: text }))}
              style={[styles.input, currentPartner.motherName && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={currentPartner.motherName ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: currentPartner.motherName ? '600' : '400' } } }}
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={currentPartner.email}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, email: text }))}
              style={[styles.input, currentPartner.email && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={currentPartner.email ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: currentPartner.email ? '600' : '400' } } }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              value={currentPartner.phoneNumber}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, phoneNumber: formatPhone(text) }))}
              style={[styles.input, currentPartner.phoneNumber && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={currentPartner.phoneNumber ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: currentPartner.phoneNumber ? '600' : '400' } } }}
              keyboardType="numeric"
            />

            {/* PPE */}
            <TouchableOpacity
              style={styles.pepContainer}
              onPress={() => setCurrentPartner(prev => ({ 
                ...prev, 
                isPoliticallyExposedPerson: !prev.isPoliticallyExposedPerson 
              }))}
            >
              <MaterialCommunityIcons
                name={currentPartner.isPoliticallyExposedPerson ? "checkbox-marked" : "checkbox-blank-outline"}
                size={24}
                color="#E91E63"
              />
              <Text style={styles.pepText}>Pessoa Politicamente Exposta</Text>
            </TouchableOpacity>

            {/* Endereço */}
            <Button
              mode="outlined"
              onPress={() => setShowAddressForm(!showAddressForm)}
              style={styles.addressButton}
              labelStyle={styles.addressButtonLabel}
            >
              {showAddressForm ? 'Ocultar Endereço' : 'Adicionar Endereço'}
            </Button>

            {showAddressForm && (
              <View style={styles.addressForm}>
                <Text style={styles.label}>CEP</Text>
                <TextInput
                  value={currentPartner.address.postalCode}
                  onChangeText={handleCEPChange}
                  style={[styles.input, currentPartner.address.postalCode && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={currentPartner.address.postalCode ? '#000' : '#999'}
                  theme={{ fonts: { regular: { fontWeight: currentPartner.address.postalCode ? '600' : '400' } } }}
                  keyboardType="numeric"
                  maxLength={9}
                />

                <Text style={styles.label}>Rua</Text>
                <TextInput
                  value={currentPartner.address.street}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, street: value }
                  }))}
                  style={[styles.input, currentPartner.address.street && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={currentPartner.address.street ? '#000' : '#999'}
                  theme={{ fonts: { regular: { fontWeight: currentPartner.address.street ? '600' : '400' } } }}
                />

                <Text style={styles.label}>Número</Text>
                <TextInput
                  value={currentPartner.address.number}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, number: value }
                  }))}
                  style={[styles.input, currentPartner.address.number && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={currentPartner.address.number ? '#000' : '#999'}
                  theme={{ fonts: { regular: { fontWeight: currentPartner.address.number ? '600' : '400' } } }}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Complemento (opcional)</Text>
                <TextInput
                  value={currentPartner.address.addressComplement}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, addressComplement: value }
                  }))}
                  style={[styles.input, currentPartner.address.addressComplement && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={currentPartner.address.addressComplement ? '#000' : '#999'}
                  theme={{ fonts: { regular: { fontWeight: currentPartner.address.addressComplement ? '600' : '400' } } }}
                />

                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  value={currentPartner.address.neighborhood}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, neighborhood: value }
                  }))}
                  style={[styles.input, currentPartner.address.neighborhood && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={currentPartner.address.neighborhood ? '#000' : '#999'}
                  theme={{ fonts: { regular: { fontWeight: currentPartner.address.neighborhood ? '600' : '400' } } }}
                />

                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  value={currentPartner.address.city}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, city: value }
                  }))}
                  style={[styles.input, currentPartner.address.city && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={currentPartner.address.city ? '#000' : '#999'}
                  theme={{ fonts: { regular: { fontWeight: currentPartner.address.city ? '600' : '400' } } }}
                />

                <Text style={styles.label}>Estado</Text>
                <TextInput
                  value={currentPartner.address.state}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, state: value }
                  }))}
                  style={[styles.input, currentPartner.address.state && styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={currentPartner.address.state ? '#000' : '#999'}
                  theme={{ fonts: { regular: { fontWeight: currentPartner.address.state ? '600' : '400' } } }}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSavePartner}
              style={[styles.saveButton, !isPartnerValid() && styles.saveButtonDisabled]}
              labelStyle={styles.saveButtonLabel}
              disabled={!isPartnerValid()}
            >
              {editingIndex >= 0 ? 'Atualizar Sócio' : 'Adicionar Sócio'}
            </Button>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={[styles.continueButton, onboardingData.partners.length === 0 && styles.continueButtonDisabled]}
            labelStyle={[styles.continueButtonLabel, { color: '#FFF' }]}
            disabled={onboardingData.partners.length === 0}
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
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    gap: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    marginTop: 16,
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
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    fontSize: 12,
    color: '#FF0000',
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#E91E63',
    height: 48,
  },
  saveButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  partnerItem: {
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    borderRadius: 8,
  },
  partnerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pepText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  addressButton: {
    marginBottom: 16,
    borderColor: '#E0E0E0',
  },
  addressButtonLabel: {
    color: '#E91E63',
  },
  addressForm: {
    marginTop: 8,
  },
});

export default PartnerDataScreen;
