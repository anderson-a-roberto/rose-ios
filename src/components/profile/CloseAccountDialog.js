import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, ActivityIndicator, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';

/**
 * Componente de diálogo para confirmação de encerramento de conta
 * 
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.visible - Controla a visibilidade do diálogo
 * @param {Function} props.onDismiss - Função chamada ao fechar o diálogo
 * @param {string} props.documentNumber - CPF/CNPJ do usuário
 * @param {string} props.accountNumber - Número da conta do usuário
 * @param {Function} props.onCloseAccount - Função chamada ao confirmar o encerramento
 * @param {boolean} props.isClosingAccount - Indica se o processo de encerramento está em andamento
 * @param {Object} props.closeAccountError - Objeto com informações de erro (errorCode e errorMessage)
 */
const CloseAccountDialog = ({
  visible,
  onDismiss,
  documentNumber,
  accountNumber,
  onCloseAccount,
  isClosingAccount = false,
  closeAccountError = {}
}) => {
  const [reason, setReason] = useState('');
  
  // Verificar se há erro de saldo, cobranças em aberto ou conta não encontrada
  const hasBalanceError = closeAccountError?.errorCode === 'CBE062';
  const hasOpenChargesError = closeAccountError?.errorCode === 'CBE514';
  const hasAccountNotFoundError = closeAccountError?.errorCode === 'CBE078';
  
  // Extrair mensagem de erro de forma segura
  const getErrorMessage = () => {
    if (!closeAccountError || !closeAccountError.errorMessage) {
      return 'Ocorreu um erro ao processar sua solicitação.';
    }
    
    if (typeof closeAccountError.errorMessage === 'string') {
      return closeAccountError.errorMessage;
    }
    
    if (typeof closeAccountError.errorMessage === 'object' && closeAccountError.errorMessage.message) {
      return typeof closeAccountError.errorMessage.message === 'string' 
        ? closeAccountError.errorMessage.message 
        : 'Ocorreu um erro ao processar sua solicitação.';
    }
    
    return 'Ocorreu um erro ao processar sua solicitação.';
  };
  
  // Limpa o motivo ao fechar o diálogo
  const handleDismiss = () => {
    setReason('');
    onDismiss();
  };
  
  // Envia o formulário
  const handleSubmit = () => {
    if (!reason.trim()) return;
    
    onCloseAccount({
      account: accountNumber,
      documentNumber,
      reason: reason.trim()
    });
  };
  
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.container}
        dismissable={!isClosingAccount}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Encerrar Conta</Text>
          <TouchableOpacity onPress={handleDismiss} disabled={isClosingAccount}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {/* Aviso principal */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningTitle}>Atenção: Ação Irreversível</Text>
            <Text style={styles.warningText}>
              Ao encerrar sua conta, todos os seus dados bancários serão desativados e você não poderá mais acessar este aplicativo com as mesmas credenciais.
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Erro de saldo */}
          {hasBalanceError && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
              <Text style={styles.errorTitle}>Saldo em Conta</Text>
              <Text style={styles.errorText}>
                Não é possível encerrar sua conta pois você ainda possui saldo disponível.
                Por favor, transfira todo o saldo antes de solicitar o encerramento.
              </Text>
            </View>
          )}
          
          {/* Erro de cobranças em aberto */}
          {hasOpenChargesError && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
              <Text style={styles.errorTitle}>Cobranças em Aberto</Text>
              <Text style={styles.errorText}>
                Não é possível encerrar sua conta pois identificamos cobranças em aberto.
                Por favor, regularize todas as pendências antes de solicitar o encerramento.
              </Text>
            </View>
          )}
          
          {/* Erro de conta não encontrada */}
          {hasAccountNotFoundError && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
              <Text style={styles.errorTitle}>Conta Não Encontrada</Text>
              <Text style={styles.errorText}>
                Não foi possível localizar sua conta no sistema. 
                Por favor, entre em contato com o suporte para verificar o status da sua conta.
              </Text>
            </View>
          )}
          
          {/* Outros erros */}
          {closeAccountError?.errorMessage && !hasBalanceError && !hasOpenChargesError && !hasAccountNotFoundError && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
              <Text style={styles.errorTitle}>Erro ao encerrar conta</Text>
              <Text style={styles.errorText}>{getErrorMessage()}</Text>
            </View>
          )}
          
          <Divider style={styles.divider} />
          
          {/* Formulário */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Código da Conta</Text>
            <TextInput
              value={accountNumber}
              style={styles.input}
              contentStyle={{ color: '#000000', fontSize: 16 }}
              disabled
            />
            
            <Text style={styles.label}>CPF/CNPJ</Text>
            <TextInput
              value={documentNumber}
              style={styles.input}
              contentStyle={{ color: '#000000', fontSize: 16 }}
              disabled
            />
            
            <Text style={styles.label}>Motivo do Encerramento</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              style={styles.input}
              contentStyle={{ color: '#000000', fontSize: 16 }}
              placeholder="Informe o motivo do encerramento"
              multiline
              numberOfLines={3}
              disabled={isClosingAccount || hasBalanceError || hasOpenChargesError || hasAccountNotFoundError}
            />
          </View>
        </ScrollView>
        
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleDismiss}
            style={styles.cancelButton}
            labelStyle={styles.buttonLabel}
            disabled={isClosingAccount}
            textColor="#666666"
          >
            CANCELAR
          </Button>
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.confirmButton}
            labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
            buttonColor="#F44336"
            loading={isClosingAccount}
            disabled={isClosingAccount || !reason.trim() || hasBalanceError || hasOpenChargesError || hasAccountNotFoundError}
          >
            CONFIRMAR ENCERRAMENTO
          </Button>
        </View>
        
        {isClosingAccount && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Processando solicitação...</Text>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
    maxHeight: '70%',
  },
  warningContainer: {
    backgroundColor: '#FFF4F4',
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#FFF4F4',
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginVertical: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    marginVertical: 16,
  },
  formContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    height: 56,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 4,
    borderColor: '#CCCCCC',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E91E63',
  },
});

export default CloseAccountDialog;
