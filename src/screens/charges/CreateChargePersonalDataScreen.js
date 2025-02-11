import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
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
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
          <Text style={styles.subtitle}>
            Insira os dados pessoais do contato para gerar a cobrança
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
          <Text style={styles.label}>CPF/CNPJ</Text>
          <TextInput
            value={chargeData.cpfCnpj}
            onChangeText={(text) => updateChargeData({ cpfCnpj: text })}
            style={[styles.input, chargeData.cpfCnpj && styles.filledInput]}
            error={!!errors.cpfCnpj}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.cpfCnpj ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.cpfCnpj ? '600' : '400' } } }}
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

          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={chargeData.nome}
            onChangeText={(text) => updateChargeData({ nome: text })}
            style={[styles.input, chargeData.nome && styles.filledInput]}
            error={!!errors.nome}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            textColor={chargeData.nome ? '#000' : '#999'}
            theme={{ fonts: { regular: { fontWeight: chargeData.nome ? '600' : '400' } } }}
          />
          {errors.nome && (
            <Text style={styles.errorText}>{errors.nome}</Text>
          )}
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
          disabled={!chargeData.cpfCnpj || !chargeData.nome}
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

export default CreateChargePersonalDataScreen;
