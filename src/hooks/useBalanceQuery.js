import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

export const useBalanceQuery = () => {
  return useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      // Buscar usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar CPF do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;

      // Buscar número da conta
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycError) throw kycError;

      // Buscar saldo
      const { data: balanceData, error: balanceError } = await supabase.functions.invoke('get-account-balance', {
        body: {
          account: kycData.account,
          documentNumber: profileData.document_number
        }
      });

      if (balanceError) throw balanceError;

      return balanceData.body.amount;
    },
    staleTime: 30000, // Dados ficam "frescos" por 30 segundos
    cacheTime: 1000 * 60 * 5, // Cache mantido por 5 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
  });
};
