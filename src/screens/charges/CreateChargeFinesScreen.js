import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useCharge } from '../../contexts/ChargeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <Text style={styles.headerTitle}>Multas e Juros</Text>
          <Text style={styles.subtitle}>
            Configure as multas e juros para pagamentos após o vencimento
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Multa */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Multa por Atraso</Text>
            <Text style={styles.sectionSubtitle}>Cobrança única após o vencimento</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              value={chargeData.multa}
              onChangeText={(text) => updateChargeData({ multa: text })}
              style={[styles.input, chargeData.multa && styles.filledInput]}
              keyboardType="numeric"
              error={!!errors.multa}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={chargeData.multa ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: chargeData.multa ? '600' : '400' } } }}
              right={<TextInput.Affix text="%" />}
            />
          </View>
          {errors.multa && <Text style={styles.errorText}>{errors.multa}</Text>}
        </View>

        {/* Juros */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Juros ao Dia</Text>
            <Text style={styles.sectionSubtitle}>Cobrança por dia de atraso</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              value={chargeData.juros}
              onChangeText={(text) => updateChargeData({ juros: text })}
              style={[styles.input, chargeData.juros && styles.filledInput]}
              keyboardType="numeric"
              error={!!errors.juros}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={chargeData.juros ? '#000' : '#999'}
              theme={{ fonts: { regular: { fontWeight: chargeData.juros ? '600' : '400' } } }}
              right={<TextInput.Affix text="%" />}
            />
          </View>
          {errors.juros && <Text style={styles.errorText}>{errors.juros}</Text>}
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#F5F5F5',
    height: 56,
    borderRadius: 8,
    fontSize: 16,
  },
  filledInput: {
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
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

export default CreateChargeFinesScreen;
