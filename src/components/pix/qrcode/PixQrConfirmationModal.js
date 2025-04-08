import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PixQrConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  emvData, 
  dictData, 
  amount, 
  setAmount, 
  isLoading 
}) => {
  const [localAmount, setLocalAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (visible) {
      // Se o valor já estiver definido no EMV, usar esse valor
      if (emvData?.transactionAmount) {
        setLocalAmount(emvData.transactionAmount.toString());
        formatCurrency(emvData.transactionAmount.toString());
      } else if (amount) {
        setLocalAmount(amount);
        formatCurrency(amount);
      } else {
        setLocalAmount('');
        setFormattedAmount('');
      }
      setAmountError('');
    }
  }, [visible, emvData, amount]);

  const formatCurrency = (value) => {
    // Remove qualquer caractere não numérico
    const numericValue = value.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para obter o valor em reais
    const floatValue = parseFloat(numericValue) / 100;
    
    // Formata como moeda brasileira
    const formatted = floatValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    
    setFormattedAmount(formatted);
    
    // Retorna o valor numérico para uso no estado
    return numericValue;
  };

  const handleAmountChange = (text) => {
    const numericValue = formatCurrency(text);
    setLocalAmount(numericValue);
    
    // Atualiza o estado do componente pai
    if (setAmount) {
      setAmount(numericValue ? (parseFloat(numericValue) / 100).toString() : '');
    }
    
    // Validação do valor
    if (!numericValue || parseFloat(numericValue) === 0) {
      setAmountError('Por favor, informe um valor válido');
    } else {
      setAmountError('');
    }
  };

  const isValidToConfirm = () => {
    // Se o valor já está definido no EMV, sempre é válido
    if (emvData?.transactionAmount) return true;
    
    // Se não, verifica se foi informado um valor válido
    return localAmount && parseFloat(localAmount) > 0 && !amountError;
  };

  // Formata o valor para exibição
  const formatValue = (value) => {
    if (!value) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  if (!visible || !dictData) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirmar Pagamento</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.paymentDetails}>
              <Text style={styles.detailsTitle}>Detalhes do Pagamento</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Destinatário:</Text>
                <Text style={styles.detailValue}>{dictData.name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Instituição:</Text>
                <Text style={styles.detailValue}>{dictData.psp_name || dictData.participant || 'Não informado'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Chave PIX:</Text>
                <Text style={styles.detailValue}>{emvData.merchantAccountInformation?.key || 'Não informado'}</Text>
              </View>
              
              {emvData.additionalDataField?.referenceLabel && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Descrição:</Text>
                  <Text style={styles.detailValue}>{emvData.additionalDataField.referenceLabel}</Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Valor:</Text>
                {emvData.transactionAmount ? (
                  <Text style={[styles.detailValue, styles.amountValue]}>
                    {formatValue(emvData.transactionAmount)}
                  </Text>
                ) : (
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>R$</Text>
                    <TextInput
                      mode="outlined"
                      value={formattedAmount.replace('R$', '').trim()}
                      onChangeText={handleAmountChange}
                      placeholder="0,00"
                      keyboardType="numeric"
                      style={styles.amountInput}
                      outlineColor="#ddd"
                      activeOutlineColor="#E91E63"
                      error={!!amountError}
                    />
                  </View>
                )}
              </View>
              
              {amountError && (
                <Text style={styles.errorText}>{amountError}</Text>
              )}
            </View>
            
            <View style={styles.warningContainer}>
              <MaterialCommunityIcons name="information" size={24} color="#FF9800" />
              <Text style={styles.warningText}>
                Confira todos os dados antes de confirmar o pagamento. Esta operação não poderá ser desfeita.
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              mode="contained"
              onPress={onConfirm}
              style={styles.confirmButton}
              labelStyle={styles.confirmButtonLabel}
              loading={isLoading}
              disabled={isLoading || !isValidToConfirm()}
              uppercase={false}
            >
              Confirmar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: '70%',
  },
  paymentDetails: {
    padding: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  currencySymbol: {
    fontSize: 16,
    marginRight: 8,
    color: '#333',
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#FFF',
    height: 40,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    marginRight: 12,
    borderColor: '#E91E63',
    borderWidth: 1,
    borderRadius: 4,
  },
  cancelButtonLabel: {
    color: '#E91E63',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    borderRadius: 4,
  },
  confirmButtonLabel: {
    color: '#FFF',
  },
});

export default PixQrConfirmationModal;
