import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

export const useTransactionsQuery = (account, documentNumber, dateFrom, dateTo) => {
  // Se não passar as datas, usa um período padrão
  const defaultDateFrom = '2025-01-19';
  const defaultDateTo = '2025-01-24';

  return useQuery({
    // Inclui as datas na queryKey para ter caches diferentes por período
    queryKey: ['transactions', account, documentNumber, dateFrom || defaultDateFrom, dateTo || defaultDateTo],
    queryFn: async () => {
      if (!account || !documentNumber) return [];

      const { data: statementData, error: statementError } = await supabase.functions.invoke('get-account-statement', {
        body: {
          account: account,
          documentNumber: documentNumber,
          dateFrom: dateFrom || defaultDateFrom,
          dateTo: dateTo || defaultDateTo
        }
      });

      if (statementError) throw statementError;
      
      if (statementData.status === 'SUCCESS' && statementData.body?.movements) {
        return statementData.body.movements;
      }

      throw new Error('Erro ao obter extrato');
    },
    staleTime: 30000, // 30 segundos
    cacheTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
    enabled: Boolean(account && documentNumber),
  });
};
