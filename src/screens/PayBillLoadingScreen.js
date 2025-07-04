import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBillPaymentPollingWithCallbacks } from '../hooks/useBillPaymentPolling';

export default function PayBillLoadingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentStatus, setCurrentStatus] = useState('PROCESSING');
  const [statusMessage, setStatusMessage] = useState('Processando pagamento...');
  
  // Extrair dados da rota (passados pelo PayBillPinScreen)
  const { clientRequestId, celcoinId, billData, paymentResponse } = route.params || {};

  // Hook de polling com callbacks automáticos
  const { data: pollingData, isLoading: isPolling } = useBillPaymentPollingWithCallbacks(
    celcoinId,
    {
      enabled: !!celcoinId && currentStatus === 'POLLING',
      onConfirmed: (data) => {
        console.log('[PayBillLoadingScreen] Pagamento confirmado:', data);
        setCurrentStatus('CONFIRMED');
        setStatusMessage('Pagamento realizado com sucesso!');
        
        // Criar objeto Movement padronizado
        const movementData = {
          id: data.body?.id || celcoinId,
          createDate: data.body?.paymentDate || new Date().toISOString(),
          description: 'PAGAMENTO DE CONTAS',
          balanceType: 'DEBIT',
          amount: data.body?.amount || billData?.value || 0,
          movementType: 'BILLPAYMENT',
          clientRequestId: data.body?.clientRequestId || clientRequestId,
          celcoinId: data.body?.id || celcoinId,
          status: data.status, // Status do nível raiz
          billDetails: data.body,
          // Dados específicos do boleto
          assignor: billData?.assignor,
          barCode: data.body?.barCodeInfo?.digitable || billData?.barCode?.digitable,
          value: data.body?.amount || billData?.value,
          transactionId: data.body?.transactionIdAuthorize,
          paymentDate: data.body?.paymentDate
        };

        // Navegar para comprovante com dados completos
        setTimeout(() => {
          console.log('[PayBillLoadingScreen] Navegando para comprovante...');
          navigation.replace('PayBillReceipt', {
            transaction: movementData,
            preloadedDetails: data // ← Objeto completo com status, igual ao extrato
          });
        }, 1500);
      },
      onFailed: (data) => {
        console.log('[PayBillLoadingScreen] Pagamento falhou:', data);
        setCurrentStatus('FAILED');
        setStatusMessage('Falha no pagamento');
        
        setTimeout(() => {
          navigation.replace('PayBillError', {
            error: data.error?.message || 'Pagamento não foi processado',
            billData
          });
        }, 1500);
      },
      onTimeout: () => {
        console.log('[PayBillLoadingScreen] Timeout no polling');
        setCurrentStatus('TIMEOUT');
        setStatusMessage('Verificando status...');
        
        // Em caso de timeout, navegar para comprovante com aviso
        setTimeout(() => {
          navigation.replace('PayBillReceipt', {
            billData,
            paymentData: paymentResponse,
            isTimeout: true
          });
        }, 1500);
      }
    }
  );

  useEffect(() => {
    if (celcoinId) {
      console.log('[PayBillLoadingScreen] Iniciando polling para celcoinId:', celcoinId);
      setCurrentStatus('POLLING');
      setStatusMessage('Verificando status do pagamento...');
    } else {
      console.warn('[PayBillLoadingScreen] celcoinId não fornecido');
      // Navegar para erro se não temos ID para polling
      setTimeout(() => {
        navigation.replace('PayBillError', {
          error: 'Erro interno: ID da transação não encontrado',
          billData
        });
      }, 2000);
    }
  }, [celcoinId, navigation, billData]);

  // Atualizar mensagem baseada no status do polling
  useEffect(() => {
    if (pollingData?.status) {
      switch (pollingData.status) {
        case 'PROCESSING':
        case 'PENDING':
          setCurrentStatus('POLLING');
          setStatusMessage('Verificando status do pagamento...');
          break;
        case 'CONFIRMED':
        case 'PAID':
          setCurrentStatus('CONFIRMED');
          setStatusMessage('Pagamento confirmado!');
          break;
        case 'FAILED':
        case 'REJECTED':
        case 'ERROR':
          setCurrentStatus('FAILED');
          setStatusMessage('Falha no pagamento');
          break;
      }
    }
  }, [pollingData]);

  // Determinar ícone e cor baseado no status (como o PIX)
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
        return {
          icon: 'alert-circle',
          color: '#F44336',
          title: 'Erro',
          showLoader: false
        };
      case 'TIMEOUT':
        return {
          icon: 'clock-alert',
          color: '#FF9800',
          title: 'Verificando...',
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
            {statusMessage}
          </Text>
          {statusDisplay.showLoader && (
            <ActivityIndicator 
              size="large" 
              color="#FFF" 
              style={styles.loader}
            />
          )}
          {(isPolling || currentStatus === 'POLLING') && (
            <Text style={styles.pollingInfo}>
              Aguardando confirmação da instituição financeira...
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

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
