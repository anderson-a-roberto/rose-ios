import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';
import TestDataButton from '../../components/TestDataButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCPF = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
};

const formatDate = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(
    /(\d{2})(\d{2})(\d{4})/,
    '$1/$2/$3'
  );
};

const PersonalDataScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { personalData } = onboardingData;

  const [formData, setFormData] = useState({
    fullName: personalData.fullName || '',
    documentNumber: personalData.documentNumber || '',
    birthDate: personalData.birthDate || '',
    motherName: personalData.motherName || '',
    isPep: personalData.isPep || false
  });

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'documentNumber') {
      formattedValue = formatCPF(value);
    } else if (field === 'birthDate') {
      formattedValue = formatDate(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleNext = () => {
    updateOnboardingData({
      personalData: {
        ...formData,
        documentNumber: formData.documentNumber.replace(/\D/g, '')
      }
    });
    navigation.navigate('OnboardingPepInfo');
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
            <TestDataButton 
              section="personalData" 
              onFill={(data) => setFormData(data)}
              style={styles.testButton}
            />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Dados Pessoais</Text>
            <Text style={styles.subtitle}>
              Vamos precisar de algumas informações para seguir com seu cadastro
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(value) => handleChange('fullName', value)}
              style={[styles.input, formData.fullName && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.fullName ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.fullName ? '600' : '400' } } }}
            />

            <Text style={styles.label}>CPF</Text>
            <TextInput
              value={formData.documentNumber}
              onChangeText={(value) => handleChange('documentNumber', value)}
              style={[styles.input, formData.documentNumber && styles.filledInput]}
              keyboardType="numeric"
              maxLength={14}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.documentNumber ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.documentNumber ? '600' : '400' } } }}
            />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              value={formData.birthDate}
              onChangeText={(value) => handleChange('birthDate', value)}
              style={[styles.input, formData.birthDate && styles.filledInput]}
              keyboardType="numeric"
              maxLength={10}
              placeholder="DD/MM/AAAA"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.birthDate ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.birthDate ? '600' : '400' } } }}
            />

            <Text style={styles.label}>Nome Completo da Mãe</Text>
            <TextInput
              value={formData.motherName}
              onChangeText={(value) => handleChange('motherName', value)}
              style={[styles.input, formData.motherName && styles.filledInput]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={formData.motherName ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: formData.motherName ? '600' : '400' } } }}
            />

            {/* PEP Selection */}
            <Text style={styles.label}>Pessoa Politicamente Exposta</Text>
            <TouchableOpacity
              style={[styles.input, styles.pepButton]}
              onPress={() => navigation.navigate('OnboardingPepInfo')}
            >
              <Text style={styles.pepText}>
                {formData.isPep ? 'Sim' : 'Não sou e não tenho vínculo...'}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
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
  header: {
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#FFF',
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
  },
  form: {
    paddingHorizontal: 24,
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
  pepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  pepText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
  },
  continueButton: {
    borderRadius: 4,
    backgroundColor: '#E91E63',
    height: 48,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

export default PersonalDataScreen;
