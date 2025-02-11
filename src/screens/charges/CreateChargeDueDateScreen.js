import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useCharge } from '../../contexts/ChargeContext';
import MaskInput from 'react-native-mask-input';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <Text style={styles.headerTitle}>Data de Vencimento</Text>
          <Text style={styles.subtitle}>
            Defina a data limite para o pagamento do boleto
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Data Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Data de Vencimento</Text>
          <View style={styles.inputContainer}>
            <MaskInput
              value={chargeData.dataVencimento}
              onChangeText={handleDateChange}
              style={[
                styles.input,
                chargeData.dataVencimento && styles.filledInput,
                errors.dataVencimento && styles.inputError
              ]}
              keyboardType="numeric"
              placeholder="00/00/0000"
              placeholderTextColor="#999"
              mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
            />
          </View>
          {errors.dataVencimento && (
            <Text style={styles.errorText}>{errors.dataVencimento}</Text>
          )}
        </View>

        {/* Processing Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.processingInfo}>
            O boleto leva até 3 dias úteis para ser processado
          </Text>
        </View>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
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
    paddingTop: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '400',
  },
  filledInput: {
    color: '#000',
    fontWeight: '600',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#B00020',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  infoContainer: {
    marginTop: 16,
  },
  processingInfo: {
    fontSize: 14,
    color: '#666',
    opacity: 0.8,
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

export default CreateChargeDueDateScreen;
