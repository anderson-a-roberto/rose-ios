import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { supabase } from '../../config/supabase';
import useCharges from '../../hooks/useCharges';
import ChargeItem from './ChargeItem';
import ChargePDFDialog from './ChargePDFDialog';

export default function ManageChargesForm({ onBack }) {
  // TODO: Pegar userTaxId do contexto de autenticação
  const userTaxId = "17927237098"; // Usando o mesmo CPF do beneficiário por enquanto
  const [currentPage, setCurrentPage] = useState(1);
  const { charges, loading, error, totalCount, pageCount, refetch } = useCharges(userTaxId, currentPage);
  
  const [showPDF, setShowPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  const handleViewPDF = async (transactionId) => {
    try {
      setLoadingPDF(true);
      setCurrentTransactionId(transactionId);
      
      const { data, error } = await supabase.functions.invoke('get-charge-pdf', {
        body: { transaction_id: transactionId }
      });

      if (error) throw error;
      if (!data?.pdf_url) throw new Error('URL do PDF não encontrada');

      setPdfUrl(data.pdf_url);
      setShowPDF(true);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setSnackbar({ 
        visible: true, 
        message: 'Erro ao gerar PDF: ' + (error.message || 'Erro desconhecido'),
        type: 'error'
      });
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleClosePDF = () => {
    setShowPDF(false);
    setPdfUrl('');
    setCurrentTransactionId(null);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Erro ao carregar cobranças: {error}
        </Text>
        <Button onPress={refetch}>Tentar novamente</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={styles.backButton}
        >
          Voltar
        </Button>
      </View>

      <Text style={styles.title}>Minhas Cobranças</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF1493" />
          <Text style={styles.loadingText}>Carregando cobranças...</Text>
        </View>
      ) : charges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma cobrança encontrada</Text>
        </View>
      ) : (
        <>
          <ScrollView>
            {charges.map((charge) => (
              <ChargeItem
                key={charge.id}
                charge={charge}
                onViewPDF={handleViewPDF}
                loading={loadingPDF && currentTransactionId === charge.transaction_id}
              />
            ))}
          </ScrollView>

          <View style={styles.pagination}>
            <Button
              mode="text"
              onPress={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Text>
              Página {currentPage} de {pageCount}
            </Text>
            <Button
              mode="text"
              onPress={handleNextPage}
              disabled={currentPage === pageCount}
            >
              Próxima
            </Button>
          </View>
        </>
      )}

      <ChargePDFDialog 
        visible={showPDF} 
        pdfUrl={pdfUrl} 
        onDismiss={handleClosePDF} 
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        style={{ backgroundColor: snackbar.type === 'error' ? '#FF0000' : '#00FF00' }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF1493',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
