import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PixConfirmationModal = ({ 
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
            <View style={styles.recipientSection}>
              <Text style={styles.sectionTitle}>Dados do Recebedor</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nome:</Text>
                <Text style={styles.infoValue}>{dictData.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CPF/CNPJ:</Text>
                <Text style={styles.infoValue}>
                  {dictData.documentnumber?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Instituição:</Text>
                <Text style={styles.infoValue}>{dictData.participantname || dictData.participant}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.valueSection}>
              <Text style={styles.sectionTitle}>Valor da Transferência</Text>
              
              {emvData?.transactionAmount ? (
                // Se o valor já está definido no EMV, apenas exibir
                <View style={styles.fixedAmountContainer}>
                  <Text style={styles.fixedAmountLabel}>Valor:</Text>
                  <Text style={styles.fixedAmountValue}>
                    {formatValue(emvData.transactionAmount)}
                  </Text>
                </View>
              ) : (
                // Se não, permitir que o usuário informe o valor
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Informe o valor:</Text>
                  <TextInput
                    mode="outlined"
                    value={formattedAmount}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    style={styles.input}
                    outlineColor="#ddd"
                    activeOutlineColor="#E91E63"
                    placeholder="R$ 0,00"
                    error={!!amountError}
                    theme={{
                      colors: {
                        text: '#000000',
                        placeholder: '#666666',
                        primary: '#E91E63',
                      }
                    }}
                  />
                  {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
                </View>
              )}
            </View>
            
            {emvData?.description && (
              <>
                <View style={styles.divider} />
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>Descrição</Text>
                  <Text style={styles.descriptionText}>{emvData.description}</Text>
                </View>
              </>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.cancelButton}
              textColor="#E91E63"
              buttonColor="#FFF"
              contentStyle={styles.buttonContent}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={onConfirm}
              style={styles.confirmButton}
              loading={isLoading}
              disabled={isLoading || !isValidToConfirm()}
              buttonColor="#E91E63"
              textColor="#FFF"
              contentStyle={styles.buttonContent}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '70%',
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
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  recipientSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: '30%',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  valueSection: {
    marginBottom: 16,
  },
  fixedAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fixedAmountLabel: {
    fontSize: 14,
    color: '#666',
    width: '30%',
  },
  fixedAmountValue: {
    fontSize: 18,
    color: '#E91E63',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#000',
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
  confirmButton: {
    flex: 2,
    borderRadius: 4,
  },
  buttonContent: {
    height: 48,
    paddingVertical: 8,
  },
});

export default PixConfirmationModal;
