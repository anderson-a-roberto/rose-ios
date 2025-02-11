import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <Text style={styles.headerTitle}>Pagar Conta</Text>
          <Text style={styles.subtitle}>Confirme os dados do seu pagamento</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Saldo Disponível */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saldo disponível</Text>
          <Text style={styles.sectionValue}>{formatCurrency(balance)}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Valor do Documento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor do Documento</Text>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionValue}>{formatCurrency(billData.value)}</Text>
            <TouchableOpacity>
              <Text style={styles.editButton}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Data de Pagamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data de Pagamento</Text>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionValue}>
              {formatDate(new Date())}
            </Text>
            <TouchableOpacity>
              <Text style={styles.editButton}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Vencimento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vencimento</Text>
          <Text style={styles.sectionValue}>
            {formatDate(billData.registerData.payDueDate)}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Para */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Para</Text>
          <Text style={styles.sectionValue}>{billData.assignor}</Text>
        </View>

        {/* Banco de Destino */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Banco de Destino</Text>
          <Text style={styles.sectionValue}>{billData.bank || 'Não informado'}</Text>
        </View>

        {/* Código de Barras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Código de Barras</Text>
          <Text style={styles.sectionValue}>{billData.barCode.digitable}</Text>
        </View>
      </View>

      {/* Pay Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handlePayment}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          PAGAR
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
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
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
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
