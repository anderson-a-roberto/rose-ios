import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

const BillDetails = ({ data, onConfirmPayment }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Boleto</Text>

      <View style={styles.detailGroup}>
        <Text style={styles.label}>Beneficiário</Text>
        <Text style={styles.value}>{data.assignor}</Text>
      </View>

      <View style={styles.detailGroup}>
        <Text style={styles.label}>Valor</Text>
        <Text style={styles.valueHighlight}>
          {formatCurrency(data.value)}
        </Text>
      </View>

      <View style={styles.detailGroup}>
        <Text style={styles.label}>Vencimento</Text>
        <Text style={styles.value}>
          {formatDate(data.registerData.payDueDate)}
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={onConfirmPayment}
        style={styles.payButton}
        buttonColor="#FF1493"
      >
        Pagar Boleto
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  detailGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  valueHighlight: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  payButton: {
    marginTop: 20,
  },
});

export default BillDetails;
