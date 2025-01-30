import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';

export default function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Busca usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Busca perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      return profile;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadProfile,
    updateProfile
  };
}
