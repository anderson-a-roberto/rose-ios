import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

export const useTransactionsQuery = (account, documentNumber, dateFrom, dateTo) => {
  // Calcular os últimos 7 dias como período padrão
  const getDefaultDateFrom = () => {
    // Data de hoje menos 6 dias (para ter 7 dias no total)
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date.toISOString().split('T')[0];
  };

  const getDefaultDateTo = () => {
    // Data de hoje
    return new Date().toISOString().split('T')[0];
  };

  // Se não passar as datas, usa os últimos 7 dias
  const defaultDateFrom = getDefaultDateFrom();
  const defaultDateTo = getDefaultDateTo();

  return useQuery({
    // Inclui as datas na queryKey para ter caches diferentes por período
    queryKey: ['transactions', account, documentNumber, dateFrom || defaultDateFrom, dateTo || defaultDateTo],
    queryFn: async () => {
      if (!account || !documentNumber) return { data: [], error: null };

      try {
        const { data: statementData, error: statementError } = await supabase.functions.invoke('get-account-statement', {
          body: {
            account: account,
            documentNumber: documentNumber,
            dateFrom: dateFrom || defaultDateFrom,
            dateTo: dateTo || defaultDateTo
          }
        });

        if (statementError) {
          console.error('Erro na chamada da API:', statementError);
          return { 
            data: [], 
            error: {
              code: 'API_ERROR',
              message: 'Erro ao comunicar com o servidor. Tente novamente mais tarde.',
              details: statementError
            }
          };
        }
        
        console.log('Statement response:', statementData);
        
        // Caso de sucesso normal - retorna os movimentos
        if (statementData.status === 'SUCCESS' && statementData.body?.movements) {
          return { data: statementData.body.movements, error: null };
        }
        
        // Tratamento específico para o caso de "sem transações no período"
        if (statementData.status === 'ERROR' && 
            statementData.error?.errorCode === 'CBE151') {
          console.log('Sem transações no período selecionado');
          return { data: [], error: null }; // Sem erro, apenas array vazio
        }
        
        // Tratamento para outros erros conhecidos
        if (statementData.status === 'ERROR' && statementData.error) {
          const errorCode = statementData.error.errorCode;
          const errorMessage = statementData.error.message;
          
          console.error(`Erro ${errorCode}: ${errorMessage}`);
          
          // Retorna o erro da API para exibição na tela
          return { 
            data: [], 
            error: {
              code: errorCode,
              message: errorMessage,
              details: statementData.error
            }
          };
        }

        // Caso não identificado
        return { 
          data: [], 
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'Ocorreu um erro desconhecido ao buscar as transações.',
            details: statementData
          }
        };
      } catch (error) {
        console.error('Exceção ao buscar transações:', error);
        return { 
          data: [], 
          error: {
            code: 'EXCEPTION',
            message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
            details: error.message
          }
        };
      }
    },
    staleTime: 600000, // 10 minutos
    cacheTime: 1800000, // 30 minutos
    retry: 1, // Reduzindo o número de retentativas para evitar muitas chamadas em caso de erro
    enabled: Boolean(account && documentNumber),
  });
};
