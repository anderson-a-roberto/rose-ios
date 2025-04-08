import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';

const formatCPF = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
};

const AccountTypeScreen = ({ navigation }) => {
  const { updateOnboardingData, onboardingData } = useOnboarding();
  const [selectedType, setSelectedType] = useState(null);
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState('');

  const handleCpfChange = (value) => {
    const formattedCpf = formatCPF(value);
    setCpf(formattedCpf);
    setCpfError('');
  };

  const validateCpf = () => {
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      setCpfError('CPF deve conter 11 dígitos');
      return false;
    }
    return true;
  };

  const handleTypeSelection = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) {
      return;
    }

    if (selectedType === 'PF') {
      if (!validateCpf()) {
        return;
      }

      updateOnboardingData({ 
        accountType: selectedType,
        personalData: {
          ...onboardingData.personalData,
          documentNumber: cpf
        }
      });
      
      navigation.navigate('OnboardingPersonalData');
    } else {
      updateOnboardingData({ accountType: selectedType });
      navigation.navigate('CompanyData');
    }
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
            <Text style={styles.headerTitle}>Tipo de Conta</Text>
            <Text style={styles.subtitle}>
              Selecione o tipo de conta que você deseja abrir
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
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                selectedType === 'PF' && styles.selectedOption
              ]}
              onPress={() => handleTypeSelection('PF')}
            >
              <MaterialCommunityIcons name="account" size={32} color={selectedType === 'PF' ? "#E91E63" : "#000"} />
              <Text style={styles.optionTitle}>Pessoa Física</Text>
              <Text style={styles.optionDescription}>
                Conta para uso pessoal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                selectedType === 'PJ' && styles.selectedOption
              ]}
              onPress={() => handleTypeSelection('PJ')}
            >
              <MaterialCommunityIcons name="domain" size={32} color={selectedType === 'PJ' ? "#E91E63" : "#000"} />
              <Text style={styles.optionTitle}>Pessoa Jurídica</Text>
              <Text style={styles.optionDescription}>
                Conta para sua empresa
              </Text>
            </TouchableOpacity>
          </View>

          {selectedType === 'PF' && (
            <View style={styles.cpfContainer}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                value={cpf}
                onChangeText={handleCpfChange}
                style={[styles.input, cpf && styles.filledInput]}
                keyboardType="numeric"
                maxLength={14}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={cpf ? '#000' : '#999'}
                theme={{ fonts: { regular: { fontWeight: cpf ? '600' : '400' } } }}
              />
              {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={[
              styles.continueButton,
              (!selectedType || (selectedType === 'PF' && !cpf)) && styles.disabledButton
            ]}
            labelStyle={styles.continueButtonLabel}
            disabled={!selectedType || (selectedType === 'PF' && !cpf)}
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  option: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#E91E63',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cpfContainer: {
    marginBottom: 24,
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
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
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

export default AccountTypeScreen;
