import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ThankYouScreen = ({ navigation, route }) => {
  // Receber parâmetros diretamente da rota
  const { documentNumber, accountType, status } = route.params || {};
  
  // Log para depuração
  console.log('ThankYouScreen: Dados recebidos da rota:', { documentNumber, accountType, status });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="check-circle" size={80} color="white" style={styles.icon} />
        <Text style={styles.title}>Obrigado!</Text>
        <Text style={styles.message}>
          Seu cadastro foi realizado com sucesso! Estamos analisando suas informações.
        </Text>
        <Text style={styles.submessage}>
          Fique atento ao seu e-mail cadastrado para os próximos passos.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Welcome')}
          style={styles.button}
          buttonColor="#E91E63"
          textColor="white"
        >
          Voltar para o início
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
    marginBottom: 16,
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
  buttonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ThankYouScreen;