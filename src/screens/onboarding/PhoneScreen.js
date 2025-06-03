import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';

const formatPhone = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(
      /(\d{2})?(\d{4,5})?(\d{4})?/,
      function(_, ddd, prefix, suffix) {
        if (suffix) return `(${ddd}) ${prefix}-${suffix}`;
        if (prefix) return `(${ddd}) ${prefix}`;
        if (ddd) return `(${ddd}`;
        return '';
      }
    );
  }
  return text.slice(0, 15);
};

const PhoneScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState(onboardingData.contactData.phoneNumber || '');

  const handleChange = (value) => {
    setPhoneNumber(formatPhone(value));
  };

  const handleNext = () => {
    updateOnboardingData({
      contactData: {
        ...onboardingData.contactData,
        phoneNumber: phoneNumber.replace(/\D/g, '')
      }
    });
    navigation.navigate('OnboardingEmail');
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
          <Text style={styles.headerTitle}>Celular</Text>
          <Text style={styles.subtitle}>
            Informe o número do seu celular
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
              <Text style={styles.label}>Celular</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={handleChange}
                style={[styles.input, phoneNumber && styles.filledInput]}
                underlineColor="transparent"
                activeUnderlineColor="#E91E63"
                selectionColor="#E91E63"
                cursorColor="#E91E63"
                caretHidden={false}
                keyboardType="numeric"
                maxLength={15}
              />
              
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

export default PhoneScreen;
