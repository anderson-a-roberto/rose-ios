import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button, List, Menu, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import TestDataButton from '../../../components/TestDataButton';

const OWNER_TYPES = [
  { label: 'Sócio', value: 'SOCIO' },
  { label: 'Representante Legal', value: 'REPRESENTANTE' },
  { label: 'Demais Sócios', value: 'DEMAIS_SOCIOS' },
];

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

  const handleDocumentChange = (text) => {
    const formattedDoc = formatCPF(text);
    setCurrentPartner(prev => ({ ...prev, documentNumber: formattedDoc }));
  };

  const handlePhoneChange = (text) => {
    const formattedPhone = formatPhone(text);
    setCurrentPartner(prev => ({ ...prev, phoneNumber: formattedPhone }));
  };

  const handleDateChange = (text) => {
    const formattedDate = formatDate(text);
    setCurrentPartner(prev => ({ ...prev, birthDate: formattedDate }));
  };

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
    const { address, ...mainData } = currentPartner;
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
    setShowAddressForm(false);
  };

  const handleNext = () => {
    updateOnboardingData({
      partners: onboardingData.partners
    });
    navigation.navigate('CompanyPassword');
  };

  return (
    <View style={styles.container}>
      <TestDataButton 
        section="partners" 
        onFill={(data) => {
          data.forEach(partner => addPartner(partner));
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Dados dos Sócios</Text>
      <Text style={styles.subtitle}>
        Adicione os dados dos sócios da empresa
      </Text>

      <ScrollView style={styles.content}>
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
          />
        ))}

        <View style={styles.formContainer}>
          {/* Formulário de sócio */}
          <Menu
            visible={showTypeMenu}
            onDismiss={() => setShowTypeMenu(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setShowTypeMenu(true)}
                style={styles.typeButton}
              >
                {currentPartner.ownerType 
                  ? OWNER_TYPES.find(t => t.value === currentPartner.ownerType)?.label 
                  : 'Selecione o tipo de sócio'}
              </Button>
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

          <TextInput
            label="CPF"
            value={currentPartner.documentNumber}
            onChangeText={handleDocumentChange}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            maxLength={14}
          />

          <TextInput
            label="Nome Completo"
            value={currentPartner.fullName}
            onChangeText={(value) => setCurrentPartner(prev => ({ ...prev, fullName: value }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Nome Social (opcional)"
            value={currentPartner.socialName}
            onChangeText={(value) => setCurrentPartner(prev => ({ ...prev, socialName: value }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Data de Nascimento"
            value={currentPartner.birthDate}
            onChangeText={handleDateChange}
            mode="outlined"
            style={styles.input}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
          />

          <TextInput
            label="Nome da Mãe"
            value={currentPartner.motherName}
            onChangeText={(value) => setCurrentPartner(prev => ({ ...prev, motherName: value }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={currentPartner.email}
            onChangeText={(value) => setCurrentPartner(prev => ({ ...prev, email: value }))}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Telefone"
            value={currentPartner.phoneNumber}
            onChangeText={handlePhoneChange}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            maxLength={14}
            placeholder="+5511999999999"
          />

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
              color="#000"
            />
            <Text style={styles.pepText}>Pessoa Politicamente Exposta</Text>
          </TouchableOpacity>

          <Button
            mode="outlined"
            onPress={() => setShowAddressForm(!showAddressForm)}
            style={styles.addressButton}
          >
            {showAddressForm ? 'Ocultar Endereço' : 'Adicionar Endereço'}
          </Button>

          {showAddressForm && (
            <View style={styles.addressForm}>
              <TextInput
                label="CEP"
                value={currentPartner.address.postalCode}
                onChangeText={handleCEPChange}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                maxLength={9}
              />

              <TextInput
                label="Rua"
                value={currentPartner.address.street}
                onChangeText={(value) => setCurrentPartner(prev => ({
                  ...prev,
                  address: { ...prev.address, street: value }
                }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Número"
                value={currentPartner.address.number}
                onChangeText={(value) => setCurrentPartner(prev => ({
                  ...prev,
                  address: { ...prev.address, number: value }
                }))}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
              />

              <TextInput
                label="Complemento (opcional)"
                value={currentPartner.address.addressComplement}
                onChangeText={(value) => setCurrentPartner(prev => ({
                  ...prev,
                  address: { ...prev.address, addressComplement: value }
                }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Bairro"
                value={currentPartner.address.neighborhood}
                onChangeText={(value) => setCurrentPartner(prev => ({
                  ...prev,
                  address: { ...prev.address, neighborhood: value }
                }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Cidade"
                value={currentPartner.address.city}
                onChangeText={(value) => setCurrentPartner(prev => ({
                  ...prev,
                  address: { ...prev.address, city: value }
                }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Estado"
                value={currentPartner.address.state}
                onChangeText={(value) => setCurrentPartner(prev => ({
                  ...prev,
                  address: { ...prev.address, state: value }
                }))}
                mode="outlined"
                style={styles.input}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSavePartner}
            style={[styles.saveButton, !isPartnerValid() && styles.saveButtonDisabled]}
            disabled={!isPartnerValid()}
          >
            {editingIndex >= 0 ? 'Atualizar Sócio' : 'Adicionar Sócio'}
          </Button>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          onboardingData.partners.length === 0 && styles.continueButtonDisabled
        ]}
        onPress={handleNext}
        disabled={onboardingData.partners.length === 0}
      >
        <Text style={styles.continueButtonText}>CONTINUAR</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 24,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formContainer: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  typeButton: {
    marginBottom: 16,
  },
  pepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pepText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  addressButton: {
    marginBottom: 16,
  },
  addressForm: {
    marginTop: 8,
  },
  saveButton: {
    marginBottom: 24,
    backgroundColor: '#000',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  partnerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginBottom: 24,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PartnerDataScreen;
