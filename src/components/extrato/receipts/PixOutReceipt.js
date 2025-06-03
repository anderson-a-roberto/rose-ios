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

const PixOutReceipt = ({ transaction, onTransferDetailsLoaded, preloadedDetails }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferDetails, setTransferDetails] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Se temos detalhes pré-carregados, usamos eles diretamente
    if (preloadedDetails) {
      setTransferDetails(preloadedDetails);
      setLoading(false);
      setHasLoaded(true);
      if (onTransferDetailsLoaded) {
        onTransferDetailsLoaded(preloadedDetails);
      }
      return;
    }
    
    const fetchTransferDetails = async () => {
      // Evitar múltiplas chamadas
      if (hasLoaded) return;
      
      try {
        setLoading(true);
        setError(null);

        const { data, error: apiError } = await supabase.functions.invoke(
          'pix-payment-status',
          {
            body: { id: transaction.id }
          }
        );

        if (apiError) throw apiError;

        if (data.status === 'ERROR') {
          throw new Error(data.error?.message || 'Erro ao consultar detalhes do PIX');
        }

        console.log('PIX OUT details:', data);
        setTransferDetails(data);
        // Notifica o componente pai sobre os detalhes carregados
        if (onTransferDetailsLoaded) {
          onTransferDetailsLoaded(data);
        }
        
        // Marcar como carregado para evitar novas chamadas
        setHasLoaded(true);
      } catch (err) {
        console.error('Erro ao buscar detalhes do PIX:', err);
        setError(err.message || 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    fetchTransferDetails();
  }, [transaction.id, onTransferDetailsLoaded, hasLoaded, preloadedDetails]);

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

  return (
    <ReceiptBase
      transactionId={transaction.id}
      timestamp={transaction.createDate}
      operationType="Transferência PIX"
    >
      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>
          {transferDetails?.status === 'CONFIRMED' ? 'CONFIRMADO' : 
           transferDetails?.status === 'COMPLETED' ? 'CONCLUÍDO' : 
           transferDetails?.status === 'PROCESSING' ? 'EM PROCESSAMENTO' : 
           transferDetails?.status === 'FAILED' ? 'FALHOU' : 
           transferDetails?.status === 'PENDING' ? 'PENDENTE' : 
           transferDetails?.status === 'CANCELLED' ? 'CANCELADO' : 
           transferDetails?.status || 'CONFIRMADO'}
        </Text>
      </View>

      {/* Valor */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Valor</Text>
        <Text style={styles.amountValue}>{formatCurrency(transaction.amount)}</Text>
      </View>

      {/* Dados do Pagador */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Pagador</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{transferDetails?.body?.debitParty?.name || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>CPF/CNPJ</Text>
          <Text style={styles.value}>{transferDetails?.body?.debitParty?.taxId || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Banco</Text>
          <Text style={styles.value}>{transferDetails?.body?.debitParty?.bank || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Agência/Conta</Text>
          <Text style={styles.value}>
            {transferDetails?.body?.debitParty?.branch || '-'}/
            {transferDetails?.body?.debitParty?.account || '-'}
          </Text>
        </View>
      </View>

      {/* Dados do Beneficiário */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Beneficiário</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{transferDetails?.body?.creditParty?.name || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>CPF/CNPJ</Text>
          <Text style={styles.value}>{transferDetails?.body?.creditParty?.taxId || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Chave PIX</Text>
          <Text style={styles.value}>{transferDetails?.body?.creditParty?.key || '-'}</Text>
        </View>
      </View>

      {/* Identificação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identificação</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>ID da Transação</Text>
          <Text style={styles.value}>{transaction.id}</Text>
        </View>
        {transferDetails?.body?.endToEndId && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>End to End ID</Text>
            <Text style={styles.value}>{transferDetails.body.endToEndId}</Text>
          </View>
        )}
      </View>

      {/* Tipo e Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Adicionais</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo de transação</Text>
          <Text style={styles.value}>PIXPAYMENTOUT</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Data de criação</Text>
          <Text style={styles.value}>{formatDate(transaction.createDate)}</Text>
        </View>
        {transferDetails?.body?.remittanceInformation && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.value}>{transferDetails.body.remittanceInformation}</Text>
          </View>
        )}
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
    color: '#4CAF50',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
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

export default PixOutReceipt;
