import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCharge } from '../../contexts/ChargeContext';
import MaskInput from 'react-native-mask-input';
import { SafeAreaView } from 'react-native-safe-area-context';

const CreateChargePersonalDataScreen = ({ navigation }) => {
  const { chargeData, updateChargeData } = useCharge();
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    
    if (!chargeData.cpfCnpj) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório';
    } else if (chargeData.cpfCnpj.replace(/\D/g, '').length !== 11 && 
               chargeData.cpfCnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cpfCnpj = 'CPF/CNPJ inválido';
    }

    if (!chargeData.nome) {
      newErrors.nome = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      navigation.navigate('CreateChargeAddress');
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

      <Text style={styles.title}>Dados Pessoais</Text>
      <Text style={styles.subtitle}>Insira os dados pessoais do contato</Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          label="CPF/CNPJ"
          value={chargeData.cpfCnpj}
          onChangeText={(text) => updateChargeData({ cpfCnpj: text })}
          style={styles.input}
          mode="outlined"
          error={!!errors.cpfCnpj}
          outlineColor="#E0E0E0"
          activeOutlineColor="#000"
          render={props => (
            <MaskInput
              {...props}
              mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
            />
          )}
        />
        {errors.cpfCnpj && (
          <Text style={styles.errorText}>{errors.cpfCnpj}</Text>
        )}

        <TextInput
          label="Nome"
          value={chargeData.nome}
          onChangeText={(text) => updateChargeData({ nome: text })}
          style={styles.input}
          mode="outlined"
          error={!!errors.nome}
          outlineColor="#E0E0E0"
          activeOutlineColor="#000"
        />
        {errors.nome && (
          <Text style={styles.errorText}>{errors.nome}</Text>
        )}
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
  form: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
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

export default CreateChargePersonalDataScreen;
