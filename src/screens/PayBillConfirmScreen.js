import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function PayBillConfirmScreen({ route }) {
  const navigation = useNavigation();
  const { billData, balance } = route.params;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handlePayment = async () => {
    try {
      // Navega para tela de loading
      navigation.navigate('PayBillLoading');

      // TODO: Implementar chamada para API de pagamento
      // Simula tempo de processamento
      setTimeout(() => {
        // Navega para tela de sucesso com os dados do pagamento
        navigation.replace('PayBillSuccess', {
          paymentData: billData
        });
      }, 2000);

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      // TODO: Tratar erro
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
          <MaterialCommunityIcons name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagar Conta</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Confirme os dados do seu pagamento</Text>

        {/* Saldo Disponível */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Saldo disponível</Text>
          <Text style={styles.fieldValue}>{formatCurrency(balance)}</Text>
        </View>

        {/* Valor do Documento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Valor do Documento</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldValue}>{formatCurrency(billData.value)}</Text>
            <TouchableOpacity>
              <Text style={styles.editButton}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data de Pagamento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Data de Pagamento</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldValue}>
              {formatDate(new Date())}
            </Text>
            <TouchableOpacity>
              <Text style={styles.editButton}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vencimento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Vencimento</Text>
          <Text style={styles.fieldValue}>
            {formatDate(billData.registerData.payDueDate)}
          </Text>
        </View>

        {/* Para */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Para</Text>
          <Text style={styles.fieldValue}>{billData.assignor}</Text>
        </View>

        {/* Banco de Destino */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Banco de Destino</Text>
          <Text style={styles.fieldValue}>{billData.bank || 'Não informado'}</Text>
        </View>

        {/* Código de Barras */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Código de Barras</Text>
          <Text style={styles.fieldValue}>{billData.barCode.digitable}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handlePayment}
        >
          <Text style={styles.continueButtonText}>CONTINUAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1D1D1D',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    color: '#682145',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  continueButton: {
    backgroundColor: '#1D1D1D',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
