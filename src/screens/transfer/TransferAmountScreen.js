import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
              <MaterialCommunityIcons name="arrow-left" size={24} color="#E91E63" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Transferência</Text>
            <Text style={styles.subtitle}>Quanto você quer transferir?</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Available Balance */}
          <Text style={styles.balanceLabel}>
            Saldo Disponível: <Text style={styles.balanceValue}>{formatBalance(balance)}</Text>
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
              contentStyle={{ color: '#000000', fontSize: 32 }}
              placeholder="0,00"
              placeholderTextColor="#666"
              autoFocus={true}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              selectionColor="#E91E63"
              theme={{
                colors: {
                  text: '#000000',
                  placeholder: '#666666',
                  primary: '#E91E63',
                }
              }}
            />
          </View>
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
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  balanceValue: {
    color: '#000',
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
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

export default TransferAmountScreen;
