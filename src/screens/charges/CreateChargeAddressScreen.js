import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text, TextInput, Button, Switch } from 'react-native-paper';
import { useCharge } from '../../contexts/ChargeContext';
import MaskInput from 'react-native-mask-input';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCEP = (text) => {
  const numbers = text.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const CreateChargeAddressScreen = ({ navigation }) => {
  const { chargeData, updateChargeData } = useCharge();
  const [errors, setErrors] = useState({});
  const [noNumber, setNoNumber] = useState(false);

  const validateFields = () => {
    const newErrors = {};
    
    if (!chargeData.cep) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (chargeData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP inválido';
    }

    if (!chargeData.cidade) newErrors.cidade = 'Cidade é obrigatória';
    if (!chargeData.estado) newErrors.estado = 'Estado é obrigatório';
    if (!chargeData.rua) newErrors.rua = 'Endereço é obrigatório';
    if (!chargeData.numero && !noNumber) newErrors.numero = 'Número é obrigatório';
    if (!chargeData.bairro) newErrors.bairro = 'Bairro é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      navigation.navigate('CreateChargeAmount');
    }
  };

  const handleNoNumber = () => {
    setNoNumber(!noNumber);
    updateChargeData({ numero: !noNumber ? 'S/N' : '' });
  };

  const fetchAddress = async (cep) => {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          updateChargeData({
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
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
          <Text style={styles.headerTitle}>Endereço</Text>
          <Text style={styles.subtitle}>
            Insira o endereço do contato para gerar a cobrança
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.form}>
          <Text style={styles.label}>CEP</Text>
          <TextInput
            value={chargeData.cep}
            onChangeText={(text) => {
              const formatted = formatCEP(text);
              updateChargeData({ cep: formatted });
              if (text.replace(/\D/g, '').length === 8) {
                fetchAddress(text);
              }
            }}
            style={[styles.input, chargeData.cep && styles.filledInput]}
            error={!!errors.cep}
            keyboardType="numeric"
            maxLength={9}
            placeholder="00000-000"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.cep ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.cep ? '600' : '400' } } }}
          />
          {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            value={chargeData.cidade}
            onChangeText={(text) => updateChargeData({ cidade: text })}
            style={[styles.input, chargeData.cidade && styles.filledInput]}
            error={!!errors.cidade}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.cidade ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.cidade ? '600' : '400' } } }}
          />
          {errors.cidade && <Text style={styles.errorText}>{errors.cidade}</Text>}

          <Text style={styles.label}>Estado</Text>
          <TextInput
            value={chargeData.estado}
            onChangeText={(text) => updateChargeData({ estado: text.toUpperCase() })}
            style={[styles.input, chargeData.estado && styles.filledInput]}
            error={!!errors.estado}
            maxLength={2}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.estado ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.estado ? '600' : '400' } } }}
          />
          {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}

          <Text style={styles.label}>Endereço</Text>
          <TextInput
            value={chargeData.rua}
            onChangeText={(text) => updateChargeData({ rua: text })}
            style={[styles.input, chargeData.rua && styles.filledInput]}
            error={!!errors.rua}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.rua ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.rua ? '600' : '400' } } }}
          />
          {errors.rua && <Text style={styles.errorText}>{errors.rua}</Text>}

          <Text style={styles.label}>Número</Text>
          <TextInput
            value={chargeData.numero}
            onChangeText={(text) => updateChargeData({ numero: text })}
            style={[styles.input, chargeData.numero && styles.filledInput]}
            error={!!errors.numero}
            keyboardType="numeric"
            disabled={noNumber}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.numero ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.numero ? '600' : '400' } } }}
          />
          <View style={styles.switchContainer}>
            <Switch
              value={noNumber}
              onValueChange={handleNoNumber}
              color="#E91E63"
            />
            <Text style={styles.switchLabel}>SEM NÚMERO</Text>
          </View>
          {errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            value={chargeData.bairro}
            onChangeText={(text) => updateChargeData({ bairro: text })}
            style={[styles.input, chargeData.bairro && styles.filledInput]}
            error={!!errors.bairro}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.bairro ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.bairro ? '600' : '400' } } }}
          />
          {errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}

          <Text style={styles.label}>Complemento</Text>
          <TextInput
            value={chargeData.complemento}
            onChangeText={(text) => updateChargeData({ complemento: text })}
            style={[styles.input, chargeData.complemento && styles.filledInput]}
            placeholder="Opcional"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.complemento ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.complemento ? '600' : '400' } } }}
          />
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          disabled={!chargeData.cep || !chargeData.cidade || !chargeData.estado || !chargeData.rua || (!chargeData.numero && !noNumber) || !chargeData.bairro}
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    height: 56,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  filledInput: {
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -20,
    marginBottom: 24,
    marginLeft: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -16,
    marginBottom: 24,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
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

export default CreateChargeAddressScreen;
