import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import useCharges from '../hooks/useCharges';
import ChargePDFDialog from '../components/charges/ChargePDFDialog';
import { supabase } from '../config/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <ActivityIndicator size={24} color="#E91E63" />
        ) : (
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#E91E63" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard2')}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cobranças</Text>
          <Text style={styles.subtitle}>Gerencie suas cobranças</Text>
        </View>
      </View>

      {/* New Charge Button */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CreateChargePersonalData')}
        style={styles.newChargeButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        GERAR NOVA COBRANÇA
      </Button>

      {/* Search Input */}
      <TextInput
        mode="outlined"
        placeholder="Digite o CPF/CNPJ"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        outlineStyle={styles.inputOutline}
      />

      {/* Charges List */}
      <ScrollView style={styles.chargesList}>
        {charges?.map(renderChargeItem)}
      </ScrollView>

      {/* PDF Dialog */}
      <ChargePDFDialog
        visible={showPDF}
        onDismiss={handleClosePDF}
        pdfUrl={pdfUrl}
        transactionId={currentTransactionId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
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
  newChargeButton: {
    backgroundColor: '#E91E63',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFF',
  },
  searchInput: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  inputOutline: {
    borderRadius: 8,
    borderColor: '#E0E0E0',
  },
  chargesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chargeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    fontWeight: '500',
  },
  viewButton: {
    padding: 8,
    marginLeft: 16,
  },
});

export default ChargesScreen;
