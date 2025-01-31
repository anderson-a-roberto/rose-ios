import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCharge } from '../../contexts/ChargeContext';

const CreateChargeFinesScreen = ({ navigation }) => {
  const { chargeData, updateChargeData } = useCharge();
  const [errors, setErrors] = useState({});

  // Valores padrão
  const DEFAULT_MULTA = '10';
  const DEFAULT_JUROS = '10';

  // Inicializa com valores padrão se não existirem
  useState(() => {
    if (!chargeData.multa) {
      updateChargeData({ multa: DEFAULT_MULTA });
    }
    if (!chargeData.juros) {
      updateChargeData({ juros: DEFAULT_JUROS });
    }
  }, []);

  const validateFields = () => {
    const newErrors = {};
    
    const multaValue = parseFloat(chargeData.multa);
    if (isNaN(multaValue) || multaValue < 0 || multaValue > 100) {
      newErrors.multa = 'Multa deve ser entre 0 e 100%';
    }

    const jurosValue = parseFloat(chargeData.juros);
    if (isNaN(jurosValue) || jurosValue < 0 || jurosValue > 100) {
      newErrors.juros = 'Juros deve ser entre 0 e 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      navigation.navigate('CreateChargeDueDate');
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
      </View>

      <Text style={styles.title}>Multas, Juros e Descontos</Text>
      <Text style={styles.subtitle}>
        Você pode adicionar multas e juros ao valor após o vencimento e descontos para pagamentos antecipados
      </Text>

      {/* Multa */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Adicionar Multas</Text>
          <Text style={styles.sectionSubtitle}>Cobrança única</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            value={chargeData.multa}
            onChangeText={(text) => updateChargeData({ multa: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.multa}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000"
            right={<TextInput.Affix text="%" />}
          />
        </View>
        {errors.multa && <Text style={styles.errorText}>{errors.multa}</Text>}
      </View>

      {/* Juros */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Adicionar Juros</Text>
          <Text style={styles.sectionSubtitle}>Cobrança diária</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            value={chargeData.juros}
            onChangeText={(text) => updateChargeData({ juros: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.juros}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000"
            right={<TextInput.Affix text="%" />}
          />
        </View>
        {errors.juros && <Text style={styles.errorText}>{errors.juros}</Text>}
      </View>

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
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
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

export default CreateChargeFinesScreen;
