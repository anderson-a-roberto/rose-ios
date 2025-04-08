import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export default function useCharges(userTaxId, page = 1, limit = 10) {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro, pega o total de registros para paginação
      const { count } = await supabase
        .from('charge')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_document', userTaxId);

      setTotalCount(count || 0);

      // Depois pega os registros da página atual
      const { data, error } = await supabase
        .from('charge')
        .select('*')
        .eq('receiver_document', userTaxId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      setCharges(data || []);
    } catch (err) {
      console.error('Error fetching charges:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Se userTaxId for null, não faz nada
    if (!userTaxId) {
      setCharges([]);
      setLoading(false);
      return;
    }
    
    fetchCharges();
  }, [userTaxId, page, limit]);

  return {
    charges,
    loading,
    error,
    totalCount,
    refetch: fetchCharges,
    pageCount: Math.ceil(totalCount / limit)
  };
}
