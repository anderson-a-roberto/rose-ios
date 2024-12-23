import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

const ThankYouScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Obrigado!</Text>
        <Text style={styles.message}>
          Seu cadastro foi realizado com sucesso! Em breve você receberá uma notificação para concluir seu cadastro.
        </Text>
        <Text style={styles.submessage}>
          Fique atento ao seu e-mail e telefone cadastrados.
        </Text>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('LoginCPF')}
        >
          Voltar para Login
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF1493',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  submessage: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 30,
    backgroundColor: 'white',
    width: '80%',
  },
  buttonLabel: {
    color: '#FF1493',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ThankYouScreen;