import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, Snackbar } from 'react-native-paper';
import MaskInput from 'react-native-mask-input';
import { supabase } from '../../config/supabase';
import useDashboard from '../../hooks/useDashboard';

export default function CreateChargeForm({ onBack }) {
  const { userAccount, userTaxId, loading: dashboardLoading, error: dashboardError } = useDashboard();
  const [formData, setFormData] = useState({
    // Informações do Pagador
    nome: '',
    cpfCnpj: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    
    // Informações do Beneficiário (preenchidas automaticamente)
    beneficiarioCpfCnpj: '',
    conta: '',
    
    // Detalhes da Transação
    identificadorExterno: `TEST${Date.now()}`,
    codigoCategoria: '0000',
    diasExpiracao: '30',
    dataVencimento: '',
    valor: '',
    chavePix: ''
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    if (userTaxId && userAccount) {
      setFormData(prev => ({
        ...prev,
        beneficiarioCpfCnpj: userTaxId,
        conta: userAccount,
        chavePix: userTaxId
      }));
    }
  }, [userTaxId, userAccount]);

  const handleFillTestData = () => {
    setFormData({
      ...formData,
      nome: "Marcos Samuel Duarte",
      cpfCnpj: "39064256810",
      cep: "06463035",
      rua: "Rua Mãe D'Água",
      numero: "1004",
      complemento: "apto 123",
      bairro: "Jardim Mutinga",
      cidade: "Barueri",
      estado: "SP",
      dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      valor: "100,00"
    });
  };

  const formatRequestData = () => {
    const valor = parseFloat(formData.valor.replace('.', '').replace(',', '.'));
    
    // Converte data de dd/mm/yyyy para yyyy-mm-dd
    const [dia, mes, ano] = formData.dataVencimento.split('/');
    const dataVencimento = `${ano}-${mes}-${dia}T23:59:59Z`;

    return {
      externalId: formData.identificadorExterno,
      merchantCategoryCode: formData.codigoCategoria,
      expirationAfterPayment: parseInt(formData.diasExpiracao),
      duedate: dataVencimento,
      amount: valor,
      key: formData.chavePix,
      debtor: {
        name: formData.nome,
        document: formData.cpfCnpj.replace(/\D/g, ''),
        postalCode: formData.cep.replace(/\D/g, ''),
        publicArea: formData.rua,
        number: formData.numero,
        complement: formData.complemento,
        neighborhood: formData.bairro,
        city: formData.cidade,
        state: formData.estado
      },
      receiver: {
        document: formData.beneficiarioCpfCnpj.replace(/\D/g, ''),
        account: formData.conta
      }
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const { data: chargeResponse, error: chargeError } = await supabase.functions.invoke(
        'create-charge-v2',
        {
          body: formatRequestData()
        }
      );

      if (chargeError || chargeResponse.status === 'ERROR') {
        throw new Error(chargeError?.message || chargeResponse?.error?.message || 'Erro ao criar cobrança');
      }

      setSnackbar({ visible: true, message: 'Cobrança criada com sucesso!', type: 'success' });
      console.log('Charge created successfully:', chargeResponse);

    } catch (error) {
      console.error('Erro:', error);
      setSnackbar({ visible: true, message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (dashboardLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  if (dashboardError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar: {dashboardError}</Text>
        <Button mode="contained" onPress={onBack}>Voltar</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={styles.backButton}
        >
          Voltar
        </Button>
        <Button
          mode="contained"
          onPress={handleFillTestData}
          style={styles.testButton}
        >
          Preencher Dados de Teste
        </Button>
      </View>

      <Text style={styles.title}>Criar Cobrança</Text>

      {/* Informações do Pagador */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Informações do Pagador</Text>
        
        <TextInput
          label="Nome"
          value={formData.nome}
          onChangeText={(text) => setFormData({ ...formData, nome: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { text: '#000000' } }}
        />

        <TextInput
          label="CPF/CNPJ"
          value={formData.cpfCnpj}
          onChangeText={(text) => setFormData({ ...formData, cpfCnpj: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { text: '#000000' } }}
          render={props => (
            <MaskInput
              {...props}
              mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
            />
          )}
        />

        <TextInput
          label="CEP"
          value={formData.cep}
          onChangeText={(text) => setFormData({ ...formData, cep: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { text: '#000000' } }}
          render={props => (
            <MaskInput
              {...props}
              mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]}
            />
          )}
        />

        <TextInput
          label="Rua"
          value={formData.rua}
          onChangeText={(text) => setFormData({ ...formData, rua: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { text: '#000000' } }}
        />

        <View style={styles.row}>
          <TextInput
            label="Número"
            value={formData.numero}
            onChangeText={(text) => setFormData({ ...formData, numero: text })}
            style={[styles.input, styles.flex1, { marginRight: 8 }]}
            mode="outlined"
            theme={{ colors: { text: '#000000' } }}
          />

          <TextInput
            label="Complemento"
            value={formData.complemento}
            onChangeText={(text) => setFormData({ ...formData, complemento: text })}
            style={[styles.input, styles.flex2]}
            mode="outlined"
            theme={{ colors: { text: '#000000' } }}
          />
        </View>

        <TextInput
          label="Bairro"
          value={formData.bairro}
          onChangeText={(text) => setFormData({ ...formData, bairro: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { text: '#000000' } }}
        />

        <View style={styles.row}>
          <TextInput
            label="Cidade"
            value={formData.cidade}
            onChangeText={(text) => setFormData({ ...formData, cidade: text })}
            style={[styles.input, styles.flex2, { marginRight: 8 }]}
            mode="outlined"
            theme={{ colors: { text: '#000000' } }}
          />

          <TextInput
            label="Estado"
            value={formData.estado}
            onChangeText={(text) => setFormData({ ...formData, estado: text })}
            style={[styles.input, styles.flex1]}
            mode="outlined"
            theme={{ colors: { text: '#000000' } }}
          />
        </View>
      </Surface>

      {/* Detalhes da Transação */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Detalhes da Transação</Text>

        <TextInput
          label="Data de Vencimento"
          value={formData.dataVencimento}
          onChangeText={(text) => setFormData({ ...formData, dataVencimento: text })}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { text: '#000000' } }}
          render={props => (
            <MaskInput
              {...props}
              mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
            />
          )}
        />

        <TextInput
          label="Valor"
          value={formData.valor}
          onChangeText={(text) => setFormData({ ...formData, valor: text })}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          theme={{ colors: { text: '#000000' } }}
        />
      </Surface>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={loading}
        disabled={loading}
      >
        Criar Cobrança
      </Button>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={[
          styles.snackbar,
          snackbar.type === 'success' ? styles.successSnackbar : styles.errorSnackbar
        ]}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000000',
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: '#FF1493',
    padding: 8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
});
