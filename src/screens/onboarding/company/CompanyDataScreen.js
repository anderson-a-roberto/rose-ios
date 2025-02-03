import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Menu, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import TestDataButton from '../../../components/TestDataButton';

const COMPANY_TYPES = [
  { label: 'Microempreendedor Individual', value: 'MEI' },
  { label: 'Microempresa', value: 'ME' },
  { label: 'Pessoa Jurídica', value: 'PJ' },
];

const CompanyDataScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    documentNumber: onboardingData.companyData?.documentNumber || '',
    businessName: onboardingData.companyData?.businessName || '',
    tradingName: onboardingData.companyData?.tradingName || '',
    companyType: onboardingData.companyData?.companyType || ''
  });
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const formatCNPJ = (text) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  };

  const handleDocumentChange = (text) => {
    const formattedDoc = formatCNPJ(text);
    setFormData(prev => ({ ...prev, documentNumber: formattedDoc }));
  };

  const handleNext = () => {
    updateOnboardingData({
      companyData: {
        documentNumber: formData.documentNumber.replace(/\D/g, ''),
        businessName: formData.businessName,
        tradingName: formData.tradingName,
        companyType: formData.companyType
      }
    });
    navigation.navigate('CompanyAddress');
  };

  const getCompanyTypeLabel = () => {
    const type = COMPANY_TYPES.find(t => t.value === formData.companyType);
    return type ? type.label : 'Selecione o tipo de empresa';
  };

  return (
    <View style={styles.container}>
      <TestDataButton 
        section="companyData" 
        onFill={(data) => setFormData(data)}
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

      <Text style={styles.title}>Dados da Empresa</Text>
      <Text style={styles.subtitle}>
        Preencha os dados da sua empresa para continuar
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          label="CNPJ"
          value={formData.documentNumber}
          onChangeText={handleDocumentChange}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          maxLength={18}
        />

        <TextInput
          label="Nome Fantasia"
          value={formData.businessName}
          onChangeText={(value) => setFormData(prev => ({ ...prev, businessName: value }))}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Razão Social"
          value={formData.tradingName}
          onChangeText={(value) => setFormData(prev => ({ ...prev, tradingName: value }))}
          mode="outlined"
          style={styles.input}
        />

        <Menu
          visible={showTypeMenu}
          onDismiss={() => setShowTypeMenu(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setShowTypeMenu(true)}
              style={styles.menuButton}
            >
              <TextInput
                label="Tipo de Empresa"
                value={getCompanyTypeLabel()}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="menu-down" />}
                style={styles.input}
              />
            </TouchableOpacity>
          }
        >
          {COMPANY_TYPES.map((type) => (
            <Menu.Item
              key={type.value}
              onPress={() => {
                setFormData(prev => ({ ...prev, companyType: type.value }));
                setShowTypeMenu(false);
              }}
              title={type.label}
            />
          ))}
        </Menu>
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.continueButton}
        labelStyle={styles.continueButtonLabel}
        disabled={!formData.documentNumber || !formData.businessName || !formData.tradingName || !formData.companyType}
      >
        CONTINUAR
      </Button>
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
  inputContainer: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  menuButton: {
    width: '100%',
  },
  continueButton: {
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 24,
    paddingVertical: 8,
    backgroundColor: '#000',
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default CompanyDataScreen;
