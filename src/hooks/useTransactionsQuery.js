import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import useBankSearch from './useBankSearch';

/**
 * Enriquece transações PIX com dados específicos quando possível
 */
const enrichPixTransactions = async (movements, getBankNameByISPB) => {
  if (!movements || movements.length === 0) return movements;

  const enrichedMovements = await Promise.all(
    movements.map(async (movement) => {
      // Só enriquecer transações PIX
      if (!movement.movementType?.includes('PIX') || !movement.clientCode) {
        return movement;
      }

      try {
        // Tentar buscar dados específicos da transação PIX
        const edgeFunction = movement.movementType === 'PIXPAYMENTOUT' 
          ? 'pix-payment-status' 
          : 'pix-receivement-status';

        console.log(`[useTransactionsQuery] Enriquecendo transação PIX: ${movement.id} via ${edgeFunction}`);

        const { data: pixData, error: pixError } = await supabase.functions.invoke(edgeFunction, {
          body: { 
            celcoinId: movement.clientCode,
            // Fallback para outros identificadores se necessário
            endToEndId: movement.id
          }
        });

        if (pixError || !pixData || pixData.status === 'ERROR') {
          console.warn(`[useTransactionsQuery] Não foi possível enriquecer transação ${movement.id}:`, pixError || pixData?.error);
          return movement;
        }

        // Enriquecer o movimento com dados PIX específicos e nomes de bancos
        const enrichedMovement = {
          ...movement,
          pixDetails: pixData.body,
          endToEndId: pixData.body?.endToEndId || movement.id,
          status: pixData.body?.status || 'CONFIRMED',
          enriched: true,
          enrichedAt: new Date().toISOString()
        };

        // Converter códigos ISPB para nomes de bancos
        if (pixData.body?.debitParty?.bank && getBankNameByISPB) {
          enrichedMovement.pixDetails.debitParty.bankName = getBankNameByISPB(pixData.body.debitParty.bank);
        }
        if (pixData.body?.creditParty?.bank && getBankNameByISPB) {
          enrichedMovement.pixDetails.creditParty.bankName = getBankNameByISPB(pixData.body.creditParty.bank);
        }

        return enrichedMovement;
      } catch (error) {
        console.warn(`[useTransactionsQuery] Erro ao enriquecer transação ${movement.id}:`, error);
        return movement;
      }
    })
  );

  return enrichedMovements;
};

export const useTransactionsQuery = (account, documentNumber, dateFrom, dateTo, options = {}) => {
  const { 
    enrichPixData = false, // Desabilitado por padrão - o extrato já traz dados suficientes
    ...queryOptions 
  } = options;

  // Hook para busca de bancos (mantido para uso futuro se necessário)
  const { getBankNameByISPB, loading: banksLoading } = useBankSearch();

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
    queryKey: ['transactions', account, documentNumber, dateFrom || defaultDateFrom, dateTo || defaultDateTo, enrichPixData],
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

        if (statementData.status === 'ERROR') {
          console.error('Erro retornado pela API:', statementData.error);
          return { 
            data: [], 
            error: {
              code: statementData.error?.code || 'UNKNOWN_ERROR',
              message: statementData.error?.message || 'Erro desconhecido ao buscar transações.',
              details: statementData.error
            }
          };
        }

        // Extrair movimentos da estrutura correta da API
        let movements = [];
        
        if (statementData.status === 'SUCCESS' && statementData.body?.movements) {
          movements = statementData.body.movements;
        } else if (statementData.status === 'ERROR' && statementData.error?.errorCode === 'CBE151') {
          // Sem transações no período - retorna array vazio sem erro
          console.log('Sem transações no período selecionado');
          movements = [];
        } else {
          console.warn('Estrutura de resposta inesperada:', statementData);
          movements = [];
        }
        
        // Enriquecer transações PIX se habilitado e se temos a função de busca de bancos
        if (enrichPixData && getBankNameByISPB && !banksLoading && movements.length > 0) {
          console.log(`[useTransactionsQuery] Iniciando enriquecimento de ${movements.length} transações`);
          movements = await enrichPixTransactions(movements, getBankNameByISPB);
          console.log(`[useTransactionsQuery] Enriquecimento concluído`);
        }

        return { 
          data: movements, 
          error: null 
        };
      } catch (error) {
        console.error('Erro inesperado:', error);
        return { 
          data: [], 
          error: {
            code: 'UNEXPECTED_ERROR',
            message: 'Erro inesperado. Tente novamente mais tarde.',
            details: error
          }
        };
      }
    },
    enabled: !!account && !!documentNumber && (enrichPixData ? !banksLoading : true), // Só aguarda bancos se enriquecimento estiver habilitado
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    ...queryOptions
  });
};
