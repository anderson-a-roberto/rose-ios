import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';
import CustomAlert from '../common/CustomAlert';

const ChargeDetailsDialog = ({ 
  visible, 
  onDismiss, 
  chargeDetails, 
  onCancelCharge, 
  loading: externalLoading,
  onViewPDF // Nova prop para visualizar o PDF
}) => {
  const [isLoading, setLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const isLoadingData = isLoading || externalLoading;
  const isLoadingCancel = isCanceling || externalLoading;
  
  // Resetar o estado de cancelamento quando o componente for desmontado ou quando o modal for fechado
  useEffect(() => {
    if (!visible && isCanceling) {
      setIsCanceling(false);
    }
  }, [visible, isCanceling]);

  // Resetar o estado de cancelamento quando receber novos detalhes da cobrança
  useEffect(() => {
    if (chargeDetails && chargeDetails._cancelLoading === false) {
      setIsCanceling(false);
    }
  }, [chargeDetails]);
  
  if (!chargeDetails) {
    return (
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Carregando detalhes...</Text>
          </View>
        </Modal>
      </Portal>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Não disponível';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'Não disponível';
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
      'EXPIRED': '#F44336', // Vermelho
      'PENDING': '#FFC107', // Amarelo
      'PROCESSING': '#2196F3' // Azul
    };
    
    return statusColorMap[status] || '#757575';
  };

  const handleViewPDF = async () => {
    try {
      setLoading(true);
      
      // Chamamos a Edge Function para obter a URL do PDF
      const { data, error } = await supabase.functions.invoke('get-charge-pdf', {
        body: { transaction_id: chargeDetails.body.transactionId }
      });

      if (error) throw error;
      if (!data?.pdf_url) throw new Error('URL do PDF não encontrada');

      // Chamamos a função de callback para exibir o PDF
      if (onViewPDF) {
        onViewPDF(data.pdf_url, chargeDetails.body.transactionId);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para obter a URL do PDF
  const getPdfUrl = async () => {
    // Implementação futura para gerar URL do PDF a partir dos dados do boleto/pix
    // Por enquanto, retornamos null para usar a edge function
    return null;
  };

  const canBeCancelled = () => {
    const status = chargeDetails.body.status;
    return ['ACTIVE', 'PENDING', 'PROCESSING'].includes(status);
  };

  // Função para confirmar o cancelamento
  const handleCancelRequest = () => {
    setShowCancelConfirm(true);
  };

  // Função para executar o cancelamento após confirmação
  const handleConfirmCancel = () => {
    setIsCanceling(true);
    onCancelCharge();
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={styles.container}
        dismissable={!isLoadingData}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Detalhes da Cobrança</Text>
          <TouchableOpacity onPress={onDismiss} disabled={isLoadingData}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(chargeDetails.body.status) }]}>
              {formatStatus(chargeDetails.body.status)}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações da Cobrança</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valor:</Text>
              <Text style={styles.infoValue}>
                {chargeDetails.body.amount ? formatCurrency(chargeDetails.body.amount) : 'Não disponível'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data de Emissão:</Text>
              <Text style={styles.infoValue}>
                {formatDate(chargeDetails.body.creationDate || chargeDetails.body.createdAt)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data de Vencimento:</Text>
              <Text style={styles.infoValue}>
                {formatDate(chargeDetails.body.expirationDate || chargeDetails.body.duedate)}
              </Text>
            </View>
            
            {chargeDetails.body.paymentDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data de Pagamento:</Text>
                <Text style={styles.infoValue}>{formatDate(chargeDetails.body.paymentDate)}</Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID da Transação:</Text>
              <Text style={styles.infoValue}>{chargeDetails.body.transactionId}</Text>
            </View>

            {chargeDetails.body.externalId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID Externo:</Text>
                <Text style={styles.infoValue}>{chargeDetails.body.externalId}</Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Pagador</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome:</Text>
              <Text style={styles.infoValue}>
                {chargeDetails.body.debtor?.name || 'Não disponível'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CPF/CNPJ:</Text>
              <Text style={styles.infoValue}>
                {chargeDetails.body.debtor?.document || chargeDetails.body.debtor?.taxId || 'Não disponível'}
              </Text>
            </View>

            {chargeDetails.body.debtor?.postalCode && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Endereço:</Text>
                  <Text style={styles.infoValue}>
                    {`${chargeDetails.body.debtor.publicArea || ''}, ${chargeDetails.body.debtor.number || ''}`}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bairro:</Text>
                  <Text style={styles.infoValue}>
                    {chargeDetails.body.debtor.neighborhood || 'Não disponível'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cidade/UF:</Text>
                  <Text style={styles.infoValue}>
                    {`${chargeDetails.body.debtor.city || ''}, ${chargeDetails.body.debtor.state || ''}`}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CEP:</Text>
                  <Text style={styles.infoValue}>
                    {chargeDetails.body.debtor.postalCode}
                  </Text>
                </View>
              </>
            )}
          </View>

          {chargeDetails.body.receiver && (
            <>
              <Divider style={styles.divider} />
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados do Recebedor</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nome:</Text>
                  <Text style={styles.infoValue}>
                    {chargeDetails.body.receiver.name || 'Não disponível'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CPF/CNPJ:</Text>
                  <Text style={styles.infoValue}>
                    {chargeDetails.body.receiver.document || 'Não disponível'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Conta:</Text>
                  <Text style={styles.infoValue}>
                    {chargeDetails.body.receiver.account || 'Não disponível'}
                  </Text>
                </View>
              </View>
            </>
          )}
          
          {chargeDetails.body.instructions && (
            <>
              <Divider style={styles.divider} />
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instruções</Text>
                
                {chargeDetails.body.instructions.fine && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Multa:</Text>
                    <Text style={styles.infoValue}>{`${chargeDetails.body.instructions.fine}%`}</Text>
                  </View>
                )}
                
                {chargeDetails.body.instructions.interest && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Juros:</Text>
                    <Text style={styles.infoValue}>{`${chargeDetails.body.instructions.interest}%`}</Text>
                  </View>
                )}
              </View>
            </>
          )}
          
          {chargeDetails.body.additionalInfo && (
            <>
              <Divider style={styles.divider} />
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações Adicionais</Text>
                <Text style={styles.infoText}>{chargeDetails.body.additionalInfo}</Text>
              </View>
            </>
          )}
        </ScrollView>
        
        <View style={styles.footer}>
          <Button 
            mode="outlined" 
            onPress={handleViewPDF}
            loading={isLoadingData}
            disabled={isLoadingData}
            style={styles.button}
            textColor="#E91E63"
          >
            Ver Boleto
          </Button>
          
          {canBeCancelled() && (
            <Button 
              mode="contained" 
              onPress={handleCancelRequest}
              loading={isLoadingCancel}
              disabled={isLoadingCancel}
              style={styles.button}
              buttonColor="#E91E63"
              textColor="#FFFFFF"
            >
              Cancelar Cobrança
            </Button>
          )}
        </View>
        
        <CustomAlert
          visible={showCancelConfirm}
          title="Cancelar Cobrança"
          message="Tem certeza que deseja cancelar esta cobrança?"
          confirmText="SIM"
          cancelText="NÃO"
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowCancelConfirm(false)}
          onDismiss={() => setShowCancelConfirm(false)}
          type="warning"
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    padding: 16,
    maxHeight: '70%',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ChargeDetailsDialog;
