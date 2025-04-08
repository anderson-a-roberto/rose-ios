import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Menu, Button } from 'react-native-paper';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const COMPANY_TYPES = [
  { label: 'Microempreendedor Individual', value: 'MEI' },
  { label: 'Microempresa', value: 'ME' },
  { label: 'Outros', value: 'PJ' },
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
            <Text style={styles.headerTitle}>Dados da empresa</Text>
            <Text style={styles.subtitle}>
              Preencha os dados da sua empresa para continuar
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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
                    style={[styles.input, formData.companyType && styles.filledInput]}
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
            style={[styles.continueButton, !isFormValid() && styles.disabledButton]}
            labelStyle={styles.continueButtonLabel}
            disabled={!isFormValid()}
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
    minHeight: '100%',
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
  headerContent: {
    paddingHorizontal: 24,
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
    flexGrow: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
  },
  form: {
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
    width: '100%',
  },
  filledInput: {
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
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
  continueButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});

export default CompanyDataScreen;
