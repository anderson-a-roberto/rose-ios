import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import useCharges from '../hooks/useCharges';
import ChargePDFDialog from '../components/charges/ChargePDFDialog';
import ChargeDetailsDialog from '../components/charges/ChargeDetailsDialog';
import { supabase } from '../config/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../components/common/CustomAlert';

const ChargesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userTaxId, setUserTaxId] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showPDF, setShowPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loadingChargeId, setLoadingChargeId] = useState(null);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [chargeDetails, setChargeDetails] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { charges, loading, error, refetch, totalCount, pageCount } = useCharges(userTaxId, currentPage);
  
  // Buscar o documento do usuário ao carregar a tela
  useEffect(() => {
    const fetchUserDocument = async () => {
      try {
        setIsLoadingUser(true);
        
        // Buscar usuário logado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Buscar CPF/CNPJ do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('document_number')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        // Definir o documento do usuário
        setUserTaxId(profileData.document_number);
      } catch (error) {
        console.error('Erro ao buscar documento do usuário:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserDocument();
  }, []);

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

  const handleViewDetails = async (charge) => {
    try {
      setSelectedCharge(charge);
      setLoadingDetails(true);
      setShowDetails(true);
      
      const { data, error } = await supabase.functions.invoke('get-charge-details', {
        body: { 
          transaction_id: charge.transaction_id,
          external_id: charge.external_id
        }
      });

      if (error) {
        console.error('Erro ao buscar detalhes da cobrança:', error);
        alert('Erro ao buscar detalhes da cobrança. Tente novamente mais tarde.');
        setShowDetails(false);
        return;
      }

      setChargeDetails(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes da cobrança:', error);
      alert('Erro ao buscar detalhes da cobrança. Tente novamente mais tarde.');
      setShowDetails(false);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    // Limpa os detalhes apenas após o fechamento do modal
    setTimeout(() => {
      setChargeDetails(null);
      setSelectedCharge(null);
    }, 300);
  };

  const handleCancelCharge = async () => {
    if (!chargeDetails?.body?.transactionId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-charge', {
        method: 'DELETE',
        body: { transaction_id: chargeDetails.body.transactionId }
      });

      if (error) throw error;
      
      // Exibir mensagem de sucesso
      setSuccessMessage('Cobrança cancelada com sucesso!');
      setShowSuccessAlert(true);
      
      // Fechar o modal e atualizar a lista
      setTimeout(() => {
        handleCloseDetails();
        refetch();
      }, 1000);
    } catch (error) {
      console.error('Erro ao cancelar cobrança:', error);
      alert('Erro ao cancelar cobrança: ' + error.message);
      
      // Resetar o estado de carregamento no componente ChargeDetailsDialog
      if (chargeDetails) {
        setChargeDetails({
          ...chargeDetails,
          _cancelLoading: false
        });
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatStatus = (status) => {
    if (!status) return 'PENDENTE';
    
    const statusMap = {
      'ACTIVE': 'ATIVA',
      'PAID': 'PAGA',
      'COMPLETED': 'CONCLUÍDA',
      'CANCELLED': 'CANCELADA',
      'EXPIRED': 'EXPIRADA',
      'PENDING': 'PENDENTE',
      'PROCESSING': 'PROCESSANDO'
    };
    
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    if (!status) return '#757575'; // Cinza para status indefinido
    
    const statusColorMap = {
      'ACTIVE': '#4CAF50', // Verde
      'PAID': '#4CAF50', // Verde
      'COMPLETED': '#4CAF50', // Verde
      'CANCELLED': '#F44336', // Vermelho
      'CANCELED': '#F44336', // Vermelho (igual ao CANCELADA)
      'EXPIRED': '#F44336', // Vermelho
      'PENDING': '#FFC107', // Amarelo
      'PROCESSING': '#2196F3' // Azul
    };
    
    return statusColorMap[status] || '#757575';
  };

  const getBorderColor = (status) => {
    if (!status) return '#757575';
    
    return getStatusColor(status);
  };

  const getStatusText = (status) => {
    if (!status) return 'PENDENTE';
    
    const statusTextMap = {
      'ACTIVE': 'ATIVA',
      'PAID': 'PAGA',
      'COMPLETED': 'CONCLUÍDA',
      'CANCELLED': 'CANCELADA',
      'CANCELED': 'CANCELADA', // Texto igual ao CANCELADA
      'EXPIRED': 'EXPIRADA',
      'PENDING': 'PENDENTE',
      'PROCESSING': 'PROCESSANDO'
    };
    
    return statusTextMap[status] || status;
  };

  const renderChargeItem = (charge) => {
    const isLoading = loadingChargeId === charge.id;
    
    // Formatar valor
    const formatValue = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Formatar data
    const formatDate = (dateString) => {
      if (!dateString) return 'Não disponível';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    };

    return (
      <TouchableOpacity
        key={charge.id}
        style={styles.chargeItem}
        onPress={() => handleViewDetails(charge)}
        disabled={isLoading}
      >
        <View style={styles.chargeItemContent}>
          <View style={styles.chargeInfo}>
            <Text style={styles.chargeName}>
              {charge.debtor_name || 'Sem nome'}
            </Text>
            <Text style={styles.chargeValue}>
              {formatValue(charge.amount)}
            </Text>
          </View>
          <View style={styles.chargeDetails}>
            <Text style={styles.chargeDate}>
              Vencimento: {formatDate(charge.due_date)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(charge.status) }]}>
              <Text style={styles.statusText}>{getStatusText(charge.status)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.chargeActions}>
          {isLoading ? (
            <ActivityIndicator size={24} color="#E91E63" />
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleViewPDF(charge);
                }}
                disabled={loadingChargeId === charge.id}
              >
                <MaterialCommunityIcons name="file-document-outline" size={24} color="#E91E63" />
              </TouchableOpacity>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#BBBBBB" />
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
      
      {/* Botão de Nova Cobrança */}
      <View style={styles.newChargeContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateChargePersonalData')}
          style={styles.newChargeButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="plus-circle-outline"
        >
          NOVA COBRANÇA
        </Button>
      </View>
      
      {/* Lista de cobranças */}
      <View style={styles.listContainer}>
        {isLoadingUser || (userTaxId && loading) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>
              {isLoadingUser ? "Carregando..." : "Carregando cobranças..."}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={styles.errorText}>Erro ao carregar cobranças</Text>
            <Button 
              mode="contained" 
              onPress={refetch}
              style={styles.retryButton}
              buttonColor="#E91E63"
            >
              Tentar novamente
            </Button>
          </View>
        ) : charges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cash-multiple" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>Você não possui cobranças</Text>
            <Text style={styles.emptySubtext}>Crie uma nova cobrança usando o botão acima</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
            {charges.map(renderChargeItem)}
          </ScrollView>
        )}
      </View>
      
      {/* Paginação */}
      {!isLoadingUser && !loading && !error && charges.length > 0 && (
        <View style={styles.paginationContainer}>
          <Button 
            mode="text" 
            onPress={handlePrevPage}
            disabled={currentPage === 1}
            textColor="#E91E63"
          >
            Anterior
          </Button>
          <Text style={styles.pageInfo}>
            Página {currentPage} de {pageCount || 1}
          </Text>
          <Button 
            mode="text" 
            onPress={handleNextPage}
            disabled={currentPage >= pageCount}
            textColor="#E91E63"
          >
            Próxima
          </Button>
        </View>
      )}
      
      {/* PDF Dialog */}
      <ChargePDFDialog
        visible={showPDF}
        onDismiss={handleClosePDF}
        pdfUrl={pdfUrl}
        transactionId={currentTransactionId}
      />

      {/* Details Dialog */}
      <ChargeDetailsDialog
        visible={showDetails}
        onDismiss={handleCloseDetails}
        chargeDetails={chargeDetails}
        loading={loadingDetails}
        onCancelCharge={() => {
          handleCancelCharge();
        }}
        onViewPDF={(pdfUrl, transactionId) => {
          setPdfUrl(pdfUrl);
          setCurrentTransactionId(transactionId);
          setShowPDF(true);
        }}
      />

      {/* Alert de sucesso */}
      <CustomAlert
        visible={showSuccessAlert}
        onDismiss={() => setShowSuccessAlert(false)}
        title="Sucesso"
        message={successMessage}
        confirmText="FECHAR"
        type="success"
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
    marginTop: 16,
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
  },
  newChargeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  newChargeButton: {
    backgroundColor: '#E91E63',
    padding: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    paddingVertical: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
  chargeItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chargeItemContent: {
    flex: 1,
    flexDirection: 'column',
  },
  chargeInfo: {
    marginBottom: 8,
  },
  chargeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chargeValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chargeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chargeDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  chargeActions: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
});

export default ChargesScreen;
