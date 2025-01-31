import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCharge } from '../../contexts/ChargeContext';
import MaskInput from 'react-native-mask-input';

const CreateChargeDueDateScreen = ({ navigation }) => {
  const { chargeData, updateChargeData } = useCharge();
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    
    if (!chargeData.dataVencimento) {
      newErrors.dataVencimento = 'Data de vencimento é obrigatória';
      setErrors(newErrors);
      return false;
    }

    // Validar formato da data (DD/MM/YYYY)
    const [dia, mes, ano] = chargeData.dataVencimento.split('/');
    const data = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (!data || data < hoje) {
      newErrors.dataVencimento = 'Data de vencimento deve ser futura';
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateFields()) {
      navigation.navigate('CreateChargeSummary');
    }
  };

  const handleDateChange = (text) => {
    updateChargeData({ dataVencimento: text });
    setErrors({});
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

      <Text style={styles.title}>Data de Vencimento</Text>
      <Text style={styles.subtitle}>Qual a data de vencimento do boleto?</Text>

      {/* Data Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Data de Vencimento</Text>
        <MaskInput
          value={chargeData.dataVencimento}
          onChangeText={handleDateChange}
          style={[
            styles.input,
            errors.dataVencimento && styles.inputError
          ]}
          keyboardType="numeric"
          placeholder="00/00/0000"
          placeholderTextColor="#666"
          mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
        />
        {errors.dataVencimento && (
          <Text style={styles.errorText}>{errors.dataVencimento}</Text>
        )}
      </View>

      {/* Processing Info */}
      <Text style={styles.processingInfo}>
        O boleto leva 3 dias úteis para ser processado
      </Text>

      {/* Next Button */}
      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.nextButton}
        labelStyle={styles.nextButtonLabel}
      >
        PRÓXIMO
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
  inputContainer: {
    marginHorizontal: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  inputError: {
    borderColor: '#B00020',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  processingInfo: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 24,
    marginTop: 16,
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

export default CreateChargeDueDateScreen;
