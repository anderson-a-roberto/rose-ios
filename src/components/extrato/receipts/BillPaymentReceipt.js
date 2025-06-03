import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../config/supabase';
import ReceiptBase from '../../receipt/ReceiptBase';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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

const BillPaymentReceipt = ({ transaction, onPaymentDetailsLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
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

        console.log('Boleto payment details:', data);
        setPaymentDetails(data);
        
        // Notifica o componente pai sobre os detalhes carregados
        if (onPaymentDetailsLoaded) {
          onPaymentDetailsLoaded(data);
        }
        
        // Marcar como carregado para evitar novas chamadas
        setHasLoaded(true);
      } catch (err) {
        console.error('Erro ao buscar detalhes do pagamento:', err);
        setError(err.message || 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [transaction.id, onPaymentDetailsLoaded, hasLoaded]);

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
    <ReceiptBase
      transactionId={transaction.id}
      timestamp={transaction.createDate}
      operationType="Pagamento de Boleto"
    >
      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={[styles.statusValue, { color: statusColor }]}>{paymentStatus}</Text>
      </View>

      {/* Valor */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Valor</Text>
        <Text style={styles.amountValue}>{formatCurrency(transaction.amount)}</Text>
      </View>

      {/* Dados do Boleto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Boleto</Text>
        
        {paymentDetails?.body?.barCodeInfo?.digitable && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Código de Barras</Text>
            <Text style={styles.value}>{formatBarcode(paymentDetails.body.barCodeInfo.digitable)}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Conta</Text>
          <Text style={styles.value}>{paymentDetails?.body?.account || '-'}</Text>
        </View>
      </View>

      {/* Identificação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identificação</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>ID da Transação</Text>
          <Text style={styles.value}>{transaction.id}</Text>
        </View>
        
        {paymentDetails?.body?.transactionIdAuthorize && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID de Autorização</Text>
            <Text style={styles.value}>{paymentDetails.body.transactionIdAuthorize}</Text>
          </View>
        )}
        
        {paymentDetails?.body?.clientRequestId && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID da Requisição</Text>
            <Text style={styles.value}>{paymentDetails.body.clientRequestId}</Text>
          </View>
        )}
      </View>

      {/* Mensagem de Erro (se houver) */}
      {paymentDetails?.body?.error && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Erro</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Código</Text>
            <Text style={styles.value}>{paymentDetails.body.error.errorCode || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mensagem</Text>
            <Text style={styles.value}>{paymentDetails.body.error.message || '-'}</Text>
          </View>
        </View>
      )}

      {/* Tipo e Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Adicionais</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo de transação</Text>
          <Text style={styles.value}>BILLPAYMENT</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Data de criação</Text>
          <Text style={styles.value}>{formatDate(transaction.createDate)}</Text>
        </View>
      </View>
    </ReceiptBase>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  value: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
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
