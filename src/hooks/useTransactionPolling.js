import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

/**
 * Hook para polling de status de transações PIX
 * Monitora o status de uma transação até ela ser confirmada ou falhar
 */
export const useTransactionPolling = (celcoinId, options = {}) => {
  const {
    enabled = false,
    maxAttempts = 6,
    interval = 5000, // 5 segundos
    onSuccess,
    onError,
    onStatusChange
  } = options;

  return useQuery({
    queryKey: ['transaction-polling', celcoinId],
    queryFn: async () => {
      if (!celcoinId) {
        throw new Error('celcoinId é obrigatório para polling');
      }

      try {
        console.log(`[Polling] Consultando status da transação: ${celcoinId}`);
        
        const { data, error } = await supabase.functions.invoke('pix-payment-status', {
          body: { id: celcoinId }
        });

        if (error) {
          console.error('[Polling] Erro na consulta:', error);
          throw new Error(`Erro na consulta: ${error.message || 'Erro desconhecido'}`);
        }

        console.log('[Polling] Resposta recebida:', data);

        // Verificar se a resposta tem o formato esperado
        if (!data || typeof data !== 'object') {
          throw new Error('Resposta inválida da API');
        }

        // Notificar mudança de status se callback fornecido
        if (onStatusChange && data.status) {
          onStatusChange(data.status, data);
        }

        return data;
      } catch (error) {
        console.error('[Polling] Exceção durante consulta:', error);
        throw error;
      }
    },
    enabled: enabled && !!celcoinId,
    refetchInterval: (data, query) => {
      // Parar o polling se:
      // 1. Transação foi confirmada
      // 2. Transação falhou
      // 3. Atingiu o número máximo de tentativas
      if (data?.status === 'CONFIRMED' || 
          data?.status === 'FAILED' || 
          data?.status === 'REJECTED' ||
          query.failureCount >= maxAttempts) {
        console.log('[Polling] Parando polling. Status:', data?.status, 'Tentativas:', query.failureCount);
        return false;
      }
      
      return interval;
    },
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
      // Retry apenas se não atingiu o máximo de tentativas
      const shouldRetry = failureCount < maxAttempts;
      console.log(`[Polling] Retry ${failureCount}/${maxAttempts}:`, shouldRetry);
      return shouldRetry;
    },
    retryDelay: interval,
    onSuccess: (data) => {
      console.log('[Polling] Sucesso:', data);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      console.error('[Polling] Erro final:', error);
      if (onError) onError(error);
    },
    // Cache por pouco tempo já que estamos fazendo polling
    staleTime: 0,
    cacheTime: 60000, // 1 minuto
  });
};

/**
 * Hook simplificado para polling com callbacks automáticos
 */
export const usePixTransferPolling = (celcoinId, callbacks = {}) => {
  const {
    onConfirmed,
    onFailed,
    onTimeout,
    enabled = false
  } = callbacks;

  return useTransactionPolling(celcoinId, {
    enabled,
    maxAttempts: 6, // 30 segundos total
    interval: 5000, // 5 segundos
    onStatusChange: (status, data) => {
      switch (status) {
        case 'CONFIRMED':
          if (onConfirmed) onConfirmed(data);
          break;
        case 'FAILED':
        case 'REJECTED':
          if (onFailed) onFailed(data);
          break;
        default:
          console.log(`[PixPolling] Status intermediário: ${status}`);
      }
    },
    onError: (error) => {
      console.error('[PixPolling] Timeout ou erro:', error);
      if (onTimeout) onTimeout(error);
    }
  });
};
