import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { createOnboardingProposal } from '../config/celcoin';
import 'react-native-get-random-values';

const formatDate = (dateString) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

const Step3Screen = ({ navigation, route }) => {
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('Iniciando envio dos dados...');
      
      const step1Data = route.params?.step1Data || {};
      const step2Data = route.params?.step2Data || {};

      console.log('Dados Step1:', step1Data);
      console.log('Dados Step2:', step2Data);

      // Dados para o Supabase
      const dadosSupabase = {
        nome: step1Data.nome || '',
        nome_mae: step1Data.nomeMae || '',
        data_nascimento: formatDate(step1Data.dataNascimento),
        cpf: step1Data.cpf || '',
        email: step2Data.email || '',
        telefone: step2Data.telefone || '',
        cep: cep || '',
        rua: rua || '',
        numero: numero || '',
        complemento: complemento || '',
        bairro: bairro || '',
        cidade: cidade || '',
        estado: estado || ''
      };

      // Salvando no Supabase
      const { error: supabaseError } = await supabase
        .from('cadastros')
        .insert(dadosSupabase);

      if (supabaseError) {
        console.error('Erro do Supabase:', supabaseError);
        throw new Error('Erro ao salvar no banco de dados');
      }

      // Enviando para a Celcoin
      const celcoinResponse = await createOnboardingProposal({
        ...dadosSupabase,
        data_nascimento: step1Data.dataNascimento
      });

      console.log('Resposta da Celcoin:', celcoinResponse);

      // Se chegou até aqui, deu tudo certo
      navigation.navigate('ThankYou');
    } catch (error) {
      console.error('Erro completo:', error);
      Alert.alert(
        'Erro',
        'Não foi possível realizar o cadastro. ' + (error.message || error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        
        <Text style={styles.stepText}>Etapa 3 de 3</Text>
        <Text style={styles.title}>Faça seu Cadastro!</Text>

        <Button
          mode="contained"
          style={styles.testDataButton}
          labelStyle={[styles.buttonLabel, { color: 'white' }]}
          onPress={() => {
            setCep('12345678');
            setRua('Rua das Flores');
            setNumero('123');
            setComplemento('Apto 101');
            setBairro('Centro');
            setCidade('São Paulo');
            setEstado('SP');
          }}
        >
          Preencher com dados de teste
        </Button>

        <TextInput
          label="CEP"
          value={cep}
          onChangeText={setCep}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          placeholder="Apenas números"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Rua"
          value={rua}
          onChangeText={setRua}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Número"
          value={numero}
          onChangeText={setNumero}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Complemento"
          value={complemento}
          onChangeText={setComplemento}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Bairro"
          value={bairro}
          onChangeText={setBairro}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Cidade"
          value={cidade}
          onChangeText={setCidade}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Estado"
          value={estado}
          onChangeText={setEstado}
          mode="outlined"
          style={styles.input}
          placeholder="UF"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={[styles.button, styles.buttonVoltar]}
            labelStyle={[styles.buttonLabel, { color: 'white' }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            Voltar
          </Button>

          <Button
            mode="contained"
            style={[styles.button, styles.buttonFinalizar]}
            labelStyle={styles.buttonLabel}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Finalizar
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
  buttonFinalizar: {
    backgroundColor: 'white',
  },
  testDataButton: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  }
});

export default Step3Screen; 