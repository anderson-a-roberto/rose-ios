import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
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
  
  return (
    <View style={styles.container}>
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
            <Text style={styles.valueHighlight}>
              {isOutgoing ? 'TRANSFERÊNCIA ENVIADA' : 'TRANSFERÊNCIA RECEBIDA'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.valueMedium}>{formatDate(transaction.createDate)}</Text>
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

      {isOutgoing ? (
        <>
          {/* Seção DE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DE</Text>
            <Text style={styles.personName}>Banco Rose</Text>
            <View style={styles.infoGroup}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Banco:</Text>
                <Text style={styles.valueMedium}>CELCOIN INSTITUICAO DE PAGAMENTO S.A.</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Conta:</Text>
                <Text style={styles.valueMedium}>
                  {transferDetails?.body?.debitParty?.account || '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* Seção PARA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PARA</Text>
            <Text style={styles.personName}>
              {transferDetails?.body?.creditParty?.name || 'Beneficiário'}
            </Text>
            <View style={styles.infoGroup}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Banco:</Text>
                <Text style={styles.valueMedium}>CELCOIN INSTITUICAO DE PAGAMENTO S.A.</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Documento:</Text>
                <Text style={styles.valueMedium}>
                  {transferDetails?.body?.creditParty?.taxId ? 
                    `***${transferDetails.body.creditParty.taxId.substring(3, transferDetails.body.creditParty.taxId.length-2)}**` : 
                    '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Conta:</Text>
                <Text style={styles.valueMedium}>
                  {transferDetails?.body?.creditParty?.account || '-'}
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* Seção DE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DE</Text>
            <Text style={styles.personName}>
              {transferDetails?.body?.debitParty?.name || 'Remetente'}
            </Text>
            <View style={styles.infoGroup}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Banco:</Text>
                <Text style={styles.valueMedium}>CELCOIN INSTITUICAO DE PAGAMENTO S.A.</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Documento:</Text>
                <Text style={styles.valueMedium}>
                  {transferDetails?.body?.debitParty?.taxId ? 
                    `***${transferDetails.body.debitParty.taxId.substring(3, transferDetails.body.debitParty.taxId.length-2)}**` : 
                    '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Conta:</Text>
                <Text style={styles.valueMedium}>
                  {transferDetails?.body?.debitParty?.account || '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* Seção PARA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PARA</Text>
            <Text style={styles.personName}>Banco Rose</Text>
            <View style={styles.infoGroup}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Banco:</Text>
                <Text style={styles.valueMedium}>CELCOIN INSTITUICAO DE PAGAMENTO S.A.</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Conta:</Text>
                <Text style={styles.valueMedium}>
                  {transferDetails?.body?.creditParty?.account || '-'}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Seção DETALHES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALHES</Text>
        <View style={styles.infoGroup}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.valueMonospace}>{transaction.id}</Text>
        </View>
        {transferDetails?.body?.endToEndId && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>End to End ID:</Text>
            <Text style={styles.valueMonospace}>{transferDetails.body.endToEndId}</Text>
          </View>
        )}
        {(transferDetails?.body?.description || transaction.description) && (
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.valueMedium}>
              {transferDetails?.body?.description || transaction.description}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20, // Padronizado para 20
    backgroundColor: '#FFFFFF',
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
