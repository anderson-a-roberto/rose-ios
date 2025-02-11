import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button, List, Menu, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import TestDataButton from '../../../components/TestDataButton';
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
          <TestDataButton 
            section="partners" 
            onFill={(data) => {
              data.forEach(partner => addPartner(partner));
            }}
          />
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

            {/* Dados Pessoais */}
            <TextInput
              label="CPF"
              value={currentPartner.documentNumber}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, documentNumber: formatCPF(text) }))}
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
              keyboardType="numeric"
              maxLength={14}
            />

            <TextInput
              label="Nome Completo"
              value={currentPartner.fullName}
              onChangeText={(value) => setCurrentPartner(prev => ({ ...prev, fullName: value }))}
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
            />

            <TextInput
              label="Nome Social (opcional)"
              value={currentPartner.socialName}
              onChangeText={(value) => setCurrentPartner(prev => ({ ...prev, socialName: value }))}
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
            />

            <TextInput
              label="Data de Nascimento"
              value={currentPartner.birthDate}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, birthDate: formatDate(text) }))}
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
              keyboardType="numeric"
              maxLength={10}
              placeholder="DD/MM/AAAA"
            />

            <TextInput
              label="Nome da Mãe"
              value={currentPartner.motherName}
              onChangeText={(value) => setCurrentPartner(prev => ({ ...prev, motherName: value }))}
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
            />

            <TextInput
              label="Email"
              value={currentPartner.email}
              onChangeText={(value) => setCurrentPartner(prev => ({ ...prev, email: value }))}
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Telefone"
              value={currentPartner.phoneNumber}
              onChangeText={(text) => setCurrentPartner(prev => ({ ...prev, phoneNumber: formatPhone(text) }))}
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
              keyboardType="numeric"
              maxLength={14}
              placeholder="+5511999999999"
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
                <TextInput
                  label="CEP"
                  value={currentPartner.address.postalCode}
                  onChangeText={handleCEPChange}
                  mode="flat"
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  theme={{
                    colors: {
                      primary: '#E91E63',
                      error: '#B00020',
                      onSurfaceVariant: '#666666',
                      onSurface: '#000000',
                    },
                  }}
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
                  mode="flat"
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  theme={{
                    colors: {
                      primary: '#E91E63',
                      error: '#B00020',
                      onSurfaceVariant: '#666666',
                      onSurface: '#000000',
                    },
                  }}
                />

                <TextInput
                  label="Número"
                  value={currentPartner.address.number}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, number: value }
                  }))}
                  mode="flat"
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  theme={{
                    colors: {
                      primary: '#E91E63',
                      error: '#B00020',
                      onSurfaceVariant: '#666666',
                      onSurface: '#000000',
                    },
                  }}
                  keyboardType="numeric"
                />

                <TextInput
                  label="Complemento (opcional)"
                  value={currentPartner.address.addressComplement}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, addressComplement: value }
                  }))}
                  mode="flat"
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  theme={{
                    colors: {
                      primary: '#E91E63',
                      error: '#B00020',
                      onSurfaceVariant: '#666666',
                      onSurface: '#000000',
                    },
                  }}
                />

                <TextInput
                  label="Bairro"
                  value={currentPartner.address.neighborhood}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, neighborhood: value }
                  }))}
                  mode="flat"
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  theme={{
                    colors: {
                      primary: '#E91E63',
                      error: '#B00020',
                      onSurfaceVariant: '#666666',
                      onSurface: '#000000',
                    },
                  }}
                />

                <TextInput
                  label="Cidade"
                  value={currentPartner.address.city}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, city: value }
                  }))}
                  mode="flat"
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  theme={{
                    colors: {
                      primary: '#E91E63',
                      error: '#B00020',
                      onSurfaceVariant: '#666666',
                      onSurface: '#000000',
                    },
                  }}
                />

                <TextInput
                  label="Estado"
                  value={currentPartner.address.state}
                  onChangeText={(value) => setCurrentPartner(prev => ({
                    ...prev,
                    address: { ...prev.address, state: value }
                  }))}
                  mode="flat"
                  style={styles.input}
                  contentStyle={styles.inputContent}
                  theme={{
                    colors: {
                      primary: '#E91E63',
                      error: '#B00020',
                      onSurfaceVariant: '#666666',
                      onSurface: '#000000',
                    },
                  }}
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
            labelStyle={styles.continueButtonLabel}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    marginTop: 16,
    paddingBottom: 24,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  inputContent: {
    backgroundColor: '#FFF',
    fontSize: 16,
    paddingHorizontal: 0,
  },
  typeButton: {
    marginBottom: 16,
    borderColor: '#E0E0E0',
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
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: '#E91E63',
    height: 48,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});

export default PartnerDataScreen;
