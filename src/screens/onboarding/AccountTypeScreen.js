import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const AccountTypeScreen = ({ navigation }) => {
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

      <Text style={styles.title}>Abrir Conta</Text>
      <Text style={styles.subtitle}>Qual o tipo de conta que você quer abrir?</Text>

      <View style={styles.optionsContainer}>
        {/* Pessoa Jurídica - Desabilitado */}
        <TouchableOpacity style={[styles.option, styles.optionDisabled]}>
          <View style={styles.optionContent}>
            <MaterialCommunityIcons name="bank" size={32} color="#999" />
            <Text style={[styles.optionText, styles.optionTextDisabled]}>
              Pessoa{'\n'}Jurídica
            </Text>
          </View>
        </TouchableOpacity>

        {/* Pessoa Física */}
        <TouchableOpacity 
          style={styles.option}
          onPress={() => navigation.navigate('OnboardingPersonalData')}
        >
          <View style={styles.optionContent}>
            <MaterialCommunityIcons name="account" size={32} color="#000" />
            <Text style={styles.optionText}>
              Pessoa{'\n'}Física
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('OnboardingPersonalData')}
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
  optionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  option: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#000',
  },
  optionDisabled: {
    borderColor: '#999',
    backgroundColor: '#f5f5f5',
  },
  optionContent: {
    alignItems: 'center',
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
  },
  optionTextDisabled: {
    color: '#999',
  },
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 24,
    borderRadius: 25,
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default AccountTypeScreen;
