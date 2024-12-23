import axios from 'axios';
import { supabase } from './supabase';

const SUPABASE_FUNCTION_URL = 'https://asmzdxzpzommleypocli.supabase.co/functions/v1/onboarding';

export const createOnboardingProposal = async (userData) => {
  try {
    console.log('Enviando dados para processamento:', JSON.stringify(userData, null, 2));

    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await axios.post(SUPABASE_FUNCTION_URL, 
      { userData },
      {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resposta do processamento:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao processar dados:', error.response?.data || error.message);
    throw error;
  }
};

export default { createOnboardingProposal }; 