import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const useDashboard = () => {
  const [userAccount, setUserAccount] = useState(null);
  const [userTaxId, setUserTaxId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserAccount();
  }, []);

  const fetchUserAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Obter document_number do perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUserTaxId(profile.document_number);

      // Obter conta do usuário
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profile.document_number)
        .eq('onboarding_create_status', 'CONFIRMED')
        .single();

      if (kycError) throw kycError;

      setUserAccount(kycData.account);

    } catch (err) {
      console.error('Erro ao buscar conta do usuário:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    userAccount,
    userTaxId,
    loading,
    error,
    refreshUserAccount: fetchUserAccount
  };
};

export default useDashboard;
