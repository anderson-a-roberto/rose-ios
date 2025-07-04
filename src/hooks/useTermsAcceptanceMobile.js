import { useState } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

// Constante para a versão atual dos termos
const CURRENT_TERMS_VERSION = 'v1.0';

// Verificar se estamos em ambiente web
const isWeb = Platform.OS === 'web';
console.log(`[DEBUG-TERMS] Ambiente detectado: ${isWeb ? 'WEB' : 'MOBILE'}, Platform.OS: ${Platform.OS}`);

export const useTermsAcceptanceMobile = () => {
  // Função para obter informações do dispositivo mobile
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

  // Função principal para registrar aceitação de termos
  const recordTermsAcceptance = async (termsAcceptanceData) => {
    try {
      console.log('[DEBUG-TERMS] Registrando aceitação de termos:', JSON.stringify(termsAcceptanceData));
      
      // Validar dados obrigatórios
      if (!termsAcceptanceData.document_number || !termsAcceptanceData.email) {
        console.error('[ERROR-TERMS] Dados obrigatórios ausentes:', 
          JSON.stringify({ 
            user_id: termsAcceptanceData.user_id, 
            document_number: termsAcceptanceData.document_number, 
            email: termsAcceptanceData.email 
          }));
        return { 
          success: false, 
          error: 'Dados obrigatórios ausentes (document_number, email)'
        };
      }
      
      // Preparar os dados para envio
      // Garantir que os dados do dispositivo estão no formato correto
      const deviceInfo = getMobileDeviceInfo();
      
      // Construir o payload base
      const payload = {
        ...termsAcceptanceData,
        ...deviceInfo,
        terms_version: termsAcceptanceData.terms_version || CURRENT_TERMS_VERSION,
        page_url: termsAcceptanceData.page_url || '/onboarding',
        form_step: termsAcceptanceData.form_step || 'submit',
        accepted_at: new Date().toISOString()
      };
      
      // Adicionar campos para geração de contrato se disponíveis
      if (termsAcceptanceData.full_name) {
        payload.full_name = termsAcceptanceData.full_name;
      }
      
      // Adicionar campos opcionais para pessoa física
      if (termsAcceptanceData.social_name) {
        payload.social_name = termsAcceptanceData.social_name;
      }
      
      if (termsAcceptanceData.birth_date) {
        payload.birth_date = termsAcceptanceData.birth_date;
      }
      
      if (termsAcceptanceData.mother_name) {
        payload.mother_name = termsAcceptanceData.mother_name;
      }
      
      if (termsAcceptanceData.phone_number) {
        payload.phone_number = termsAcceptanceData.phone_number;
      }
      
      // Adicionar dados de endereço se disponíveis
      if (termsAcceptanceData.address) {
        payload.address = termsAcceptanceData.address;
      }
      
      // Adicionar dados para pessoa jurídica se disponíveis
      if (termsAcceptanceData.business_name) {
        payload.business_name = termsAcceptanceData.business_name;
      }
      
      if (termsAcceptanceData.trading_name) {
        payload.trading_name = termsAcceptanceData.trading_name;
      }
      
      if (termsAcceptanceData.business_email) {
        payload.business_email = termsAcceptanceData.business_email;
      }
      
      if (termsAcceptanceData.contact_number) {
        payload.contact_number = termsAcceptanceData.contact_number;
      }
      
      console.log('[DEBUG-TERMS] Enviando dados para Edge Function record-terms-acceptance...');
      console.log('[DEBUG-TERMS] Payload:', JSON.stringify(payload));
      
      // Chamar a Edge Function
      const { data, error } = await supabase.functions.invoke('record-terms-acceptance', {
        body: payload
      });
      
      if (error) {
        console.error('[ERROR-TERMS] Erro ao registrar aceitação de termos via Edge Function:', error);
        return { success: false, error: error.message || 'Erro ao chamar Edge Function' };
      }
      
      console.log('[DEBUG-TERMS] Aceitação de termos registrada com sucesso via Edge Function:', data);
      return { success: true, data };
    } catch (error) {
      console.error('[ERROR-TERMS] Erro ao registrar aceitação de termos:', error);
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  };
  
  // Retornar as funções públicas do hook
  return {
    recordTermsAcceptance,
    getMobileDeviceInfo
  };
};
