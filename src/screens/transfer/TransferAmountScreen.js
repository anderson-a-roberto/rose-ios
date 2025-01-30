import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const formatCurrency = (value) => {
  if (!value) return '0,00';
  const number = parseFloat(value.replace(/\D/g, '')) / 100;
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatBalance = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const TransferAmountScreen = ({ navigation, route }) => {
  const [amount, setAmount] = useState('');
  const { balance } = route.params;

  const handleAmountChange = (text) => {
    // Remove tudo que não é número
    const numericValue = text.replace(/\D/g, '');
    if (numericValue.length > 10) return; // Limite de 10 dígitos
    setAmount(formatCurrency(numericValue));
  };

  const handleContinue = () => {
    const value = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (value > 0) {
      navigation.navigate('TransferAccount', { amount: value });
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
        <Text style={styles.headerTitle}>Transferência</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Quanto você quer transferir?</Text>

        {/* Available Balance */}
        <Text style={styles.balanceLabel}>
          Saldo Disponível: {formatBalance(balance)}
        </Text>

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
            activeUnderlineColor="#000"
          />
        </View>

        {/* Continue Button */}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 24,
    marginBottom: 8,
    color: '#000',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 32,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#000',
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 32,
    fontWeight: 'bold',
    height: 64,
    paddingHorizontal: 0,
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    marginTop: 16,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
    color: '#FFFFFF',
  },
});

export default TransferAmountScreen;
