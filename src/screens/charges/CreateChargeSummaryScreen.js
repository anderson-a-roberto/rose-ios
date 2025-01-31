import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCharge } from '../../contexts/ChargeContext';
import { supabase } from '../../config/supabase';
import useDashboard from '../../hooks/useDashboard';

const DataItem = ({ label, value }) => (
  <View style={styles.dataItem}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value}</Text>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Resumo</Text>
        <Text style={styles.subtitle}>Dados do Boleto</Text>

        {/* Valor da Cobrança */}
        <View style={styles.section}>
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
            {chargeData.multa !== '0' && (
              <DataItem 
                label="Multa" 
                value={`${chargeData.multa}%`}
              />
            )}
            {chargeData.juros !== '0' && (
              <DataItem 
                label="Juros" 
                value={`${chargeData.juros}%`}
              />
            )}
          </View>
        )}

        {/* Datas */}
        <View style={styles.section}>
          <DataItem 
            label="Data de Vencimento" 
            value={chargeData.dataVencimento}
          />
        </View>

        {/* Assunto */}
        <View style={styles.section}>
          <DataItem 
            label="Assunto do Boleto" 
            value="Cobrança"
          />
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <Button
        mode="contained"
        onPress={handleConfirm}
        style={styles.confirmButton}
        labelStyle={styles.confirmButtonLabel}
        loading={loading}
        disabled={loading}
      >
        CONFIRMAR
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 24,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    color: '#000',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  dataItem: {
    marginBottom: 16,
  },
  dataItem: {
    marginBottom: 16,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    color: '#000',
  },
  taxValue: {
    color: '#FF0000',
  },
  confirmButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginVertical: 24,
    borderRadius: 25,
  },
  confirmButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default CreateChargeSummaryScreen;
