import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';

const PixTransferLoadingScreen = ({ navigation, route }) => {
  const { transferData, payload } = route.params;
  const [error, setError] = useState(null);

  useEffect(() => {
    // Executar a transferência PIX
    const executeTransfer = async () => {
      try {
        console.log('[PixTransferLoadingScreen] Iniciando transferência PIX');
        console.log('[PixTransferLoadingScreen] Payload:', JSON.stringify(payload));
        
        // Realizar transferência PIX
        const { data: transferResponse, error: transferError } = await supabase.functions.invoke(
          'pix-cash-out',
          {
            body: payload
          }
        );

        console.log('[PixTransferLoadingScreen] Resposta:', JSON.stringify(transferResponse));
        
        if (transferError) {
          console.error('[PixTransferLoadingScreen] Erro na função:', transferError);
          throw transferError;
        }

        if (transferResponse.status === 'ERROR') {
          console.error('[PixTransferLoadingScreen] Erro na resposta:', transferResponse.error);
          throw new Error(transferResponse.error?.message || 'Erro ao realizar transferência PIX');
        }

        // Atualizar dados da transferência com a resposta
        const updatedTransferData = {
          ...transferData,
          ...transferResponse.body
        };

        // Navegar para tela de sucesso
        setTimeout(() => {
          navigation.replace('PixTransferSuccess', { transferData: updatedTransferData });
        }, 1500);
      } catch (err) {
        console.error('[PixTransferLoadingScreen] Erro ao realizar transferência:', err);
        setError(err.message || 'Erro ao realizar transferência');
        
        // Navegar para tela de erro (você pode criar uma tela específica para isso)
        setTimeout(() => {
          // Voltar para a tela de confirmação com mensagem de erro
          navigation.navigate('PixTransferConfirm', { 
            ...route.params,
            error: err.message || 'Erro ao realizar transferência' 
          });
        }, 1500);
      }
    };

    // Executar a transferência
    executeTransfer();

    // Não há necessidade de cleanup neste caso
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#682145" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={40}
              color="#FFF"
            />
          </View>
          <Text style={styles.title}>{error ? 'Erro' : 'Processando...'}</Text>
          <Text style={styles.subtitle}>
            {error ? error : 'Estamos processando sua transferência'}
          </Text>
          <ActivityIndicator 
            size="large" 
            color="#FFF" 
            style={styles.loader}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#682145'
  },
  container: {
    flex: 1,
    backgroundColor: '#682145',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
});

export default PixTransferLoadingScreen;
