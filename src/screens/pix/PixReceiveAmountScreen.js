import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCurrency = (value) => {
  if (!value) return '0,00';
  const number = parseFloat(value.replace(/\D/g, '')) / 100;
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PixReceiveAmountScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');

  const handleAmountChange = (text) => {
    // Remove tudo que não é número
    const numericValue = text.replace(/\D/g, '');
    if (numericValue.length > 10) return; // Limite de 10 dígitos
    setAmount(formatCurrency(numericValue));
  };

  const handleContinue = () => {
    if (!amount) return;
    // Converte o valor para número removendo formatação
    const value = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (value > 0) {
      navigation.navigate('PixReceiveKey', { amount: value });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
            <Text style={styles.headerTitle}>Cobrar</Text>
            <Text style={styles.subtitle}>Quanto você quer receber?</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              mode="flat"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              style={styles.amountInput}
              placeholder="0,00"
              placeholderTextColor="#666"
              autoFocus={true}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              selectionColor="#E91E63"
            />
          </View>

          <Text style={styles.disclaimer}>
            Caso você não especifique o valor, o preenchimento do campo será feito pelo pagador.
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            disabled={!amount || amount === '0,00'}
          >
            CONTINUAR
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    color: '#E91E63',
    fontSize: 32,
    fontWeight: '300',
  },
  headerContent: {
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 32,
    color: '#000',
    marginRight: 8,
    fontWeight: '500',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    color: '#000',
    height: 56,
  },
  disclaimer: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFF',
  },
});

export default PixReceiveAmountScreen;
