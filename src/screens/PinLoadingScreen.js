import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../config/supabase';
import { useSession } from '../contexts/SessionContext';

export default function PinLoadingScreen({ navigation }) {
  const { user, setHasTransactionPin } = useSession();
  
  useEffect(() => {
    // Verificar o PIN do usuário quando a tela de carregamento for montada
    const checkPin = async () => {
      try {
        console.log('[PIN_LOADING] Verificando PIN para o usuário:', user?.id);
        
        if (!user) {
          console.log('[PIN_LOADING] Usuário não definido, redirecionando para Welcome');
          navigation.navigate('Welcome');
          return;
        }
        
        const { data, error } = await supabase
          .from('transaction_pins')
          .select('id')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('[PIN_LOADING] Erro ao consultar PIN:', error);
          // Em caso de erro, assumimos que o usuário não tem PIN
          setHasTransactionPin(false);
          navigation.navigate('TransactionPasswordCreate');
          return;
        }
        
        const userHasPin = data && data.length > 0;
        console.log('[PIN_LOADING] Resultado da consulta:', data);
        console.log('[PIN_LOADING] Usuário tem PIN configurado:', userHasPin);
        
        // Atualizar o estado no SessionContext
        setHasTransactionPin(userHasPin);
        
        // Navegar para a tela apropriada
        if (userHasPin) {
          console.log('[PIN_LOADING] Usuário já tem PIN, navegando para Dashboard');
          navigation.navigate('Dashboard2');
        } else {
          console.log('[PIN_LOADING] Usuário não tem PIN, navegando diretamente para tela de criação de PIN');
          navigation.navigate('TransactionPasswordCreate');
        }
      } catch (error) {
        console.error('[PIN_LOADING] Erro ao verificar PIN:', error);
        // Em caso de erro, assumimos que o usuário não tem PIN
        setHasTransactionPin(false);
        navigation.navigate('TransactionPasswordCreate');
      }
    };
    
    // Iniciar a verificação do PIN
    checkPin();
  }, [user, navigation, setHasTransactionPin]);
  
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
