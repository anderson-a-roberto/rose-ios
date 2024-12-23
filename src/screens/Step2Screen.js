import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

const Step2Screen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const step1Data = route.params?.step1Data || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        
        <Text style={styles.stepText}>Etapa 2 de 3</Text>
        <Text style={styles.title}>Faça seu Cadastro!</Text>

        <Button
          mode="contained"
          style={styles.testDataButton}
          labelStyle={[styles.buttonLabel, { color: 'white' }]}
          onPress={() => {
            setEmail('teste@email.com');
            setTelefone('11999999999');
          }}
        >
          Preencher com dados de teste
        </Button>

        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          placeholder="Apenas números"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={[styles.button, styles.buttonVoltar]}
            labelStyle={[styles.buttonLabel, { color: 'white' }]}
            onPress={() => navigation.goBack()}
          >
            Voltar
          </Button>

          <Button
            mode="contained"
            style={[styles.button, styles.buttonContinuar]}
            labelStyle={styles.buttonLabel}
            onPress={() => navigation.navigate('Step3', {
              step1Data,
              step2Data: {
                email,
                telefone
              }
            })}
          >
            Continuar
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF1493',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  stepText: {
    color: 'white',
    marginBottom: 10,
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonLabel: {
    color: '#FF1493',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonVoltar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonContinuar: {
    backgroundColor: 'white',
  },
  testDataButton: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  }
});

export default Step2Screen; 