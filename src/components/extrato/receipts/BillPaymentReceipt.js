import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../config/supabase';
import { format } from 'date-fns';

const formatDate = (dateString) => {
  return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm");
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para formatar o código de barras com espaços para melhor legibilidade
const formatBarcode = (barcode) => {
  if (!barcode) return '-';
  
  // Adiciona um espaço a cada 5 caracteres para facilitar a leitura
  return barcode.replace(/(.{5})/g, '$1 ').trim();
};

const BillPaymentReceipt = ({ transaction, onPaymentDetailsLoaded, preloadedDetails }) => {
  const [loading, setLoading] = useState(!preloadedDetails);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(preloadedDetails || null);
  const [hasLoaded, setHasLoaded] = useState(!!preloadedDetails);
  
  // Determinar o tipo de operação
  const operationType = "BOLETO PAGO";

  useEffect(() => {
    // Se já temos dados pré-carregados, não fazer nova chamada à API
    if (preloadedDetails) {
      console.log('[BillPaymentReceipt] Usando dados pré-carregados:', preloadedDetails);
      setPaymentDetails(preloadedDetails);
      setLoading(false);
      setHasLoaded(true);
      
      // Notificar componente pai
      if (onPaymentDetailsLoaded) {
        onPaymentDetailsLoaded(preloadedDetails);
      }
      return;
    }

    const fetchPaymentDetails = async () => {
      // Evitar múltiplas chamadas
      if (hasLoaded) return;
      
      try {
        setLoading(true);
        setError(null);

        const { data, error: apiError } = await supabase.functions.invoke(
          'bill-payment-status',
          {
            body: { id: transaction.id }
          }
        );

        if (apiError) throw apiError;

        if (data.status === 'ERROR') {
          throw new Error(data.error?.message || 'Erro ao consultar detalhes do pagamento');
        }

        console.log('[BillPaymentReceipt] Detalhes do pagamento carregados:', data);
        setPaymentDetails(data);
        
        // Notifica o componente pai sobre os detalhes carregados
        if (onPaymentDetailsLoaded) {
          onPaymentDetailsLoaded(data);
        }
        
        // Marcar como carregado para evitar novas chamadas
        setHasLoaded(true);
      } catch (err) {
        console.error('[BillPaymentReceipt] Erro ao buscar detalhes do pagamento:', err);
        setError(err.message || 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [transaction.id, onPaymentDetailsLoaded, hasLoaded, preloadedDetails]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={24} color="#B00020" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Status do pagamento
  const paymentStatus = paymentDetails?.body?.hasOccurrence 
    ? 'FALHA' 
    : (paymentDetails?.status === 'CONFIRMED' ? 'CONFIRMADO' : 'PENDENTE');
  
  // Cor do status
  const statusColor = paymentStatus === 'CONFIRMADO' 
    ? '#4CAF50' 
    : (paymentStatus === 'FALHA' ? '#B00020' : '#FF9800');

  return (
    <View style={styles.receiptContainer}>
      {/* Header com Logo Rose */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/logorosa.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Comprovante</Text>
      </View>

      {/* Seção TRANSAÇÃO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRANSAÇÃO</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.valueHighlight}>{operationType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Data:</Text>
          <Text style={styles.value}>{formatDate(transaction.createDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Valor:</Text>
          <Text style={styles.valueBold}>{formatCurrency(transaction.amount)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: statusColor }]}>{paymentStatus}</Text>
        </View>
      </View>

      {/* Seção DE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DE</Text>
        <Text style={styles.personName}>Banco Rose</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Banco:</Text>
          <Text style={styles.value}>CELCOIN INSTITUICAO DE PAGAMENTO S.A.</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Conta:</Text>
          <Text style={styles.value}>{paymentDetails?.body?.account || transaction.account || '-'}</Text>
        </View>
      </View>

      {/* Seção PARA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PARA</Text>
        <Text style={styles.personName}>Beneficiário do Boleto</Text>
        {paymentDetails?.body?.barCodeInfo && (
          <View style={styles.detailsGroup}>
            <Text style={styles.label}>Código de Barras:</Text>
            <Text style={styles.valueMonospace}>{formatBarcode(paymentDetails.body.barCodeInfo.digitable)}</Text>
          </View>
        )}
      </View>

      {/* Seção DETALHES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALHES</Text>
        <View style={styles.detailsGroup}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.valueMonospace}>{transaction.id}</Text>
        </View>
        
        {paymentDetails?.body?.transactionIdAuthorize && (
          <View style={styles.detailsGroup}>
            <Text style={styles.label}>ID de Autorização:</Text>
            <Text style={styles.valueMonospace}>{paymentDetails.body.transactionIdAuthorize}</Text>
          </View>
        )}
        
        {paymentDetails?.body?.clientRequestId && (
          <View style={styles.detailsGroup}>
            <Text style={styles.label}>ID da Requisição:</Text>
            <Text style={styles.valueMonospace}>{paymentDetails.body.clientRequestId}</Text>
          </View>
        )}
        
        {/* Mensagem de Erro (se houver) */}
        {paymentDetails?.body?.error && (
          <>
            <View style={styles.detailsGroup}>
              <Text style={styles.label}>Código de Erro:</Text>
              <Text style={styles.valueError}>{paymentDetails.body.error.errorCode || '-'}</Text>
            </View>
            <View style={styles.detailsGroup}>
              <Text style={styles.label}>Mensagem de Erro:</Text>
              <Text style={styles.valueError}>{paymentDetails.body.error.message || '-'}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  receiptContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    height: 50,
    width: 160,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  valueBold: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  valueHighlight: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  valueMonospace: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'monospace',
    marginTop: 4,
    lineHeight: 16,
  },
  valueError: {
    fontSize: 12,
    color: '#B00020',
    marginTop: 4,
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    color: '#B00020',
    textAlign: 'center',
  }
});

export default BillPaymentReceipt;
