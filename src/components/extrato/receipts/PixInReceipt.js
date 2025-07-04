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

const PixInReceipt = ({ transaction, onTransferDetailsLoaded }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferDetails, setTransferDetails] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Hook para busca de bancos
  const { getBankNameByISPB, loading: banksLoading } = useBankSearch();

  useEffect(() => {
    const fetchTransferDetails = async () => {
      // Evitar múltiplas chamadas
      if (hasLoaded) return;
      
      try {
        setLoading(true);
        setError(null);

        const { data, error: apiError } = await supabase.functions.invoke(
          'pix-receivement-status',
          {
            body: { id: transaction.id }
          }
        );

        if (apiError) throw apiError;

        if (data.status === 'ERROR') {
          throw new Error(data.error?.message || 'Erro ao consultar detalhes do PIX');
        }

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
  }, [transaction.id, onTransferDetailsLoaded, hasLoaded]);

  if (loading || banksLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
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
    <View style={styles.receiptContainer} id="pix-in-receipt">
      {/* Header limpo com logo + título */}
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
        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.valueHighlight}>PIX RECEBIDO</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.valueMedium}>
              {formatDate(transferDetails?.requestBody?.createTimestamp || transaction.createDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.valueBold}>{formatCurrency(transaction.amount)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.valueHighlight}>CONFIRMADO</Text>
          </View>
        </View>
      </View>

      {/* Seção DE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DE</Text>
        <Text style={styles.personName}>
          {transferDetails?.requestBody?.debitParty?.name || 'Remetente'}
        </Text>
        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Banco:</Text>
            <Text style={styles.valueMedium}>
              {getBankNameByISPB(transferDetails?.requestBody?.debitParty?.ispb) || 
               transferDetails?.requestBody?.debitParty?.ispb || 
               'Banco do Remetente'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.valueMedium}>
              {transferDetails?.requestBody?.debitParty?.taxId ? 
                `***${transferDetails.requestBody.debitParty.taxId.substring(3, transferDetails.requestBody.debitParty.taxId.length-2)}**` : 
                '-'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Agência/Conta:</Text>
            <Text style={styles.valueMedium}>
              {transferDetails?.requestBody?.debitParty?.branch || '-'}/
              {transferDetails?.requestBody?.debitParty?.account || '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Seção PARA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PARA</Text>
        <Text style={styles.personName}>
          {transferDetails?.requestBody?.creditParty?.name || 'Você'}
        </Text>
        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Banco:</Text>
            <Text style={styles.valueMedium}>Banco Rose</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.valueMedium}>
              {transferDetails?.requestBody?.creditParty?.taxId ? 
                `***${transferDetails.requestBody.creditParty.taxId.substring(3, transferDetails.requestBody.creditParty.taxId.length-2)}**` : 
                '-'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Chave PIX:</Text>
            <Text style={styles.valueMedium}>
              {transferDetails?.requestBody?.creditParty?.key || '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Seção DETALHES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALHES</Text>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.valueMonospace}>{transaction.id}</Text>
        </View>
        
        {transferDetails?.requestBody?.endToEndId && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>End to End ID:</Text>
            <Text style={styles.valueMonospace}>{transferDetails.requestBody.endToEndId}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  receiptContainer: {
    backgroundColor: '#fff',
    padding: 20, // Padronizado para 20
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
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    height: 50,
    width: 160,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  infoGroup: {
    marginTop: 4,
    marginBottom: 8,
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
  valueMedium: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  valueBold: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  valueHighlight: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  valueMonospace: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'left',
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

export default PixInReceipt;
