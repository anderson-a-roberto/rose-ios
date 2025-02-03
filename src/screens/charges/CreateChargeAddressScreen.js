import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCharge } from '../../contexts/ChargeContext';
import MaskInput from 'react-native-mask-input';
import { SafeAreaView } from 'react-native-safe-area-context';

const CreateChargeAddressScreen = ({ navigation }) => {
  const { chargeData, updateChargeData } = useCharge();
  const [errors, setErrors] = useState({});

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
    if (!chargeData.numero) newErrors.numero = 'Número é obrigatório';
    if (!chargeData.bairro) newErrors.bairro = 'Bairro é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      navigation.navigate('CreateChargeConfirmData');
    }
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

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Endereço</Text>
        <Text style={styles.subtitle}>Insira o endereço do contato</Text>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="CEP"
            value={chargeData.cep}
            onChangeText={(text) => {
              updateChargeData({ cep: text });
              if (text.replace(/\D/g, '').length === 8) {
                fetchAddress(text);
              }
            }}
            style={styles.input}
            mode="outlined"
            error={!!errors.cep}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000"
            render={props => (
              <MaskInput
                {...props}
                mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]}
              />
            )}
          />
          {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}

          <View style={styles.row}>
            <TextInput
              label="Cidade"
              value={chargeData.cidade}
              onChangeText={(text) => updateChargeData({ cidade: text })}
              style={[styles.input, styles.flex1, { marginRight: 8 }]}
              mode="outlined"
              error={!!errors.cidade}
              outlineColor="#E0E0E0"
              activeOutlineColor="#000"
            />
            <TextInput
              label="Estado"
              value={chargeData.estado}
              onChangeText={(text) => updateChargeData({ estado: text.toUpperCase() })}
              style={[styles.input, { width: 80 }]}
              mode="outlined"
              error={!!errors.estado}
              outlineColor="#E0E0E0"
              activeOutlineColor="#000"
              maxLength={2}
            />
          </View>
          {(errors.cidade || errors.estado) && (
            <Text style={styles.errorText}>{errors.cidade || errors.estado}</Text>
          )}

          <TextInput
            label="Endereço"
            value={chargeData.rua}
            onChangeText={(text) => updateChargeData({ rua: text })}
            style={styles.input}
            mode="outlined"
            error={!!errors.rua}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000"
          />
          {errors.rua && <Text style={styles.errorText}>{errors.rua}</Text>}

          <TextInput
            label="Número"
            value={chargeData.numero}
            onChangeText={(text) => updateChargeData({ numero: text })}
            style={styles.input}
            mode="outlined"
            error={!!errors.numero}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000"
            keyboardType="numeric"
          />
          {errors.numero && <Text style={styles.errorText}>{errors.numero}</Text>}

          <TextInput
            label="Bairro"
            value={chargeData.bairro}
            onChangeText={(text) => updateChargeData({ bairro: text })}
            style={styles.input}
            mode="outlined"
            error={!!errors.bairro}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000"
          />
          {errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}

          <TextInput
            label="Complemento"
            value={chargeData.complemento}
            onChangeText={(text) => updateChargeData({ complemento: text })}
            style={styles.input}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor="#000"
          />
          <Text style={styles.optionalText}>Opcional</Text>
        </View>
      </ScrollView>

      {/* Next Button */}
      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.nextButton}
        labelStyle={styles.nextButtonLabel}
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
  scrollView: {
    flex: 1,
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
  form: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 8,
  },
  optionalText: {
    color: '#666',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginVertical: 24,
    borderRadius: 25,
  },
  nextButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default CreateChargeAddressScreen;
