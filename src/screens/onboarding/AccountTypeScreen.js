import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';

const AccountTypeScreen = ({ navigation }) => {
  const { updateOnboardingData } = useOnboarding();

  const handleTypeSelection = (type) => {
    updateOnboardingData({ accountType: type });
    
    if (type === 'PF') {
      navigation.navigate('OnboardingPersonalData');
    } else {
      navigation.navigate('CompanyData');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Tipo de Conta</Text>
      <Text style={styles.subtitle}>
        Selecione o tipo de conta que você deseja abrir
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleTypeSelection('PF')}
        >
          <MaterialCommunityIcons name="account" size={32} color="#000" />
          <Text style={styles.optionTitle}>Pessoa Física</Text>
          <Text style={styles.optionDescription}>
            Conta para uso pessoal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handleTypeSelection('PJ')}
        >
          <MaterialCommunityIcons name="domain" size={32} color="#000" />
          <Text style={styles.optionTitle}>Pessoa Jurídica</Text>
          <Text style={styles.optionDescription}>
            Conta para sua empresa
          </Text>
        </TouchableOpacity>
      </View>
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
  optionsContainer: {
    paddingHorizontal: 24,
  },
  option: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#000',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default AccountTypeScreen;
