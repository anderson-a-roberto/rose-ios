import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { amount, pixKey, dictData, accountData, error: routeError } = route.params || {};
  
  // Se houver erro passado via rota, mostrar alerta
  React.useEffect(() => {
    if (routeError) {
      setError(routeError);
      Alert.alert('Erro', routeError);
    }
  }, [routeError]);

  // Função para navegar para a tela de verificação de PIN
  const handleTransfer = () => {
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
    
    // Preparar dados para a tela de verificação de PIN
    const transferData = {
      amount,
      description: description || "Transferência PIX",
      beneficiary: {
        name: dictData.name,
        taxId: dictData.documentnumber,
        bank: dictData.participant
      }
    };
    
    // Navegar para a tela de verificação de PIN
    navigation.navigate('PixTransferPin', {
      transferData,
      payload
    });
  };
  
  // Função para executar a transferência após verificação do PIN
  const executeTransfer = async () => {
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Confirmar</Text>
            <Text style={styles.subtitle}>Confira os dados da transferência</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Valor da transferência</Text>
            <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
          </View>

          <Divider style={styles.divider} />

          {/* Beneficiary Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Para</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{dictData.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CPF/CNPJ</Text>
              <Text style={styles.infoValue}>{dictData.documentnumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Instituição</Text>
              <Text style={styles.infoValue}>{dictData.participant}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chave PIX</Text>
              <Text style={styles.infoValue}>{pixKey}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <TextInput
              mode="outlined"
              label="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              maxLength={140}
              multiline
              numberOfLines={3}
              outlineColor="#E0E0E0"
              activeOutlineColor="#E91E63"
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        {/* Transfer Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleTransfer}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading}
          >
            TRANSFERIR
          </Button>
        </View>
        

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF'
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  amountContainer: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    color: '#000',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFF',
  },
  errorText: {
    color: '#E91E63',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
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

export default PixTransferConfirmScreen;
