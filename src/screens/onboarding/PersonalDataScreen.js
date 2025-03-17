import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button, List } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import PepInfoModal from '../../components/onboarding/PepInfoModal';

const formatCPF = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
};

const formatDate = (text) => {
  const numbers = text.replace(/\D/g, '');
  
  // Adiciona as barras conforme o usuário digita
  if (numbers.length > 0) {
    // Adiciona a primeira barra após os dois primeiros dígitos (dia)
    if (numbers.length >= 2) {
      const day = numbers.substring(0, 2);
      
      // Adiciona a segunda barra após os próximos dois dígitos (mês)
      if (numbers.length >= 4) {
        const month = numbers.substring(2, 4);
        
        // Adiciona o ano
        const year = numbers.substring(4, 8);
        
        return `${day}/${month}${year.length > 0 ? '/' + year : ''}`;
      }
      
      return `${day}/${numbers.substring(2)}`;
    }
    
    return numbers;
  }
  
  return '';
};

const PersonalDataScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { personalData, pepInfo } = onboardingData;

  const [formData, setFormData] = useState({
    fullName: personalData.fullName || '',
    documentNumber: personalData.documentNumber || '',
    birthDate: personalData.birthDate || '',
    motherName: personalData.motherName || '',
  });

  const [errors, setErrors] = useState({});
  const [pepModalVisible, setPepModalVisible] = useState(false);
  const [isPep, setIsPep] = useState(pepInfo?.isPoliticallyExposedPerson || false);

  const validateFullName = (name) => {
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    return parts.length >= 2; // Nome e sobrenome
  };

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'documentNumber') {
      // Se o campo já tiver um valor, não permitir alteração
      if (formData.documentNumber) return;
      formattedValue = formatCPF(value);
    } else if (field === 'birthDate') {
      formattedValue = formatDate(value);
    } else if (field === 'fullName') {
      // Limita caracteres especiais no nome
      formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpa o erro do campo quando ele é alterado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNext = async () => {
    const newErrors = {};

    // Validação do nome completo
    const fullName = formData.fullName?.trim();
    if (!fullName || !validateFullName(fullName)) {
      newErrors.fullName = 'Digite seu nome completo (nome e sobrenome)';
    }

    // Valida se a data está no formato correto DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!formData.birthDate || !dateRegex.test(formData.birthDate)) {
      newErrors.birthDate = 'Data de nascimento inválida';
    }

    // Se houver erros, mostra e não prossegue
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Atualiza os dados do onboarding
    const updatedPersonalData = {
      ...onboardingData.personalData,
      documentNumber: formData.documentNumber.replace(/\D/g, ''),
      fullName: fullName,
      birthDate: formData.birthDate.trim(),
      motherName: formData.motherName?.trim()
    };

    console.log('[PersonalDataScreen] Atualizando dados pessoais e PEP:', {
      ...updatedPersonalData,
      isPep
    });

    // Atualiza o contexto com os dados pessoais e a informação de PEP
    updateOnboardingData({
      personalData: updatedPersonalData,
      pepInfo: {
        isPoliticallyExposedPerson: isPep
      }
    });

    // Navega diretamente para a tela de endereço
    navigation.navigate('OnboardingAddress', {
      isPep: isPep
    });
  };

  const handlePepConfirm = (value) => {
    console.log('[PersonalDataScreen] PEP selecionado:', value);
    setIsPep(value);
    setPepModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
          <Text style={styles.subtitle}>
            Vamos precisar de algumas informações para seguir com seu cadastro
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>CPF</Text>
            <TextInput
              value={formData.documentNumber}
              onChangeText={(text) => handleChange('documentNumber', text)}
              style={styles.input}
              keyboardType="numeric"
              maxLength={14}
              disabled={!!formData.documentNumber}
              underlineColor="#E0E0E0"
              activeUnderlineColor="#E91E63"
              mode="flat"
            />

            <Text style={styles.fieldLabel}>Nome Completo</Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              style={styles.input}
              error={!!errors.fullName}
              underlineColor="#E0E0E0"
              activeUnderlineColor="#E91E63"
              mode="flat"
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}

            <Text style={styles.fieldLabel}>Data de Nascimento</Text>
            <TextInput
              value={formData.birthDate}
              onChangeText={(text) => handleChange('birthDate', text)}
              style={styles.input}
              keyboardType="numeric"
              maxLength={10}
              placeholder="DD/MM/AAAA"
              error={!!errors.birthDate}
              underlineColor="#E0E0E0"
              activeUnderlineColor="#E91E63"
              mode="flat"
            />
            {errors.birthDate && (
              <Text style={styles.errorText}>{errors.birthDate}</Text>
            )}

            <Text style={styles.fieldLabel}>Nome da Mãe</Text>
            <TextInput
              value={formData.motherName}
              onChangeText={(text) => handleChange('motherName', text)}
              style={styles.input}
              underlineColor="#E0E0E0"
              activeUnderlineColor="#E91E63"
              mode="flat"
            />

            {/* Campo PEP */}
            <Text style={styles.fieldLabel}>Pessoa Politicamente Exposta</Text>
            <TouchableOpacity 
              style={styles.pepSelector}
              onPress={() => setPepModalVisible(true)}
            >
              <View style={styles.pepSelectorContent}>
                <View style={styles.pepIconContainer}>
                  <MaterialCommunityIcons name="account-check" size={24} color="#E91E63" />
                </View>
                <View style={styles.pepTextContainer}>
                  <Text style={styles.pepText}>
                    {isPep ? 
                      "Sou pessoa politicamente exposta" : 
                      "Não sou e não tenho vínculo com pessoa exposta politicamente"
                    }
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.continueButton}
            labelStyle={styles.continueButtonLabel}
          >
            CONTINUAR
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de PEP */}
      <PepInfoModal
        visible={pepModalVisible}
        onDismiss={() => setPepModalVisible(false)}
        onConfirm={handlePepConfirm}
        initialValue={isPep}
      />
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
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    fontSize: 16,
    height: 40,
    paddingHorizontal: 0,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
  },
  pepSelector: {
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  pepSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pepIconContainer: {
    marginRight: 12,
  },
  pepTextContainer: {
    flex: 1,
  },
  pepText: {
    fontSize: 16,
    color: '#212121',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
    backgroundColor: '#E91E63',
    borderRadius: 4,
    paddingVertical: 8,
    height: 48,
    justifyContent: 'center',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default PersonalDataScreen;
