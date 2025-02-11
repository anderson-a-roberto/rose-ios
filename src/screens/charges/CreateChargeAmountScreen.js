import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
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
          <Text style={styles.headerTitle}>Valor da Cobrança</Text>
          <Text style={styles.subtitle}>Qual valor deseja cobrar?</Text>
        </View>
      </View>

      {/* Content */}
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
            contentStyle={styles.amountInputContent}
            placeholder="0,00"
            placeholderTextColor="#666"
            autoFocus={true}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
        </View>

        {/* Taxa Info */}
        <Text style={styles.taxInfo}>
          A taxa do boleto é de <Text style={styles.taxValue}>R$ {TAXA_BOLETO.toFixed(2).replace('.', ',')}</Text>
        </Text>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          disabled={!amount || amount === '0,00'}
        >
          PRÓXIMO
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
    marginTop: 32,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 32,
    color: '#000',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 32,
  },
  amountInputContent: {
    paddingHorizontal: 0,
    height: 56,
  },
  taxInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  taxValue: {
    color: '#000',
    fontWeight: '500',
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

export default CreateChargeAmountScreen;
