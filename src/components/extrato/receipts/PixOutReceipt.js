import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../config/supabase';
import { format } from 'date-fns';
import useBankSearch from '../../../hooks/useBankSearch';

const formatDate = (dateString) => {
  return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm");
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
  
  // Hook para busca de bancos
  const { getBankNameByISPB, loading: banksLoading } = useBankSearch();
  
  // Determinar o tipo de operação
  const operationType = "PIX ENVIADO";

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

  if (loading || banksLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#682145" />
        <Text style={styles.loadingText}>
          {banksLoading ? 'Carregando informações dos bancos...' : 'Carregando detalhes...'}
        </Text>
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
          <Text style={styles.valueSuccess}>CONFIRMADO</Text>
        </View>
      </View>

      {/* Seção DE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DE</Text>
        <Text style={styles.personName}>{transferDetails?.body?.debitParty?.name || '-'}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Banco:</Text>
          <Text style={styles.value}>CELCOIN INSTITUICAO DE PAGAMENTO S.A.</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Documento:</Text>
          <Text style={styles.value}>{transferDetails?.body?.debitParty?.taxId ? 
            `***${transferDetails.body.debitParty.taxId.substring(3, transferDetails.body.debitParty.taxId.length-2)}**` : 
            '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Agência:</Text>
          <Text style={styles.value}>{transferDetails?.body?.debitParty?.branch || '0001'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Conta:</Text>
          <Text style={styles.value}>{transferDetails?.body?.debitParty?.account || '-'}</Text>
        </View>
      </View>

      {/* Seção PARA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PARA</Text>
        <Text style={styles.personName}>{transferDetails?.body?.creditParty?.name || '-'}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Banco:</Text>
          <Text style={styles.value}>
            {getBankNameByISPB(transferDetails?.body?.creditParty?.bank) || '-'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Documento:</Text>
          <Text style={styles.value}>{transferDetails?.body?.creditParty?.taxId ? 
            `***${transferDetails.body.creditParty.taxId.substring(3, transferDetails.body.creditParty.taxId.length-2)}**` : 
            '-'}</Text>
        </View>
        {transferDetails?.body?.creditParty?.key && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Chave Pix:</Text>
            <Text style={styles.value}>{transferDetails.body.creditParty.key}</Text>
          </View>
        )}
      </View>

      {/* Seção DETALHES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALHES</Text>
        <View style={styles.detailsGroup}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.valueMonospace}>{transferDetails?.body?.endToEndId || transaction.id}</Text>
        </View>
        
        {transferDetails?.body?.endToEndId && transferDetails.body.endToEndId !== transaction.id && (
          <View style={styles.detailsGroup}>
            <Text style={styles.label}>Código:</Text>
            <Text style={styles.valueMonospace}>{transaction.id}</Text>
          </View>
        )}
        
        {transferDetails?.body?.remittanceInformation && (
          <View style={styles.detailsGroup}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.value}>{transferDetails.body.remittanceInformation}</Text>
          </View>
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
  valueSuccess: {
    fontSize: 14,
    color: '#4CAF50',
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
