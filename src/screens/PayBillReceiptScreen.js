import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ReceiptField = ({ label, value, copyable }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldValueContainer}>
      <Text style={styles.fieldValue}>{value}</Text>
      {copyable && (
        <TouchableOpacity onPress={() => {}}>
          <MaterialCommunityIcons name="content-copy" size={20} color="#682145" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function PayBillReceiptScreen({ route }) {
  const navigation = useNavigation();
  const { paymentData } = route.params;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meu Comprovante</Text>
          <Text style={styles.headerSubtitle}>Processando Pagamento</Text>
          <Text style={styles.headerDate}>{formatDate(new Date())}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Dashboard2')}
          style={styles.closeButton}
        >
          <MaterialCommunityIcons name="close" size={24} color="#682145" />
        </TouchableOpacity>
      </View>

      {/* Value */}
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{formatCurrency(paymentData.value)}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Origem */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Origem</Text>
          <ReceiptField label="Nome" value="João da Silva" copyable />
          <ReceiptField label="CPF/CNPJ" value="385.988.578-85" copyable />
          <ReceiptField label="Conta" value="00000000" copyable />
        </View>

        {/* Destino */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destino</Text>
          <ReceiptField label="Favorecido" value={paymentData.assignor} copyable />
          <ReceiptField label="CPF/CNPJ" value={paymentData.registerData.assignorDocument} copyable />
          <ReceiptField label="Emissor" value={paymentData.bank} />
          <ReceiptField label="Vencimento" value={formatDate(paymentData.registerData.payDueDate)} />
          <ReceiptField label="Código do Boleto" value={paymentData.barCode.digitable} copyable />
        </View>

        {/* Authentication */}
        <TouchableOpacity style={styles.authButton}>
          <Text style={styles.authButtonText}>Autenticação</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1D1D1D',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  headerDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  valueContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D1D1D',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1D',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 16,
    color: '#1D1D1D',
    flex: 1,
  },
  authButton: {
    marginVertical: 24,
    marginHorizontal: 16,
    height: 48,
    backgroundColor: '#682145',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
