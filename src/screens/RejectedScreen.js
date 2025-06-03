import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const RejectedScreen = ({ navigation, route }) => {
  // Receber parâmetros diretamente da rota
  const { reason } = route.params || {};
  
  // Log para depuração
  console.log('RejectedScreen: Dados recebidos da rota:', route.params);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="close-circle" size={80} color="white" style={styles.icon} />
        <Text style={styles.title}>Cadastro não aprovado</Text>
        <Text style={styles.message}>
          Infelizmente, seu cadastro não foi aprovado no momento.
        </Text>
        <Text style={styles.submessage}>
          Em caso de dúvida, fale com nossa equipe.
        </Text>
        
        {/* Motivo de reprovação temporariamente removido */}
        
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Welcome')}
          style={styles.button}
          buttonColor="#E91E63"
          textColor="white"
        >
          VOLTAR PARA O INÍCIO
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#682145',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  submessage: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.9,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 30,
    backgroundColor: '#E91E63',
    width: '80%',
    borderRadius: 8,
  },
  reasonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 16,
    width: '90%',
    marginBottom: 24,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  }
});

export default RejectedScreen;
