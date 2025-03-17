import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Menu, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        ...formData,
        documentNumber: formData.documentNumber.replace(/\D/g, '')
      }
    });
    navigation.navigate('CompanyAddress');
  };

  const getCompanyTypeLabel = () => {
    const type = COMPANY_TYPES.find(t => t.value === formData.companyType);
    return type ? type.label : 'Selecione o tipo de empresa';
  };

  const isFormValid = () => {
    return formData.documentNumber && formData.businessName && formData.tradingName && formData.companyType;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#E91E63" style={{ marginTop: -4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dados da empresa</Text>
          <Text style={styles.subtitle}>
            Preencha os dados da sua empresa para continuar
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>CNPJ</Text>
          <TextInput
            value={formData.documentNumber}
            onChangeText={handleDocumentChange}
            style={[styles.input, formData.documentNumber && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.documentNumber ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.documentNumber ? '600' : '400' } } }}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Nome Fantasia</Text>
          <TextInput
            value={formData.tradingName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, tradingName: text }))}
            style={[styles.input, formData.tradingName && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.tradingName ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.tradingName ? '600' : '400' } } }}
          />

          <Text style={styles.label}>Razão Social</Text>
          <TextInput
            value={formData.businessName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, businessName: text }))}
            style={[styles.input, formData.businessName && styles.filledInput]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={formData.businessName ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: formData.businessName ? '600' : '400' } } }}
          />

          <Text style={styles.label}>Tipo de Empresa</Text>
          <Menu
            visible={showTypeMenu}
            onDismiss={() => setShowTypeMenu(false)}
            anchor={
              <TouchableOpacity onPress={() => setShowTypeMenu(true)}>
                <TextInput
                  value={getCompanyTypeLabel()}
                  mode="flat"
                  style={[styles.input, styles.filledInput]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={formData.companyType ? '#000' : '#999'}
                  theme={{ fonts: { regular: { fontWeight: formData.companyType ? '600' : '400' } } }}
                  editable={false}
                  right={
                    <TextInput.Icon 
                      icon="chevron-down"
                      color="#666666"
                    />
                  }
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
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.continueButton, !isFormValid() && styles.continueButtonDisabled]}
          labelStyle={styles.continueButtonLabel}
          disabled={!isFormValid()}
        >
          CONTINUAR
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
    color: '#FFF',
  },
});

export default CompanyDataScreen;
