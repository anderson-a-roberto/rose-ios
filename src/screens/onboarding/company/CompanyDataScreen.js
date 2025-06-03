import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Text, TextInput, Menu, Button, Portal, Modal } from 'react-native-paper';
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
          <Text style={styles.headerTitle}>Dados da empresa</Text>
          <Text style={styles.subtitle}>
            Preencha os dados da sua empresa para continuar
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
            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>CNPJ</Text>
              <TextInput
                value={formData.documentNumber}
                onChangeText={handleDocumentChange}
                style={[styles.input, formData.documentNumber && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Nome Fantasia</Text>
              <TextInput
                value={formData.tradingName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, tradingName: text }))}
                style={[styles.input, formData.tradingName && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />

              <Text style={styles.label}>Razão Social</Text>
              <TextInput
                value={formData.businessName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, businessName: text }))}
                style={[styles.input, formData.businessName && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
              />

              <Text style={styles.label}>Tipo de Empresa</Text>
              <TouchableOpacity 
                style={[styles.dropdown, formData.companyType && styles.filledDropdown]} 
                onPress={() => {
                  Keyboard.dismiss(); // Fecha o teclado antes de abrir o modal
                  setShowTypeMenu(true);
                }}
              >
                <Text style={[styles.dropdownText, formData.companyType && styles.filledDropdownText]}>
                  {getCompanyTypeLabel()}
                </Text>
                <View style={styles.iconContainer}>
                  <Text style={{ fontSize: 18, color: '#666666' }}>▼</Text>
                </View>
              </TouchableOpacity>
              
              {/* Espaço extra no final para garantir que o último campo seja visível acima do botão */}
              <View style={styles.bottomPadding} />
            </View>
          </ScrollView>

          {/* Botão de continuar - sempre visível */}
          <View style={styles.buttonContainer}>
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
      </KeyboardAvoidingView>
      
      {/* Modal para seleção do tipo de empresa */}
      <Portal>
        <Modal
          visible={showTypeMenu}
          onDismiss={() => setShowTypeMenu(false)}
          contentContainerStyle={styles.typeModalContainer}
        >
          <View style={styles.typeModalHeader}>
            <Text style={styles.typeModalTitle}>Selecione o tipo de empresa</Text>
          </View>
          <View style={styles.typeModalContent}>
            {COMPANY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.typeModalItem}
                onPress={() => {
                  setFormData(prev => ({ ...prev, companyType: type.value }));
                  setShowTypeMenu(false);
                }}
              >
                <Text style={styles.typeModalItemText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.typeModalFooter}>
            <Button
              mode="outlined"
              onPress={() => setShowTypeMenu(false)}
              style={styles.typeModalCancelButton}
              labelStyle={styles.typeModalCancelButtonLabel}
            >
              CANCELAR
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    zIndex: 10,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
    ...(Platform.OS === 'ios' && {
      height: 56, // Altura fixa para iOS
      paddingVertical: 8, // Adicionar padding vertical para melhorar a visibilidade do cursor
    }),
  },
  filledInput: {
    fontWeight: '500',
  },
  // Estilos para o dropdown customizado
  dropdownContainer: {
    width: '100%',
    marginBottom: 16,
  },
  dropdown: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
    marginBottom: 16,
    ...(Platform.OS === 'ios' && {
      height: 56, // Altura fixa para iOS
    }),
  },
  filledDropdown: {
    borderBottomColor: '#E91E63',
  },
  dropdownText: {
    fontSize: 16,
    color: '#666666',
    flex: 1, // Permite que o texto ocupe o espaço disponível
    paddingRight: 8, // Espaço para o ícone
  },
  filledDropdownText: {
    fontWeight: '500',
    color: '#000000',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Garante que o ícone fique acima do texto
  },
  // Espaço extra no final do formulário para garantir que o último campo fique visível acima do botão
  bottomPadding: {
    height: 100,
  },
  // Estilos para o modal de seleção de tipo de empresa
  typeModalContainer: {
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
  typeModalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  typeModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  typeModalContent: {
    padding: 16,
  },
  typeModalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  typeModalItemText: {
    fontSize: 16,
    color: '#000000',
  },
  typeModalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    alignItems: 'center',
  },
  typeModalCancelButton: {
    borderColor: '#E91E63',
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
    height: 48,
    justifyContent: 'center',
  },
  typeModalCancelButtonLabel: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '500',
  },
  // Container do botão - sempre visível na parte inferior
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
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
