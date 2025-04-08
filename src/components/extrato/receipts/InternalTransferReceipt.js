import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../config/supabase';

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

const InternalTransferReceipt = ({ transaction, onTransferDetailsLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferDetails, setTransferDetails] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const fetchTransferDetails = async () => {
      // Evitar múltiplas chamadas
      if (hasLoaded) return;
      
      try {
        setLoading(true);
        setError(null);

        const { data, error: apiError } = await supabase.functions.invoke(
          'internal-transfer-status',
          {
            body: { id: transaction.id }
          }
        );

        if (apiError) throw apiError;

        if (data.status === 'ERROR') {
          throw new Error(data.error?.message || 'Erro ao consultar detalhes da transferência');
        }

        console.log('Internal transfer details:', data);
        setTransferDetails(data);
        
        // Notifica o componente pai sobre os detalhes carregados
        if (onTransferDetailsLoaded) {
          onTransferDetailsLoaded(data);
        }
        
        // Marcar como carregado para evitar novas chamadas
        setHasLoaded(true);
      } catch (err) {
        console.error('Erro ao buscar detalhes da transferência interna:', err);
        setError(err.message || 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    fetchTransferDetails();
  }, [transaction.id, onTransferDetailsLoaded, hasLoaded]);

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

  // Determinar se é uma transferência enviada ou recebida
  const isOutgoing = transaction.balanceType === 'DEBIT' || 
                     transaction.movementType === 'INTERNALTRANSFEROUT';
  
  const title = isOutgoing ? 'Comprovante de Transferência Enviada' : 'Comprovante de Transferência Recebida';

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{formatDate(transaction.createDate)}</Text>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>CONFIRMADO</Text>
      </View>

      {/* Valor */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Valor</Text>
        <Text style={[
          styles.amountValue, 
          isOutgoing ? styles.amountNegative : styles.amountPositive
        ]}>
          {isOutgoing ? '-' : ''}{formatCurrency(transaction.amount)}
        </Text>
      </View>

      {isOutgoing ? (
        <>
          {/* Dados do Remetente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Remetente</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>{transferDetails?.body?.debitParty?.name || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>CPF/CNPJ</Text>
              <Text style={styles.value}>{transferDetails?.body?.debitParty?.taxId || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Agência/Conta</Text>
              <Text style={styles.value}>
                {transferDetails?.body?.debitParty?.branch || '-'}/
                {transferDetails?.body?.debitParty?.account || '-'}
              </Text>
            </View>
          </View>

          {/* Dados do Destinatário */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Destinatário</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>{transferDetails?.body?.creditParty?.name || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>CPF/CNPJ</Text>
              <Text style={styles.value}>{transferDetails?.body?.creditParty?.taxId || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Agência/Conta</Text>
              <Text style={styles.value}>
                {transferDetails?.body?.creditParty?.branch || '-'}/
                {transferDetails?.body?.creditParty?.account || '-'}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <>
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
              <Text style={styles.label}>Agência/Conta</Text>
              <Text style={styles.value}>
                {transferDetails?.body?.creditParty?.branch || '-'}/
                {transferDetails?.body?.creditParty?.account || '-'}
              </Text>
            </View>
          </View>
        </>
      )}

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

      {/* Descrição */}
      {(transferDetails?.body?.description || transaction.description) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mensagem</Text>
            <Text style={styles.value}>
              {transferDetails?.body?.description || transaction.description}
            </Text>
          </View>
        </View>
      )}

      {/* Tipo e Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Adicionais</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo de transação</Text>
          <Text style={styles.value}>
            {isOutgoing ? 'INTERNALTRANSFEROUT' : 'INTERNALTRANSFERIN'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Data de criação</Text>
          <Text style={styles.value}>{formatDate(transaction.createDate)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
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
  },
  amountPositive: {
    color: '#4CAF50',
  },
  amountNegative: {
    color: '#F44336',
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
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#B00020',
  },
});

export default InternalTransferReceipt;
