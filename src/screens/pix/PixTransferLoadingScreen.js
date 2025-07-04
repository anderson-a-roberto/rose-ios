import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';
import { usePixTransferPolling } from '../../hooks/useTransactionPolling';

const PixTransferLoadingScreen = ({ navigation, route }) => {
  const { 
    transferData, 
    payload, 
    isCopyPaste, 
    isQrCode,
    isDynamicQrCode = false,
    isStaticQrCode = true 
  } = route.params;
  const [error, setError] = useState(null);
  const [transferResponse, setTransferResponse] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('PROCESSING');
  
  // Determinar tipo de fluxo para mensagens contextuais
  const flowType = isQrCode 
    ? (isDynamicQrCode ? 'QR Code Dinâmico' : 'QR Code Estático') 
    : (isCopyPaste ? 'Copy-Paste' : 'Transfer');
  
  const actionType = isQrCode ? 'pagamento' : (isCopyPaste ? 'pagamento' : 'transferência');
  
  const [statusMessage, setStatusMessage] = useState(
    isDynamicQrCode ? 'Processando pagamento QR Code dinâmico...' :
    isQrCode ? 'Processando pagamento QR Code estático...' :
    isCopyPaste ? 'Iniciando pagamento...' :
    'Iniciando transferência...'
  );
  
  console.log(`[PixTransferLoadingScreen] Fluxo: ${flowType}, Tipo: ${actionType}`);
  if (isDynamicQrCode) {
    console.log('[PixTransferLoadingScreen] Processando QR code dinâmico');
  } else if (isStaticQrCode && isQrCode) {
    console.log('[PixTransferLoadingScreen] Processando QR code estático');
  }

  // Hook de polling - só ativa quando temos ID da transação (celcoinId ou id)
  const transactionId = transferResponse?.celcoinId || transferResponse?.id;
  
  // Garantir que estamos usando o ID correto para consulta
  console.log(`[PixTransferLoadingScreen] ID para polling: ${transactionId}`);
  
  const { data: pollingData, error: pollingError, isLoading: isPolling } = usePixTransferPolling(
    transactionId,
    {
      enabled: !!transactionId && currentStatus === 'POLLING',
      onConfirmed: (data) => {
        console.log(`[PixTransferLoadingScreen] ${isCopyPaste ? 'Pagamento' : isQrCode ? 'Pagamento QR Code' : 'Transferência'} confirmada:`, data);
        setCurrentStatus('CONFIRMED');
        setStatusMessage(`${actionType === 'transferência' ? 'Transferência confirmada' : 'Pagamento confirmado'}!`);
        
        // Criar objeto de movimento padronizado com IDs consistentes para consulta no extrato
        // Garantimos que todos os IDs relevantes estão presentes para compatibilidade
        const transactionId = transferResponse?.celcoinId || transferResponse?.id;
        const endToEndId = data.body?.endToEndId || transferResponse?.endToEndId;
        
        console.log(`[PixTransferLoadingScreen] Criando movimento com ID: ${transactionId}, endToEndId: ${endToEndId}`);
        
        const movement = {
          id: transactionId, // ID principal para consulta no extrato
          createDate: new Date().toISOString(),
          description: isQrCode 
            ? `Pagamento PIX QR Code para ${transferData.beneficiary?.name || 'Destinatário'}`
            : isCopyPaste 
              ? `Pagamento PIX para ${transferData.beneficiary?.name || 'Destinatário'}`
              : `Transferência PIX para ${transferData.beneficiary?.name || 'Destinatário'}`,
          balanceType: "DEBIT",
          amount: transferData.amount,
          movementType: "PIXPAYMENTOUT",
          clientRequestId: transferResponse.clientCode || transferResponse.id,
          celcoinId: transactionId, // Garantir consistência
          endToEndId: endToEndId,
          status: 'CONFIRMED',
          pixDetails: data.body
        };

        // Navegar diretamente para o comprovante com dados completos
        setTimeout(() => {
          // Criar objeto completo com todos os dados necessários para o comprovante
          const completeTransferData = {
            ...transferData,
            ...transferResponse,
            movement: movement,  // Objeto de movimento padronizado
            // Garantir que os dados do body estão disponíveis para o comprovante
            body: {
              ...data.body,
              id: movement.id,  // Garantir ID consistente
              celcoinId: movement.celcoinId,
              endToEndId: movement.endToEndId
            }
          };
          
          console.log('[PixTransferLoadingScreen] Navegando para recibo com dados completos');
          navigation.replace('PixTransferReceipt', { transferData: completeTransferData });
        }, 1000);
      },
      onFailed: (data) => {
        console.error(`[PixTransferLoadingScreen] ${flowType} falhou:`, data);
        setCurrentStatus('FAILED');
        setError(`${actionType === 'transferência' ? 'A transferência' : 'O pagamento'} não pôde ser processado. Tente novamente.`);
        
        // Determinar tela de retorno baseada no fluxo
        const returnScreen = isQrCode ? 'PixQrCodePayment' : (isCopyPaste ? 'PixCopyPasteConfirm' : 'PixTransferConfirm');
        
        setTimeout(() => {
          navigation.navigate(returnScreen, { 
            ...route.params,
            error: `${actionType === 'transferência' ? 'A transferência' : 'O pagamento'} não pôde ser processado. Tente novamente.`
          });
        }, 2000);
      },
      onTimeout: (error) => {
        console.error(`[PixTransferLoadingScreen] Timeout no polling ${flowType}:`, error);
        setCurrentStatus('TIMEOUT');
        setError(`Não foi possível confirmar o status ${actionType === 'transferência' ? 'da transferência' : 'do pagamento'}. Verifique seu extrato.`);
        
        // Determinar tela de retorno baseada no fluxo
        const returnScreen = isQrCode ? 'PixQrCodePayment' : (isCopyPaste ? 'PixCopyPasteConfirm' : 'PixTransferConfirm');
        
        setTimeout(() => {
          navigation.navigate(returnScreen, { 
            ...route.params,
            error: `Não foi possível confirmar o status ${actionType === 'transferência' ? 'da transferência' : 'do pagamento'}. Verifique seu extrato.`
          });
        }, 2000);
      }
    }
  );

  useEffect(() => {
    // Executar a transferência PIX
    const executeTransfer = async () => {
      try {
        setStatusMessage(`Processando ${actionType}...`);
        console.log(`[PixTransferLoadingScreen] Iniciando ${flowType} PIX`);
        
        // Buscar dados do usuário logado para incluir o nome real
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        let userData = null;
        if (userId) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, document_number')
            .eq('id', userId)
            .single();
            
          if (data) {
            userData = data;
          }
        }
        
        // Atualizar o payload com o nome real do usuário
        const updatedPayload = {
          ...payload,
          debitParty: {
            ...payload.debitParty,
            name: userData?.full_name || payload.debitParty?.name || 'Usuário'
          }
        };
        
        console.log('[PixTransferLoadingScreen] Payload atualizado:', JSON.stringify(updatedPayload));
        
        // Usar a edge function segura unificada para todos os fluxos
        const edgeFunction = 'pix-cash-out-secure';
        console.log(`[PixTransferLoadingScreen] Chamando ${edgeFunction} para ${flowType}`);
        
        // Realizar transferência PIX com a edge function segura
        const { data: response, error: transferError } = await supabase.functions.invoke(
          edgeFunction,
          {
            body: updatedPayload
          }
        );

        console.log('[PixTransferLoadingScreen] Resposta:', JSON.stringify(response));
        
        if (transferError) {
          console.error('[PixTransferLoadingScreen] Erro na função:', transferError);
          throw transferError;
        }

        if (response.status === 'ERROR') {
          console.error('[PixTransferLoadingScreen] Erro na resposta:', response.error);
          throw new Error(response.error?.message || `Erro ao realizar ${actionType} PIX`);
        }

        // Armazenar resposta da transferência
        setTransferResponse(response.body);
        
        // Verificar se temos celcoinId ou id para fazer polling
        const transactionId = response.body?.celcoinId || response.body?.id;
        
        if (transactionId) {
          console.log('[PixTransferLoadingScreen] Iniciando polling para transactionId:', transactionId);
          // Armazenar o ID para uso no polling
          response.body.celcoinId = transactionId; // Garantir que celcoinId esteja definido para compatibilidade
          setCurrentStatus('POLLING');
          setStatusMessage('Aguardando confirmação...');
        } else {
          // Se não temos ID de transação, assumir sucesso (comportamento anterior)
          console.warn('[PixTransferLoadingScreen] Sem ID de transação, assumindo sucesso imediato');
          setCurrentStatus('CONFIRMED');
          setStatusMessage(`${actionType === 'transferência' ? 'Transferência realizada' : 'Pagamento realizado'}!`);
          
          const updatedTransferData = {
            ...transferData,
            ...response.body
          };

          setTimeout(() => {
            navigation.replace('PixTransferReceipt', { transferData: updatedTransferData });
          }, 1500);
        }
      } catch (err) {
        console.error(`[PixTransferLoadingScreen] Erro ao realizar ${flowType}:`, err);
        setError(err.message || `Erro ao realizar ${actionType}`);
        setCurrentStatus('ERROR');
        
        // Determinar tela de retorno baseada no fluxo
        const returnScreen = isQrCode ? 'PixQrCodePayment' : (isCopyPaste ? 'PixCopyPasteConfirm' : 'PixTransferConfirm');
        
        // Navegar para tela de erro
        setTimeout(() => {
          navigation.navigate(returnScreen, { 
            ...route.params,
            error: err.message || `Erro ao realizar ${actionType}`
          });
        }, 1500);
      }
    };

    // Executar a transferência
    executeTransfer();
  }, []);

  // Determinar ícone e cor baseado no status
  const getStatusDisplay = () => {
    switch (currentStatus) {
      case 'PROCESSING':
        return {
          icon: 'clock-outline',
          color: '#FFF',
          title: 'Processando...',
          showLoader: true
        };
      case 'POLLING':
        return {
          icon: 'sync',
          color: '#FFF',
          title: 'Confirmando...',
          showLoader: true
        };
      case 'CONFIRMED':
        return {
          icon: 'check-circle',
          color: '#4CAF50',
          title: 'Confirmado!',
          showLoader: false
        };
      case 'FAILED':
      case 'ERROR':
      case 'TIMEOUT':
        return {
          icon: 'alert-circle',
          color: '#F44336',
          title: 'Erro',
          showLoader: false
        };
      default:
        return {
          icon: 'clock-outline',
          color: '#FFF',
          title: 'Processando...',
          showLoader: true
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#682145" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${statusDisplay.color}20` }]}>
            <MaterialCommunityIcons
              name={statusDisplay.icon}
              size={40}
              color={statusDisplay.color}
            />
          </View>
          <Text style={styles.title}>{statusDisplay.title}</Text>
          <Text style={styles.subtitle}>
            {error || statusMessage}
          </Text>
          {statusDisplay.showLoader && (
            <ActivityIndicator 
              size="large" 
              color="#FFF" 
              style={styles.loader}
            />
          )}
          {currentStatus === 'POLLING' && (
            <Text style={styles.pollingInfo}>
              Aguardando confirmação da instituição financeira...
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#682145'
  },
  container: {
    flex: 1,
    backgroundColor: '#682145',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
  pollingInfo: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default PixTransferLoadingScreen;
