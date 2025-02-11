import React from 'react';
import { View, StyleSheet, TouchableOpacity, Share, StatusBar } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PayBillReceiptScreen({ route }) {
  const navigation = useNavigation();
  const { paymentData } = route.params;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleShare = async () => {
    try {
      const message = `Comprovante de Pagamento\n\n` +
        `Valor: ${formatCurrency(paymentData.value)}\n` +
        `Data: ${formatDate(new Date())}\n` +
        `Para: ${paymentData.assignor}\n` +
        `Código de Barras: ${paymentData.barCode.digitable}`;

      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNewPayment = () => {
    navigation.navigate('PayBill', { balance: paymentData.balance });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Comprovante</Text>
          <Text style={styles.subtitle}>Pagamento realizado com sucesso</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Valor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor</Text>
          <Text style={styles.sectionValue}>{formatCurrency(paymentData.value)}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Text style={styles.sectionValue}>{formatDate(new Date())}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Para */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Para</Text>
          <Text style={styles.sectionValue}>{paymentData.assignor}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Código de Barras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Código de Barras</Text>
          <Text style={styles.sectionValue}>{paymentData.barCode.digitable}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleShare}
          style={[styles.button, styles.shareButton]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, styles.shareButtonLabel]}
        >
          COMPARTILHAR COMPROVANTE
        </Button>
        <Button
          mode="outlined"
          onPress={handleNewPayment}
          style={[styles.button, styles.newPaymentButton]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, styles.newPaymentLabel]}
        >
          NOVO PAGAMENTO
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
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  button: {
    marginBottom: 12,
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  shareButton: {
    backgroundColor: '#E91E63',
  },
  shareButtonLabel: {
    color: '#FFFFFF',
  },
  newPaymentButton: {
    borderColor: '#E91E63',
    borderWidth: 2,
  },
  newPaymentLabel: {
    color: '#E91E63',
  },
});
