import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cobrar</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Quanto você quer receber?</Text>

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
        />
      </View>

      <Text style={styles.disclaimer}>
        Caso você não especifique o valor, o preenchimento do campo será feito pelo pagador.
      </Text>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          labelStyle={styles.continueButtonLabel}
          disabled={!amount || amount === '0,00'}
        >
          CONTINUAR
        </Button>
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    flex: 1,
    textAlign: 'left',
    color: '#000',
    height: 80,
  },
  disclaimer: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 25,
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#fff',
  },
});

export default PixReceiveAmountScreen;
