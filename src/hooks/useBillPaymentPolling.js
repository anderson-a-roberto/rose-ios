import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

/**
 * Hook para polling do status de pagamento de boleto usando React Query
 * @param {string} celcoinId - ID da transação na Celcoin
 * @param {Object} options - Opções do React Query
 * @returns {Object} Resultado do useQuery
 */
export const useBillPaymentPolling = (celcoinId, options = {}) => {
  return useQuery({
    queryKey: ['billPaymentStatus', celcoinId],
    queryFn: async () => {
      if (!celcoinId) {
        throw new Error('celcoinId é obrigatório para consultar status do pagamento');
      }

      try {
        console.log(`[BillPolling] Consultando status do pagamento: ${celcoinId}`);
        
        const { data, error } = await supabase.functions.invoke('bill-payment-status', {
          body: { id: celcoinId }
        });

        if (error) {
          console.error('[BillPolling] Erro na consulta:', error);
          throw new Error(`Erro na consulta: ${error.message || 'Erro desconhecido'}`);
        }

        console.log('[BillPolling] Resposta recebida:', data);

        if (data.status === 'ERROR') {
          console.error('[BillPolling] Erro retornado pela API:', data.error);
          throw new Error(data.error?.message || 'Erro na consulta de status');
        }

        return data;
      } catch (error) {
        console.error('[BillPolling] Erro na consulta:', error);
        throw error;
      }
    },
    enabled: !!celcoinId,
    refetchInterval: (data) => {
      // Parar polling se status for final
      if (data?.status === 'CONFIRMED' || data?.status === 'PAID' || 
          data?.status === 'FAILED' || data?.status === 'REJECTED' || 
          data?.status === 'ERROR') {
        return false;
      }
      return 5000; // 5 segundos
    },
    retry: 6, // 6 tentativas = 30 segundos total
    retryDelay: 5000,
    staleTime: 0, // Sempre considerar dados como stale
    cacheTime: 0, // Não manter cache
    ...options
  });
};

/**
 * Hook especializado com callbacks automáticos para diferentes status
 * @param {string} celcoinId - ID da transação na Celcoin
 * @param {Object} options - Opções incluindo callbacks para diferentes status
 * @returns {Object} Resultado do useQuery
 */
export const useBillPaymentPollingWithCallbacks = (celcoinId, options = {}) => {
  const { onConfirmed, onFailed, onTimeout, ...otherOptions } = options;

  return useBillPaymentPolling(celcoinId, {
    ...otherOptions,
    onSuccess: (data) => {
      console.log('[BillPolling] Dados recebidos:', data);
      
      if (data?.status === 'CONFIRMED' || data?.status === 'PAID') {
        console.log('[BillPolling] Pagamento confirmado!');
        onConfirmed?.(data);
      } else if (data?.status === 'FAILED' || data?.status === 'REJECTED' || data?.status === 'ERROR') {
        console.log('[BillPolling] Pagamento falhou:', data?.status);
        onFailed?.(data);
      }
    },
    onError: (error) => {
      console.error('[BillPolling] Erro no polling:', error);
      
      // Se chegou ao limite de tentativas, considerar como timeout
      if (error.message?.includes('retry')) {
        console.log('[BillPolling] Timeout no polling');
        onTimeout?.();
      } else {
        onFailed?.({ error: { message: error.message } });
      }
    }
  });
};
