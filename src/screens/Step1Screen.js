import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Checkbox, ActivityIndicator } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://abkhgnefvzlqqamfpyvd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia2hnbmVmdnpscXFhbWZweXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4ODU1MjgsImV4cCI6MjA0OTQ2MTUyOH0.K-xv30H1ULn7CSsi7yPbnofQR6PsfxXdH7W-WQAtZYc'
);

// Funções auxiliares de formatação e validação
const formatCPF = (cpf) => cpf.replace(/\D/g, '');

const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55')) {
    return '+55' + cleaned;
  }
  return '+' + cleaned;
};

const formatDate = (date) => {
  // Converte de DD/MM/YYYY para YYYY-MM-DD
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

const validateFields = (data) => {
  const errors = [];
  
  if (data.documentNumber.length !== 11) {
    errors.push('CPF deve ter 11 dígitos');
  }
  
  if (!data.phoneNumber.match(/^\+55\d{10,11}$/)) {
    errors.push('Telefone deve estar no formato +55DDD999999999');
  }
  
  if (!data.email.includes('@')) {
    errors.push('E-mail inválido');
  }
  
  if (!data.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    errors.push('Data de nascimento deve estar no formato YYYY-MM-DD');
  }

  if (data.password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres');
  }
  
  return errors;
};

const Step1Screen = ({ navigation }) => {
  // Estados originais do Step1
  const [nome, setNome] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  
  // Estados para o formulário Celcoin
  const [nomeSocial, setNomeSocial] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [politicamenteExposta, setPoliticamenteExposta] = useState(false);
  const [senha, setSenha] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const preencherDadosTeste = () => {
    // Dados do formulário original
    setNome('Fernando Luz');
    setNomeMae('Vanda Matias');
    setDataNascimento('31/08/1987');
    setCpf('36686545066');
    
    // Dados do formulário Celcoin
    setNomeSocial('Fernando');
    setEmail('fernando@gmail.com');
    setTelefone('+5511991212273');
    setPoliticamenteExposta(false);
    setCep('06618000');
    setRua('av antonio bardela');
    setNumero('21');
    setComplemento('R42');
    setBairro('jd sao luiz');
    setCidade('jandira');
    setEstado('SP');
  };

  const handleSubmitOnboarding = async () => {
    setLoading(true);
    try {
      const onboardingData = {
        fullName: nome,
        socialName: nomeSocial,
        documentNumber: formatCPF(cpf),
        birthDate: formatDate(dataNascimento),
        motherName: nomeMae,
        email: email,
        phoneNumber: formatPhone(telefone),
        isPoliticallyExposedPerson: politicamenteExposta,
        password: senha,
        address: {
          postalCode: cep.replace(/\D/g, ''),
          street: rua,
          number: numero,
          addressComplement: complemento || undefined,
          neighborhood: bairro,
          city: cidade,
          state: estado.toUpperCase()
        }
      };

      // Validar campos antes de enviar
      const validationErrors = validateFields(onboardingData);
      if (validationErrors.length > 0) {
        throw new Error('Erros de validação:\n' + validationErrors.join('\n'));
      }

      // 1. Criar conta de usuário no Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formatCPF(cpf) + '@temp.com', // Usando CPF como identificador
        password: senha,
        options: {
          data: {
            cpf: formatCPF(cpf),
            full_name: nome
          }
        }
      });

      if (authError) throw new Error('Erro ao criar conta: ' + authError.message);

      // 2. Inserir dados na tabela profiles
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        document_number: formatCPF(cpf),
        full_name: nome,
        birth_date: formatDate(dataNascimento),
        mother_name: nomeMae,
        email: email,
        phone_number: formatPhone(telefone),
        social_name: nomeSocial,
        is_politically_exposed_person: politicamenteExposta,
        address_postal_code: cep.replace(/\D/g, ''),
        address_street: rua,
        address_number: numero,
        address_complement: complemento || null,
        address_neighborhood: bairro,
        address_city: cidade,
        address_state: estado.toUpperCase()
      });

      if (profileError) throw new Error('Erro ao salvar perfil: ' + profileError.message);

      // 3. Gerar código do cliente e enviar para Celcoin
      const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-client-code');
      if (codeError) throw new Error('Erro ao gerar código do cliente: ' + codeError.message);
      
      const formDataWithCode = {
        ...onboardingData,
        clientCode: codeData.code
      };

      const { data, error } = await supabase.functions.invoke('submit-onboarding', {
        body: formDataWithCode
      });

      if (error) throw error;
      setResponse({ type: 'success', message: 'Cadastro realizado com sucesso!' });
      
      // Limpar formulário após sucesso
      setNomeSocial('');
      setEmail('');
      setTelefone('');
      setPoliticamenteExposta(false);
      setSenha('');
      setCep('');
      setRua('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCidade('');
      setEstado('');

      // Navegar para a tela de agradecimento
      navigation.navigate('ThankYou');
      
    } catch (error) {
      console.error('Erro:', error);
      setResponse({ 
        type: 'error', 
        message: error.message.includes('Erros de validação') 
          ? error.message 
          : 'Erro ao realizar cadastro: ' + error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        
        <Text style={styles.stepText}>Etapa 1 de 3</Text>
        <Text style={styles.title}>Faça seu Cadastro!</Text>

        <Button
          mode="contained"
          style={[styles.testDataButton, { marginBottom: 20 }]}
          labelStyle={[styles.buttonLabel, { color: 'white' }]}
          onPress={preencherDadosTeste}
        >
          Preencher Todos os Dados de Teste
        </Button>

        <Button
          mode="contained"
          style={styles.testDataButton}
          labelStyle={[styles.buttonLabel, { color: 'white' }]}
          onPress={() => {
            setNome('João da Silva');
            setNomeMae('Maria da Silva');
            setDataNascimento('01/01/1990');
            setCpf('12345678900');
          }}
        >
          Preencher com dados de teste
        </Button>

        <Button
          mode="contained"
          style={[styles.testDataButton, { marginTop: 10, marginBottom: 10 }]}
          labelStyle={[styles.buttonLabel, { color: 'white' }]}
          onPress={() => navigation.navigate('KYC')}
        >
          Iniciar KYC Celcoin
        </Button>

        <Button
          mode="contained"
          style={[styles.testDataButton, { marginTop: 10 }]}
          labelStyle={[styles.buttonLabel, { color: 'white' }]}
          onPress={async () => {
            try {
              const { data, error } = await supabase.functions.invoke('get-celcoin-token');
              if (error) throw error;
              setCpf(JSON.stringify(data));
            } catch (error) {
              console.error('Erro:', error);
              setCpf('Erro ao obter token: ' + error.message);
            }
          }}
        >
          Teste Celcoin
        </Button>

        {cpf ? (
          <Text style={styles.tokenText}>
            Resposta: {cpf}
          </Text>
        ) : null}

        <TextInput
          label="Nome Completo"
          value={nome}
          onChangeText={setNome}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Nome da Mãe"
          value={nomeMae}
          onChangeText={setNomeMae}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="Data de Nascimento"
          value={dataNascimento}
          onChangeText={setDataNascimento}
          mode="outlined"
          style={styles.input}
          placeholder="dd/mm/aaaa"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <TextInput
          label="CPF"
          value={cpf}
          onChangeText={setCpf}
          mode="outlined"
          style={styles.input}
          placeholder="Apenas números"
          keyboardType="numeric"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <View style={styles.divider} />
        <Text style={styles.title}>Cadastro Celcoin</Text>

        <TextInput
          label="Nome Social"
          value={nomeSocial}
          onChangeText={setNomeSocial}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: '#FF1493' } }}
        />

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
          keyboardType="phone-pad"
          placeholder="+5511999999999"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={politicamenteExposta ? 'checked' : 'unchecked'}
            onPress={() => setPoliticamenteExposta(!politicamenteExposta)}
            color="#FF1493"
          />
          <Text style={styles.checkboxLabel}>Pessoa Politicamente Exposta</Text>
        </View>

        <TextInput
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          mode="outlined"
          style={styles.input}
          secureTextEntry={true}
          theme={{ colors: { primary: '#FF1493' } }}
          placeholder="Mínimo 6 caracteres"
        />

        <Text style={styles.subtitle}>Endereço</Text>

        <TextInput
          label="CEP"
          value={cep}
          onChangeText={setCep}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
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
          placeholder="SP"
          theme={{ colors: { primary: '#FF1493' } }}
        />

        {response && (
          <Text style={[styles.responseText, { color: response.type === 'success' ? '#4CAF50' : '#F44336' }]}>
            {response.message}
          </Text>
        )}

        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={handleSubmitOnboarding}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : 'Enviar Cadastro'}
        </Button>

        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('Step2', {
            step1Data: {
              nome,
              nomeMae,
              dataNascimento,
              cpf
            }
          })}
        >
          Continuar
        </Button>
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
    backgroundColor: '#FFC0CB',
    borderRadius: 5,
    marginBottom: 20,
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: '#FF69B4',
    borderRadius: 5,
  },
  stepText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
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
  button: {
    marginTop: 20,
    backgroundColor: '#FF69B4',
    padding: 5,
  },
  testDataButton: {
    backgroundColor: '#FF69B4',
    marginBottom: 20,
    padding: 5,
  },
  buttonLabel: {
    fontSize: 16,
    color: 'white',
  },
  tokenText: {
    color: 'white',
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 20,
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    color: 'white',
    marginLeft: 8,
  },
  responseText: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  }
});

export default Step1Screen;