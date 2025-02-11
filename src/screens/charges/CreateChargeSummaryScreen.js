import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useCharge } from '../../contexts/ChargeContext';
import { supabase } from '../../config/supabase';
import useDashboard from '../../hooks/useDashboard';
import { SafeAreaView } from 'react-native-safe-area-context';

const DataItem = ({ label, value, valueStyle }) => (
  <View style={styles.dataItem}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={[styles.dataValue, valueStyle]}>{value}</Text>
  </View>
);

const CreateChargeSummaryScreen = ({ navigation }) => {
  const { chargeData, resetChargeData } = useCharge();
  const { userAccount, userTaxId } = useDashboard();
  const [loading, setLoading] = useState(false);
  const TAXA_BOLETO = 7.90;

  const formatCurrency = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };

  const formatRequestData = () => {
    // Converte data de dd/mm/yyyy para yyyy-mm-dd
    const [dia, mes, ano] = chargeData.dataVencimento.split('/');
    const dataVencimento = `${ano}-${mes}-${dia}T23:59:59Z`;

    return {
      externalId: `TEST${Date.now()}`,
      merchantCategoryCode: '0000',
      expirationAfterPayment: 30,
      duedate: dataVencimento,
      amount: parseFloat(chargeData.valor.replace(',', '.')),
      key: userTaxId,
      fines: {
        penalty: parseFloat(chargeData.multa) / 100,
        interest: parseFloat(chargeData.juros) / 100,
      },
      debtor: {
        name: chargeData.nome,
        document: chargeData.cpfCnpj.replace(/\D/g, ''),
        postalCode: chargeData.cep.replace(/\D/g, ''),
        publicArea: chargeData.rua,
        number: chargeData.numero,
        complement: chargeData.complemento,
        neighborhood: chargeData.bairro,
        city: chargeData.cidade,
        state: chargeData.estado
      },
      receiver: {
        document: userTaxId.replace(/\D/g, ''),
        account: userAccount
      }
    };
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      const { data: chargeResponse, error: chargeError } = await supabase.functions.invoke(
        'create-charge-v2',
        {
          body: formatRequestData()
        }
      );

      if (chargeError || chargeResponse?.status === 'ERROR') {
        throw new Error(chargeError?.message || chargeResponse?.error?.message || 'Erro ao criar cobrança');
      }

      // Limpa os dados do formulário
      resetChargeData();
      
      // Navega para tela de sucesso
      navigation.navigate('CreateChargeSuccess');

    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
      // TODO: Mostrar erro ao usuário
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Resumo da Cobrança</Text>
          <Text style={styles.subtitle}>
            Confira os dados antes de gerar o boleto
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Valor da Cobrança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores</Text>
          <DataItem 
            label="Valor da Cobrança" 
            value={formatCurrency(chargeData.valor)}
          />
          <DataItem 
            label="Taxa do boleto" 
            value={formatCurrency(TAXA_BOLETO)}
            valueStyle={styles.taxValue}
          />
        </View>

        {/* Multa e Juros */}
        {(chargeData.multa !== '0' || chargeData.juros !== '0') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Multas e Juros</Text>
            {chargeData.multa !== '0' && (
              <DataItem 
                label="Multa por Atraso" 
                value={`${chargeData.multa}%`}
              />
            )}
            {chargeData.juros !== '0' && (
              <DataItem 
                label="Juros ao Dia" 
                value={`${chargeData.juros}%`}
              />
            )}
          </View>
        )}

        {/* Datas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <DataItem 
            label="Data de Vencimento" 
            value={chargeData.dataVencimento}
          />
        </View>

        {/* Dados do Pagador */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Pagador</Text>
          <DataItem 
            label="Nome" 
            value={chargeData.nome}
          />
          <DataItem 
            label="CPF/CNPJ" 
            value={chargeData.cpfCnpj}
          />
          <DataItem 
            label="Endereço" 
            value={`${chargeData.rua}, ${chargeData.numero}${chargeData.complemento ? ` - ${chargeData.complemento}` : ''}`}
          />
          <DataItem 
            label="Bairro" 
            value={chargeData.bairro}
          />
          <DataItem 
            label="Cidade/UF" 
            value={`${chargeData.cidade}/${chargeData.estado}`}
          />
          <DataItem 
            label="CEP" 
            value={chargeData.cep}
          />
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleConfirm}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          loading={loading}
          disabled={loading}
        >
          GERAR BOLETO
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    color: '#E91E63',
    fontSize: 32,
    fontWeight: '300',
  },
  headerContent: {
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  dataItem: {
    marginBottom: 16,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  taxValue: {
    color: '#E91E63',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFF',
  },
});

export default CreateChargeSummaryScreen;
