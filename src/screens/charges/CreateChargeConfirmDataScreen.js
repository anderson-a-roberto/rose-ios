import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCharge } from '../../contexts/ChargeContext';

const DataItem = ({ label, value }) => (
  <View style={styles.dataItem}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value}</Text>
  </View>
);

const DataSection = ({ title, onEdit, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

const CreateChargeConfirmDataScreen = ({ navigation }) => {
  const { chargeData } = useCharge();

  const handleNext = () => {
    navigation.navigate('CreateChargeAmount');
  };

  const formatCPFCNPJ = (value) => {
    return value.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatCEP = (value) => {
    return value.replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
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

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Confirmar Dados</Text>
        <Text style={styles.subtitle}>Confirme os dados do contato</Text>

        {/* Dados Pessoais */}
        <DataSection 
          title="Dados Pessoais" 
          onEdit={() => navigation.navigate('CreateChargePersonalData')}
        >
          <DataItem 
            label="CPF/CNPJ" 
            value={formatCPFCNPJ(chargeData.cpfCnpj)}
          />
          <DataItem 
            label="Nome" 
            value={chargeData.nome}
          />
        </DataSection>

        {/* Endereço */}
        <DataSection 
          title="Endereço" 
          onEdit={() => navigation.navigate('CreateChargeAddress')}
        >
          <DataItem 
            label="CEP" 
            value={formatCEP(chargeData.cep)}
          />
          <DataItem 
            label="Cidade" 
            value={`${chargeData.cidade} - ${chargeData.estado}`}
          />
          <DataItem 
            label="Endereço" 
            value={chargeData.rua}
          />
          <DataItem 
            label="Número" 
            value={chargeData.numero}
          />
          <DataItem 
            label="Bairro" 
            value={chargeData.bairro}
          />
          {chargeData.complemento && (
            <DataItem 
              label="Complemento" 
              value={chargeData.complemento}
            />
          )}
        </DataSection>
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
    </View>
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
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  editButton: {
    padding: 4,
  },
  editText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  dataItem: {
    marginBottom: 16,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    color: '#000',
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

export default CreateChargeConfirmDataScreen;
