import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';

const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const generateClientCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const PixTransferConfirmScreen = ({ navigation, route }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { amount, pixKey, dictData, accountData } = route.params;

  const handleTransfer = async () => {
    try {
      setLoading(true);
      setError(null);

      // Estruturar payload completo
      const payload = {
        debitParty: {
          account: accountData.account,
          branch: "1",
          taxId: accountData.documentNumber,
          name: "Usuário", // TODO: Adicionar nome do usuário
          accountType: "TRAN"
        },
        creditParty: {
          bank: dictData.participant,
          key: pixKey,
          branch: dictData.branch || "1",
          taxId: dictData.documentnumber,
          name: dictData.name,
          accountType: "TRAN"
        },
        amount: amount,
        clientCode: generateClientCode(),
        endToEndId: dictData.endtoendid,
        initiationType: "DICT",
        paymentType: "IMMEDIATE",
        urgency: "HIGH",
        transactionType: "TRANSFER",
        remittanceInformation: description || "Transferência PIX"
      };

      // Realizar transferência PIX
      const { data: transferResponse, error: transferError } = await supabase.functions.invoke(
        'pix-cash-out',
        {
          body: payload
        }
      );

      if (transferError) throw transferError;

      if (transferResponse.status === 'ERROR') {
        throw new Error(transferResponse.error?.message || 'Erro ao realizar transferência PIX');
      }

      // Navegar para tela de loading
      navigation.navigate('PixTransferLoading', {
        transferData: {
          ...transferResponse.body,
          amount,
          description: description || "Transferência PIX",
          beneficiary: {
            name: dictData.name,
            taxId: dictData.documentnumber,
            bank: dictData.participant
          }
        }
      });

    } catch (err) {
      console.error('Erro ao realizar transferência:', err);
      setError(err.message || 'Erro ao realizar transferência');
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
        <Text style={styles.headerTitle}>Transferir</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>
        Confirme todos os dados antes de realizar a transferência
      </Text>

      {/* Transfer Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Valor</Text>
          <Text style={styles.detailValue}>{formatCurrency(amount)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Nome</Text>
          <Text style={styles.detailValue}>{dictData.name}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>CPF/CNPJ</Text>
          <Text style={styles.detailValue}>
            {dictData.documentnumber.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**')}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Instituição Financeira</Text>
          <Text style={styles.detailValue}>{dictData.participant}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Data</Text>
          <Text style={styles.detailValue}>
            {new Date().toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.detailLabel}>Descrição</Text>
          <TextInput
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            placeholder="Opcional"
            style={styles.descriptionInput}
            maxLength={140}
          />
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleTransfer}
          style={styles.continueButton}
          labelStyle={styles.continueButtonLabel}
          loading={loading}
          disabled={loading}
        >
          CONTINUAR
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
          disabled={loading}
        >
          CANCELAR TRANSFERÊNCIA
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionInput: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 25,
    marginBottom: 8,
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#fff',
  },
  cancelButton: {
    borderColor: '#1B1B1B',
    borderRadius: 25,
  },
  cancelButtonLabel: {
    fontSize: 16,
    color: '#1B1B1B',
  },
});

export default PixTransferConfirmScreen;
