import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import TestDataButton from '../../../components/TestDataButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCEP = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const CompanyAddressScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { companyAddress } = onboardingData;

  const [formData, setFormData] = useState({
    postalCode: companyAddress?.postalCode || '',
    street: companyAddress?.street || '',
    number: companyAddress?.number || '',
    complement: companyAddress?.complement || '',
    neighborhood: companyAddress?.neighborhood || '',
    city: companyAddress?.city || '',
    state: companyAddress?.state || '',
  });

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'postalCode') {
      formattedValue = formatCEP(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleNext = () => {
    updateOnboardingData({
      companyAddress: {
        ...formData,
        postalCode: formData.postalCode.replace(/\D/g, '')
      }
    });
    navigation.navigate('CompanyContact');
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
            section="companyAddress" 
            onFill={(data) => setFormData(data)}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Endereço da empresa</Text>
          <Text style={styles.headerSubtitle}>
            Informe o endereço da sede da sua empresa
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="CEP"
            value={formData.postalCode}
            onChangeText={(value) => handleChange('postalCode', value)}
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
            label="Rua/Avenida"
            value={formData.street}
            onChangeText={(value) => handleChange('street', value)}
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
            value={formData.number}
            onChangeText={(value) => handleChange('number', value)}
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
            value={formData.complement}
            onChangeText={(value) => handleChange('complement', value)}
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
            value={formData.neighborhood}
            onChangeText={(value) => handleChange('neighborhood', value)}
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
            value={formData.city}
            onChangeText={(value) => handleChange('city', value)}
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
            value={formData.state}
            onChangeText={(value) => handleChange('state', value)}
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

export default CompanyAddressScreen;
