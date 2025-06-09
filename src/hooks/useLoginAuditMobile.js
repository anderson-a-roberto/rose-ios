import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import Constants from 'expo-constants';

// Nome do arquivo para armazenar logs pendentes
const PENDING_LOGS_FILE = `${FileSystem.documentDirectory}pending_login_logs.json`;

export const useLoginAuditMobile = () => {
  const [pendingLogs, setPendingLogs] = useState([]);

  // Carregar logs pendentes ao inicializar o hook
  useEffect(() => {
    loadPendingLogs();
  }, []);

  // Carregar logs pendentes do armazenamento local
  const loadPendingLogs = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(PENDING_LOGS_FILE);
      
      if (fileExists.exists) {
        const content = await FileSystem.readAsStringAsync(PENDING_LOGS_FILE);
        const logs = JSON.parse(content);
        setPendingLogs(logs);
      }
    } catch (error) {
      console.error('Erro ao carregar logs pendentes:', error);
    }
  };

  // Salvar logs pendentes no armazenamento local
  const savePendingLogs = async (logs) => {
    try {
      await FileSystem.writeAsStringAsync(
        PENDING_LOGS_FILE,
        JSON.stringify(logs)
      );
      setPendingLogs(logs);
    } catch (error) {
      console.error('Erro ao salvar logs pendentes:', error);
    }
  };

  // Obter informações do dispositivo móvel
  const getMobileDeviceInfo = () => {
    const appVersion = Constants.expoConfig?.version || '1.0.8'; // Usa a versão do package.json como fallback
    
    return {
      device_type: 'mobile',
      platform: Platform.OS, // 'ios' ou 'android'
      app_version: appVersion,
      device_model: Platform.OS === 'ios' ? 'iPhone' : 'Android Device', // Simplificado sem react-native-device-info
      os_version: String(Platform.Version),
      browser: 'WebView',
      user_agent: 'React Native App',
      accept_language: 'pt-BR', // Padrão para o app brasileiro
      referer: null // Não aplicável em apps mobile
    };
  };

  // Enviar log para a Edge Function
  const sendLogToEdgeFunction = async (logData) => {
    try {
      const { data, error } = await supabase.functions.invoke('log-login-attempt', {
        body: logData
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao enviar log para Edge Function:', error);
      return { success: false, error };
    }
  };

  // Registrar tentativa de login
  const logLoginAttempt = async (attemptData) => {
    const startTime = Date.now();
    const deviceInfo = getMobileDeviceInfo();
    
    // Combinar dados da tentativa com informações do dispositivo
    const logData = {
      ...attemptData,
      ...deviceInfo,
      request_duration_ms: attemptData.request_duration_ms || (Date.now() - startTime)
    };

    // Tentar enviar o log
    const { success } = await sendLogToEdgeFunction(logData);

    // Se falhar, adicionar aos logs pendentes
    if (!success) {
      const pendingLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        data: logData
      };
      
      const updatedLogs = [...pendingLogs, pendingLog];
      await savePendingLogs(updatedLogs);
    }

    return success;
  };

  // Tentar reenviar logs pendentes
  const retryPendingLogs = async () => {
    if (pendingLogs.length === 0) return;

    const remainingLogs = [...pendingLogs];
    const successfulLogs = [];

    // Tentar enviar cada log pendente
    for (const log of pendingLogs) {
      const { success } = await sendLogToEdgeFunction(log.data);
      
      if (success) {
        successfulLogs.push(log.id);
        const index = remainingLogs.findIndex(l => l.id === log.id);
        if (index !== -1) {
          remainingLogs.splice(index, 1);
        }
      }
    }

    // Atualizar logs pendentes se algum foi enviado com sucesso
    if (successfulLogs.length > 0) {
      await savePendingLogs(remainingLogs);
    }

    return {
      successful: successfulLogs.length,
      remaining: remainingLogs.length
    };
  };

  return {
    logLoginAttempt,
    retryPendingLogs,
    pendingLogsCount: pendingLogs.length
  };
};
