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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
          <Text style={styles.subtitle}>
            Vamos precisar de algumas informações para seguir com seu cadastro
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
            <View style={styles.form}>
              {/* CPF */}
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={[styles.input, formData.documentNumber ? styles.filledInput : null]}
                value={formData.documentNumber}
                onChangeText={(text) => handleChange('documentNumber', text)}
                keyboardType="numeric"
                maxLength={14} // 11 dígitos + 3 caracteres de formatação
                editable={!formData.documentNumber} // Não permite edição se já estiver preenchido
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                dense
              />
              
              {/* Nome Completo */}
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={[styles.input, formData.fullName ? styles.filledInput : null]}
                value={formData.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
                placeholder="Digite seu nome completo (nome e sobrenome)"
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                dense
                error={!!errors.fullName}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              
              {/* Data de Nascimento */}
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                style={[styles.input, formData.birthDate ? styles.filledInput : null]}
                value={formData.birthDate}
                onChangeText={(text) => handleChange('birthDate', text)}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10} // DD/MM/AAAA
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                dense
                error={!!errors.birthDate}
              />
              {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
              
              {/* Nome da Mãe */}
              <Text style={styles.label}>Nome da Mãe</Text>
              <TextInput
                style={[styles.input, formData.motherName ? styles.filledInput : null]}
                value={formData.motherName}
                onChangeText={(text) => handleChange('motherName', text)}
                placeholder="Digite o nome da mãe"
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                dense
              />
              
              {/* Pessoa Politicamente Exposta */}
              <Text style={styles.label}>Pessoa Politicamente Exposta</Text>
              <TouchableOpacity 
                style={styles.pepSelector}
                onPress={() => setPepModalVisible(true)}
              >
                <View style={styles.pepSelectorContent}>
                  <View style={styles.pepIconContainer}>
                    <MaterialCommunityIcons 
                      name={isPep ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                      size={24}
                      color={isPep ? "#4CAF50" : "#757575"}
                    />
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
              
              {/* Espaço extra no final para garantir que o último campo seja visível acima do botão */}
              <View style={styles.bottomPadding} />
            </View>
          </ScrollView>

          {/* Botão de continuar - sempre visível */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.continueButton}
              labelStyle={styles.continueButtonLabel}
            >
              CONTINUAR
            </Button>
          </View>
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
    paddingBottom: 24,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 8,
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
  // Espaço extra no final do formulário para garantir que o último campo fique visível acima do botão
  bottomPadding: {
    height: 100,
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
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});

export default PersonalDataScreen;
