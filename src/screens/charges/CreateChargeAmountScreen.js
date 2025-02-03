import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCharge } from '../../contexts/ChargeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCurrency = (value) => {
  if (!value) return '0,00';
  const number = parseFloat(value.replace(/\D/g, '')) / 100;
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const CreateChargeAmountScreen = ({ navigation }) => {
  const { chargeData, updateChargeData } = useCharge();
  const [amount, setAmount] = useState(chargeData.valor ? formatCurrency(chargeData.valor.replace('.', '')) : '0,00');
  const TAXA_BOLETO = 7.90;

  const handleAmountChange = (text) => {
    // Remove tudo que não é número
    const numericValue = text.replace(/\D/g, '');
    if (numericValue.length > 10) return; // Limite de 10 dígitos
    
    const formatted = formatCurrency(numericValue);
    setAmount(formatted);
    
    // Atualiza o contexto com o valor no formato correto (com ponto)
    const value = formatted.replace(/\./g, '').replace(',', '.');
    updateChargeData({ valor: value });
  };

  const validateFields = () => {
    const value = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    return value > 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      navigation.navigate('CreateChargeFines');
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
      </View>

      <Text style={styles.title}>Valor da Cobrança</Text>
      <Text style={styles.subtitle}>Qual valor deseja cobrar?</Text>

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

      {/* Taxa Info */}
      <Text style={styles.taxInfo}>
        A taxa do boleto é de <Text style={styles.taxValue}>R$ {TAXA_BOLETO.toFixed(2).replace('.', ',')}</Text>
      </Text>

      {/* Next Button */}
      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.nextButton}
        labelStyle={styles.nextButtonLabel}
        disabled={!amount || amount === '0,00'}
      >
        PRÓXIMO
      </Button>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: '#000',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
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
  taxInfo: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 24,
    marginTop: 16,
  },
  taxValue: {
    color: '#FF0000',
  },
  nextButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 24,
    borderRadius: 25,
  },
  nextButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default CreateChargeAmountScreen;
