import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../config/supabase';
import { useSession } from '../contexts/SessionContext';

export default function TransactionPinLoadingScreen({ navigation }) {
  const { user, setHasTransactionPin } = useSession();

  // Verificar o PIN quando a tela for montada
  useEffect(() => {
    checkTransactionPin();
  }, []);

  // Função para verificar se o usuário tem PIN configurado
  const checkTransactionPin = async () => {
    try {
      console.log('[PIN_LOADING] Verificando PIN para o usuário:', user?.id);
      
      if (!user) {
        console.log('[PIN_LOADING] Usuário não autenticado, redirecionando para Welcome');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
        return;
      }
      
      // Consultar a tabela transaction_pins para verificar se o usuário tem PIN configurado
      const { data, error } = await supabase
        .from('transaction_pins')
        .select('id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('[PIN_LOADING] Erro ao consultar PIN:', error);
        // Em caso de erro, ir para o Dashboard por segurança
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard2' }],
        });
        return;
      }
      
      console.log('[PIN_LOADING] Resultado da consulta:', data);
      
      const hasPin = data && data.length > 0;
      console.log('[PIN_LOADING] Usuário tem PIN configurado:', hasPin);
      
      // Atualizar o estado global
      setHasTransactionPin(hasPin);
      
      // Navegar para a tela apropriada com base no resultado
      if (hasPin) {
        console.log('[PIN_LOADING] Usuário tem PIN, redirecionando para Dashboard');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard2' }],
        });
      } else {
        console.log('[PIN_LOADING] Usuário não tem PIN, redirecionando para tela de introdução');
        navigation.reset({
          index: 0,
          routes: [{ name: 'TransactionPasswordIntro' }],
        });
      }
    } catch (error) {
      console.error('[PIN_LOADING] Erro ao verificar PIN:', error);
      // Em caso de erro, ir para o Dashboard por segurança
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard2' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#682145" style={styles.loader} />
        <Text style={styles.text}>Verificando suas informações...</Text>
        <Text style={styles.subtext}>Por favor, aguarde um momento.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
