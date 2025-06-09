import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../config/supabase';
import { useNavigation } from '@react-navigation/native';
import { useSession } from '../contexts/SessionContext';
import { useLoginAuditMobile } from '../hooks/useLoginAuditMobile';

const BlockCheckScreen = ({ route }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  const { documentNumber } = route.params || {};
  const { logLoginAttempt } = useLoginAuditMobile();
  
  useEffect(() => {
    checkIfBlocked();
  }, []);

  const checkIfBlocked = async () => {
    try {
      setLoading(true);
      const startTime = Date.now(); // Para medir a duração da requisição
      
      // Verificar se o usuário está bloqueado
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('document_number', documentNumber)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao verificar bloqueio:', error);
        // Log de erro na verificação de bloqueio
        await logLoginAttempt({
          document_number: documentNumber,
          success: false,
          error_type: "BLOCK_CHECK_ERROR",
          error_message: error.message,
          request_duration_ms: Date.now() - startTime,
        });
        // Em caso de erro, permitimos que o usuário prossiga para não bloquear o fluxo
        navigation.navigate('LoginPassword', { documentNumber });
        return;
      }
      
      // Se encontrou um registro, o usuário está bloqueado
      if (data) {
        console.log('Usuário bloqueado:', documentNumber);
        navigation.navigate('UserBlocked');
      } else {
        // Se não encontrou, prossegue para a tela de senha
        console.log('Usuário não bloqueado:', documentNumber);
        navigation.navigate('LoginPassword', { documentNumber });
      }
    } catch (error) {
      console.error('Erro inesperado ao verificar bloqueio:', error);
      // Log de erro inesperado
      await logLoginAttempt({
        document_number: documentNumber,
        success: false,
        error_type: "UNEXPECTED_BLOCK_CHECK_ERROR",
        error_message: error.message,
        request_duration_ms: Date.now() - startTime,
      });
      // Em caso de erro, permitimos que o usuário prossiga para não bloquear o fluxo
      navigation.navigate('LoginPassword', { documentNumber });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#682145" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default BlockCheckScreen;
