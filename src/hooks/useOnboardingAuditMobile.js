import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import Constants from 'expo-constants';

// Caminho para armazenar logs pendentes
const PENDING_LOGS_PATH = `${FileSystem.documentDirectory}onboarding_pending_logs.json`;

/**
 * Hook para registrar tentativas de onboarding no app mobile
 * 
 * Este hook implementa:
 * 1. Registro de logs de onboarding via Edge Function
 * 2. Persistência local de logs pendentes
 * 3. Retry automático de logs pendentes
 * 4. Coleta de informações do dispositivo
 */
export const useOnboardingAuditMobile = () => {
  console.log('[DEBUG] Inicializando hook useOnboardingAuditMobile');
  
  const [pendingLogs, setPendingLogs] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [functionAvailability, setFunctionAvailability] = useState({
    hasOnboardingFunction: false,
    checked: false
  });

  // Carregar logs pendentes ao inicializar
  useEffect(() => {
    console.log('[DEBUG] useEffect de inicialização disparado');
    
    const initialize = async () => {
      console.log('[DEBUG] Função initialize iniciada');
      try {
        console.log('[DEBUG] Carregando logs pendentes...');
        await loadPendingLogs();
        console.log('[DEBUG] Verificando disponibilidade de Edge Functions...');
        const availability = await checkEdgeFunctionAvailability();
        console.log('[DEBUG] Disponibilidade de funções:', availability);
        setFunctionAvailability({
          ...availability,
          checked: true
        });
        setIsInitialized(true);
        console.log('[DEBUG] Hook inicializado com sucesso');
      } catch (error) {
        console.error('[DEBUG] Erro durante inicialização do hook:', error);
      }
    };
    
    initialize();
  }, []);

  // Tentar reenviar logs pendentes periodicamente
  useEffect(() => {
    if (pendingLogs.length > 0) {
      const interval = setInterval(() => {
        retryPendingLogs();
      }, 60000); // Tentar a cada 1 minuto

      return () => clearInterval(interval);
    }
  }, [pendingLogs]);

  // Carregar logs pendentes do armazenamento local
  const loadPendingLogs = async () => {
    console.log('[DEBUG] Iniciando loadPendingLogs');
    try {
      console.log('[DEBUG] Verificando arquivo de logs pendentes:', PENDING_LOGS_PATH);
      const fileInfo = await FileSystem.getInfoAsync(PENDING_LOGS_PATH);
      console.log('[DEBUG] Resultado da verificação do arquivo:', fileInfo);
      
      if (fileInfo.exists) {
        console.log('[DEBUG] Arquivo existe, carregando conteúdo...');
        const content = await FileSystem.readAsStringAsync(PENDING_LOGS_PATH);
        const logs = JSON.parse(content);
        console.log('[DEBUG] Logs pendentes carregados com sucesso:', logs);
        setPendingLogs(logs);
        console.log(`[useOnboardingAuditMobile] ${logs.length} logs pendentes carregados`);
      } else {
        console.log('[DEBUG] Arquivo de logs pendentes não existe, criando novo...');
        // Criar arquivo vazio para evitar problemas futuros
        await FileSystem.writeAsStringAsync(PENDING_LOGS_PATH, JSON.stringify([]));
        console.log('[DEBUG] Arquivo vazio criado com sucesso');
      }
    } catch (error) {
      console.error('[DEBUG] ERRO ao carregar logs pendentes:', error);
    }
  };

  // Salvar logs pendentes no armazenamento local
  const savePendingLogs = async (logs) => {
    try {
      await FileSystem.writeAsStringAsync(PENDING_LOGS_PATH, JSON.stringify(logs));
      setPendingLogs(logs);
      console.log(`[useOnboardingAuditMobile] ${logs.length} logs pendentes salvos`);
    } catch (error) {
      console.error('[useOnboardingAuditMobile] Erro ao salvar logs pendentes:', error);
    }
  };

  // Obter informações do dispositivo
  const getMobileDeviceInfo = () => {
    const appVersion = Constants.expoConfig?.version || '1.0.8';
    
    return {
      device_type: 'mobile',
      browser: 'WebView',
      os: Platform.OS, // 'ios' ou 'android'
      user_agent: 'React Native App',
      page_url: '/onboarding', // Equivalente à URL no app
      accepted_at: new Date().toISOString()
    };
  };
  
  // Função para verificar se a Edge Function existe
  const checkEdgeFunctionAvailability = async () => {
    console.log('[DEBUG] Iniciando checkEdgeFunctionAvailability');
    try {
      console.log('[DEBUG] Tentando listar Edge Functions do Supabase...');
      console.log('[DEBUG] Supabase client inicializado?', !!supabase);
      console.log('[DEBUG] Supabase functions disponível?', !!supabase.functions);
      
      const { data: functions, error } = await supabase.functions.list();
      console.log('[DEBUG] Resultado da chamada functions.list():', { functions, error });
      
      if (error) {
        console.error('[DEBUG] ERRO ao listar funções:', error);
        return { hasOnboardingFunction: false };
      }
      
      if (!functions || functions.length === 0) {
        console.warn('[DEBUG] Nenhuma função disponível no Supabase');
        return { hasOnboardingFunction: false };
      }
      
      const availableFunctions = functions.map(f => f.name);
      console.log('[DEBUG] Funções disponíveis:', availableFunctions);
      
      // Verificar a função de onboarding
      const hasOnboardingFunction = availableFunctions.includes('record-onboarding-attempt');
      console.log(`[DEBUG] Função 'record-onboarding-attempt' disponível: ${hasOnboardingFunction}`);
      
      return { hasOnboardingFunction };
    } catch (error) {
      console.error('[DEBUG] ERRO GRAVE ao verificar funções:', error);
      console.error('[DEBUG] Stack trace:', error.stack);
      return { hasOnboardingFunction: false };
    }
  };

  // Registrar tentativa de onboarding
  const recordOnboardingAttempt = async (attemptData) => {
    console.log('[DEBUG] ====== INICIANDO REGISTRO DE ONBOARDING ======');
    console.log('[DEBUG] Dados recebidos:', JSON.stringify(attemptData, null, 2));
    
    const startTime = Date.now();
    
    try {
      console.log('[DEBUG] Coletando informações do dispositivo...');
      const deviceInfo = getMobileDeviceInfo();
      console.log('[DEBUG] Informações do dispositivo:', deviceInfo);
      
      // Verificar campos obrigatórios
      if (!attemptData.document_number && !attemptData.id) {
        console.error('[DEBUG] ERRO: document_number é obrigatório para novos registros');
        return { success: false, error: 'document_number é obrigatório para novos registros' };
      }
      
      console.log('[DEBUG] Preparando dados para envio...');
      
      // Verificar se é uma atualização (tem ID) ou um novo registro
      const isUpdate = !!attemptData.id;
      console.log(`[DEBUG] Operação: ${isUpdate ? 'ATUALIZAÇÃO' : 'NOVO REGISTRO'}`);
      
      // Preparar dados para a Edge Function record-onboarding-attempt
      const onboardingAttemptData = {
        // Se for atualização, incluir o ID
        ...(isUpdate && { id: attemptData.id }),
        
        // Dados básicos
        document_number: attemptData.document_number,
        document_type: attemptData.document_type || (attemptData.attempt_type === 'PJ' ? 'CNPJ' : 'CPF'),
        email: attemptData.email,
        attempt_type: attemptData.attempt_type || 'PF',
        success: attemptData.success !== undefined ? attemptData.success : true,
        error_type: attemptData.error_type || null,
        error_message: attemptData.error_message || null,
        processing_time_ms: attemptData.processing_time_ms || (Date.now() - startTime),
        
        // Dados específicos do onboarding
        form_step: attemptData.form_step || 'submit',
        client_code: attemptData.invite_code || null,
        proposal_id: attemptData.proposal_id || null,
        celcoin_response: attemptData.celcoin_response || null,
        
        // Informações do dispositivo
        ...deviceInfo,
        
        // Garantir que accepted_at esteja presente
        accepted_at: deviceInfo.accepted_at || new Date().toISOString()
      };

      console.log('[DEBUG] Dados formatados para envio:', JSON.stringify(onboardingAttemptData, null, 2));
      console.log('[DEBUG] Verificando disponibilidade do Supabase...');
      console.log('[DEBUG] Supabase client inicializado?', !!supabase);
      console.log('[DEBUG] Supabase functions disponível?', !!supabase.functions);
      console.log('[DEBUG] Supabase invoke disponível?', !!supabase.functions.invoke);

      try {
        console.log('[DEBUG] Chamando Edge Function record-onboarding-attempt...');
        // Chamar a Edge Function record-onboarding-attempt
        const { data, error } = await supabase.functions.invoke('record-onboarding-attempt', {
          body: onboardingAttemptData
        });
        
        console.log('[DEBUG] Resposta recebida da Edge Function:', { data, error });
        
        if (error) {
          console.error('[DEBUG] ERRO ao chamar record-onboarding-attempt:', error);
          throw error;
        }
        
        console.log('[DEBUG] Log registrado com sucesso!');
        return { success: true, data };
      } catch (error) {
        console.error('[DEBUG] ERRO GRAVE ao chamar record-onboarding-attempt:', error);
        console.error('[DEBUG] Stack trace:', error.stack);
        
        // Salvar como log pendente
        console.log('[DEBUG] Salvando como log pendente para retry posterior...');
        const pendingLog = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          data: onboardingAttemptData
        };
        
        console.log('[DEBUG] Estrutura do log pendente:', pendingLog);
        const updatedLogs = [...pendingLogs, pendingLog];
        await savePendingLogs(updatedLogs);
        console.log('[DEBUG] Log pendente salvo com sucesso');
        return { success: false, error };
      }
    } catch (outerError) {
      console.error('[DEBUG] ERRO FATAL no processamento do log:', outerError);
      console.error('[DEBUG] Stack trace:', outerError.stack);
      return { success: false, error: outerError };
    } finally {
      console.log('[DEBUG] ====== FIM DO REGISTRO DE ONBOARDING ======');
    }
  };

  // Tentar reenviar logs pendentes
  const retryPendingLogs = async () => {
    console.log('[DEBUG] ====== INICIANDO RETRY DE LOGS PENDENTES ======');
    
    if (pendingLogs.length === 0) {
      console.log('[DEBUG] Nenhum log pendente para reenviar');
      return { successful: 0, remaining: 0 };
    }

    console.log(`[DEBUG] Tentando reenviar ${pendingLogs.length} logs pendentes`);
    const remainingLogs = [...pendingLogs];
    const successfulLogs = [];

    // Tentar enviar cada log pendente
    for (const log of pendingLogs) {
      try {
        console.log(`[DEBUG] Reenviando log pendente ${log.id}...`);
        console.log('[DEBUG] Dados do log:', JSON.stringify(log.data, null, 2));
        
        // Chamar a Edge Function record-onboarding-attempt
        const { data, error } = await supabase.functions.invoke('record-onboarding-attempt', {
          body: log.data
        });
        
        console.log(`[DEBUG] Resposta para log ${log.id}:`, { data, error });
        
        if (error) {
          console.error(`[DEBUG] ERRO ao reenviar log ${log.id}:`, error);
          continue; // Manter o log na lista de pendentes
        }
        
        // Log enviado com sucesso
        console.log(`[DEBUG] Log ${log.id} reenviado com sucesso!`);
        successfulLogs.push(log.id);
        const index = remainingLogs.findIndex(l => l.id === log.id);
        if (index !== -1) {
          remainingLogs.splice(index, 1);
        }
      } catch (error) {
        console.error(`[DEBUG] ERRO GRAVE ao reenviar log ${log.id}:`, error);
        console.error('[DEBUG] Stack trace:', error.stack);
        // Manter o log na lista de pendentes
      }
    }

    // Atualizar logs pendentes se algum foi enviado com sucesso
    if (successfulLogs.length > 0) {
      console.log(`[DEBUG] ${successfulLogs.length} logs reenviados com sucesso!`);
      console.log('[DEBUG] Atualizando lista de logs pendentes...');
      await savePendingLogs(remainingLogs);
      console.log('[DEBUG] Lista de logs pendentes atualizada');
    } else {
      console.log('[DEBUG] Nenhum log pendente foi reenviado com sucesso');
    }

    console.log('[DEBUG] ====== FIM DO RETRY DE LOGS PENDENTES ======');
    return {
      successful: successfulLogs.length,
      remaining: remainingLogs.length
    };
  };
  
  // Retornar as funções públicas do hook
  return {
    recordOnboardingAttempt,
    retryPendingLogs,
    pendingLogsCount: pendingLogs.length,
    isInitialized,
    functionAvailability,
    getMobileDeviceInfo
  };
};