import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import useCharges from '../hooks/useCharges';
import ChargePDFDialog from '../components/charges/ChargePDFDialog';
import { supabase } from '../config/supabase';

const ChargesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const userTaxId = "17927237098"; // TODO: Pegar do contexto de autenticação
  const { charges, loading, error, refetch, totalCount, pageCount } = useCharges(userTaxId, currentPage);
  
  const [showPDF, setShowPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loadingChargeId, setLoadingChargeId] = useState(null);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);

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

  const handleViewPDF = async (charge) => {
    try {
      setLoadingChargeId(charge.id);
      setCurrentTransactionId(charge.transaction_id);
      
      const { data, error } = await supabase.functions.invoke('get-charge-pdf', {
        body: { transaction_id: charge.transaction_id }
      });

      if (error) throw error;
      if (!data?.pdf_url) throw new Error('URL do PDF não encontrada');

      setPdfUrl(data.pdf_url);
      setShowPDF(true);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setLoadingChargeId(null);
    }
  };

  const handleClosePDF = () => {
    setShowPDF(false);
    setPdfUrl('');
    setCurrentTransactionId(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderChargeItem = (charge) => (
    <View key={charge.id} style={styles.chargeItem}>
      <View style={styles.chargeInfo}>
        <Text style={styles.chargeName}>{charge.debtor_name}</Text>
        <Text style={styles.chargeDocument}>
          CPF / CNPJ: {charge.debtor_document}
        </Text>
        <Text style={styles.chargeValue}>
          Valor: {formatCurrency(charge.amount)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => handleViewPDF(charge)}
        disabled={loadingChargeId === charge.id}
      >
        {loadingChargeId === charge.id ? (
          <ActivityIndicator size={24} color="#000" />
        ) : (
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#000" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard2')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* New Charge Button */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CreateChargePersonalData')}
        style={styles.newChargeButton}
        labelStyle={styles.newChargeButtonLabel}
      >
        GERAR NOVA COBRANÇA
      </Button>

      <Text style={styles.title}>Cobranças</Text>

      {/* Search Input */}
      <TextInput
        mode="outlined"
        placeholder="Digite o CPF/CNPJ"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        outlineColor="#E0E0E0"
        activeOutlineColor="#000"
      />

      {/* Charges List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar cobranças</Text>
          <Button onPress={refetch}>Tentar novamente</Button>
        </View>
      ) : (
        <>
          <ScrollView style={styles.chargesList}>
            {charges.map(renderChargeItem)}
          </ScrollView>

          {/* Pagination */}
          {pageCount > 1 && (
            <View style={styles.pagination}>
              <IconButton
                icon="chevron-left"
                size={24}
                onPress={handlePrevPage}
                disabled={currentPage === 1}
                iconColor={currentPage === 1 ? '#999' : '#000'}
              />
              <Text style={styles.pageInfo}>
                Página {currentPage} de {pageCount}
              </Text>
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={handleNextPage}
                disabled={currentPage === pageCount}
                iconColor={currentPage === pageCount ? '#999' : '#000'}
              />
            </View>
          )}
        </>
      )}

      {/* PDF Dialog */}
      <ChargePDFDialog
        visible={showPDF}
        pdfUrl={pdfUrl}
        onDismiss={handleClosePDF}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  newChargeButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 25,
  },
  newChargeButtonLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    color: '#000',
  },
  searchInput: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  chargesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  chargeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chargeInfo: {
    flex: 1,
  },
  chargeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  chargeDocument: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chargeValue: {
    fontSize: 14,
    color: '#000',
  },
  viewButton: {
    padding: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pageInfo: {
    marginHorizontal: 16,
    color: '#000',
  },
});

export default ChargesScreen;
