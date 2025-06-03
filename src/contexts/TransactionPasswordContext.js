import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useSession } from './SessionContext';

const TransactionPasswordContext = createContext();

export const TransactionPasswordProvider = ({ children }) => {
  const { user, isAuthenticated, setHasTransactionPin } = useSession();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [pinLoaded, setPinLoaded] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  
  // Efeito para resetar os estados quando o usuário faz logout
  // Verificar se o usuário já tem um PIN configurado
  const checkPinExists = async () => {
    if (!user) return false;
    
    try {
      console.log('[TRANSACTION_PIN] Verificando existência de PIN');
      
      // Chamar a Edge Function para verificar se o PIN existe
      console.log('[TRANSACTION_PIN] Verificando existência de PIN para o usuário:', user?.id);
      
      // Usar a forma simplificada de chamar a Edge Function
      const { data, error } = await supabase.functions.invoke('transaction-pin', {
        body: {
          action: 'check_pin_exists'
        }
      });
      
      console.log('[TRANSACTION_PIN] Resposta da Edge Function:', data ? JSON.stringify(data) : 'Sem dados', error ? JSON.stringify(error) : 'Sem erro');
      
      if (error) {
        console.error('[TRANSACTION_PIN] Erro ao verificar existência de PIN:', error);
        console.error('[TRANSACTION_PIN] Detalhes do erro:', JSON.stringify(error, null, 2));
        return false;
      }
      
      const pinExists = data?.hasPin || false;
      setHasPin(pinExists);
      setHasTransactionPin(pinExists);
      setPinLoaded(true);
      
      return pinExists;
    } catch (error) {
      console.error('[TRANSACTION_PIN] Erro ao verificar existência de PIN:', error);
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // Quando o usuário faz logout, resetar os estados
      setPinLoaded(false);
      setHasPin(false);
      setHasTransactionPin(false);
    } else if (user) {
      // Quando o usuário faz login, verificar se tem PIN
      checkPinExists();
    }
  }, [isAuthenticated, user, setHasTransactionPin]);

  // Criar ou atualizar a senha de transação
  const setTransactionPassword = async (pin) => {
    if (!user) return false;
    
    try {
      setIsVerifying(true);
      setError(null);
      
      console.log('[TRANSACTION_PIN] Criando PIN para o usuário');
      
      // Chamar a Edge Function para criar o PIN
      console.log('[TRANSACTION_PIN] Criando PIN para o usuário:', user?.id);
      console.log('[TRANSACTION_PIN] PIN a ser criado:', pin);
      
      // Usar a forma simplificada de chamar a Edge Function
      // O SDK do Supabase cuida da serialização, headers e autenticação
      const { data, error } = await supabase.functions.invoke('transaction-pin', {
        body: {
          action: 'create_pin',
          pin: pin
        }
      });
      
      console.log('[TRANSACTION_PIN] Resposta da Edge Function:', data ? JSON.stringify(data) : 'Sem dados', error ? JSON.stringify(error) : 'Sem erro');
      
      if (error) {
        console.error('[TRANSACTION_PIN] Erro ao salvar PIN:', error);
        console.error('[TRANSACTION_PIN] Detalhes do erro:', JSON.stringify(error, null, 2));
        setError(error.message || 'Erro ao salvar PIN. Tente novamente.');
        return false;
      }
      
      if (!data || !data.success) {
        console.error('[TRANSACTION_PIN] Erro ao salvar PIN:', data?.error || 'Erro desconhecido');
        setError(data?.error || 'Erro ao salvar PIN. Tente novamente.');
        return false;
      }
      
      console.log('[TRANSACTION_PIN] PIN salvo com sucesso');
      setHasPin(true); // Atualizar o estado local
      setHasTransactionPin(true); // Atualizar o estado no SessionContext
      return true;
    } catch (error) {
      console.error('[TRANSACTION_PIN] Erro ao criar PIN:', error);
      setError('Erro ao criar PIN. Tente novamente.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Verificar se a senha de transação está correta
  const verifyTransactionPassword = async (pin) => {
    if (!user) return false;
    
    try {
      setIsVerifying(true);
      setError(null);
      
      console.log('[TRANSACTION_PIN] Verificando PIN');
      
      // Chamar a Edge Function para verificar o PIN
      console.log('[TRANSACTION_PIN] Verificando PIN para o usuário:', user?.id);
      
      // Usar a forma simplificada de chamar a Edge Function
      const { data, error } = await supabase.functions.invoke('transaction-pin', {
        body: {
          action: 'verify_pin',
          pin: pin
        }
      });
      
      console.log('[TRANSACTION_PIN] Resposta da Edge Function:', data ? JSON.stringify(data) : 'Sem dados', error ? JSON.stringify(error) : 'Sem erro');
      
      if (error) {
        console.error('[TRANSACTION_PIN] Erro ao verificar PIN:', error);
        console.error('[TRANSACTION_PIN] Detalhes do erro:', JSON.stringify(error, null, 2));
        setError(error.message || 'Erro ao verificar PIN. Tente novamente.');
        return false;
      }
      
      if (!data || !data.success) {
        console.error('[TRANSACTION_PIN] Erro ao verificar PIN:', data?.error || 'Erro desconhecido');
        
        // Simplificar a mensagem de erro independente do número de tentativas
        setError('Erro ao verificar PIN');
        
        return false;
      }
      
      console.log('[TRANSACTION_PIN] PIN verificado com sucesso');
      return true;
    } catch (error) {
      console.error('[TRANSACTION_PIN] Erro ao verificar PIN:', error);
      setError('Erro ao verificar PIN. Tente novamente.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const value = {
    hasPin,
    pinLoaded,
    isVerifying,
    error,
    setHasPin,
    setPinLoaded,
    setHasTransactionPin,
    setTransactionPassword,
    verifyTransactionPassword,
    checkPinExists
  };

  return (
    <TransactionPasswordContext.Provider value={value}>
      {children}
    </TransactionPasswordContext.Provider>
  );
};

export const useTransactionPassword = () => useContext(TransactionPasswordContext);
