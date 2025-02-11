import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Menu, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import TestDataButton from '../../../components/TestDataButton';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#E91E63" style={{ marginTop: -4 }} />
          </TouchableOpacity>
          <TestDataButton 
            section="companyData" 
            onFill={(data) => setFormData(data)}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dados da empresa</Text>
          <Text style={styles.headerSubtitle}>
            Preencha os dados da sua empresa para continuar
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="CNPJ"
            value={formData.documentNumber}
            onChangeText={handleDocumentChange}
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
            label="Nome Fantasia"
            value={formData.tradingName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, tradingName: text }))}
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
            label="Razão Social"
            value={formData.businessName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, businessName: text }))}
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

          <Menu
            visible={showTypeMenu}
            onDismiss={() => setShowTypeMenu(false)}
            anchor={
              <TouchableOpacity onPress={() => setShowTypeMenu(true)}>
                <TextInput
                  label="Tipo de Empresa"
                  value={getCompanyTypeLabel()}
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
          style={styles.continueButton}
          labelStyle={styles.continueButtonLabel}
          disabled={!formData.documentNumber || !formData.businessName || !formData.tradingName || !formData.companyType}
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
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
  },
  form: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontFamily: 'Roboto',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
  },
  continueButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 4,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
});

export default CompanyDataScreen;
