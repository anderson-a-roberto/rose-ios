import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';
import TestDataButton from '../../components/TestDataButton';

const PasswordScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNext = () => {
    updateOnboardingData({
      securityData: {
        password: formData.password
      }
    });
    // Se for PJ (tem dados da empresa), vai para CompanyContact
    // Se for PF, segue o fluxo normal
    if (onboardingData.companyData) {
      navigation.navigate('CompanyContact');
    } else {
      navigation.navigate('OnboardingPhone');
    }
  };

  return (
    <View style={styles.container}>
      <TestDataButton 
        section="securityData" 
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

      <Text style={styles.title}>Senha do App</Text>
      <Text style={styles.subtitle}>
        Nesta etapa, você vai precisar cadastrar uma senha de acesso ao app
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          label="Senha de acesso ao app"
          value={formData.password}
          onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
              color="#666"
            />
          }
        />

        <TextInput
          label="Confirmar Senha de acesso ao app"
          value={formData.confirmPassword}
          onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showConfirmPassword}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? "eye-off" : "eye"}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              color="#666"
            />
          }
        />

        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>Regras da Senha</Text>
          <Text style={styles.ruleItem}>• A senha deve ter 8 caracteres;</Text>
          <Text style={styles.ruleItem}>• Deverá ter ao menos uma letra maiúscula</Text>
          <Text style={styles.ruleItem}>  e uma letra minúscula;</Text>
          <Text style={styles.ruleItem}>• Possuir ao menos 1 caracter especial;</Text>
          <Text style={styles.ruleItem}>• Possuir ao menos 1 número.</Text>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.continueButton}
        labelStyle={styles.continueButtonLabel}
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
    flex: 1,
  },
  input: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  rulesContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  rulesTitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  ruleItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginVertical: 24,
    borderRadius: 25,
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default PasswordScreen;
