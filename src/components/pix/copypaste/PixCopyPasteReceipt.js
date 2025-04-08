import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const PixCopyPasteReceipt = ({ paymentResult, emvData, dictData }) => {
  // Formata o valor para exibição
  const formatValue = (value) => {
    if (!value) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  // Formata CPF/CNPJ
  const formatDocument = (doc) => {
    if (!doc) return '';
    
    // CPF
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // CNPJ
    else if (doc.length === 14) {
      return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return doc;
  };

  // Formata data e hora
  const formatDateTime = (dateString) => {
    if (!dateString) {
      const now = new Date();
      return {
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR')
      };
    }
    
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR')
    };
  };

  const transactionDateTime = formatDateTime(paymentResult?.data?.createdAt);
  const amount = emvData?.transactionAmount || paymentResult?.data?.amount || 0;
  const transactionId = paymentResult?.data?.transactionId || 'Não disponível';
  const status = paymentResult?.data?.status || 'PROCESSING';

  return (
    <View style={styles.container}>
      <Text style={styles.receiptTitle}>Comprovante de Pagamento</Text>
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Data:</Text>
          <Text style={styles.value}>{transactionDateTime.date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.value}>{transactionDateTime.time}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Valor:</Text>
          <Text style={[styles.value, styles.amount]}>{formatValue(amount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, styles.status]}>
            {status === 'COMPLETED' ? 'CONCLUÍDO' : 
             status === 'PROCESSING' ? 'EM PROCESSAMENTO' : 
             status === 'FAILED' ? 'FALHOU' : 
             status === 'CONFIRMED' ? 'CONFIRMADO' : 
             status === 'PENDING' ? 'PENDENTE' : 
             status === 'CANCELLED' ? 'CANCELADO' : 
             status}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Destinatário</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{dictData?.name || 'Não informado'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>CPF/CNPJ:</Text>
          <Text style={styles.value}>{formatDocument(dictData?.documentnumber) || 'Não informado'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Instituição:</Text>
          <Text style={styles.value}>{dictData?.participantname || dictData?.participant || 'Não informado'}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Transação</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.value}>{transactionId}</Text>
        </View>
        {emvData?.description && (
          <View style={styles.row}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.value}>{emvData.description}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: '30%',
  },
  value: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    fontWeight: '500',
  },
  amount: {
    color: '#E91E63',
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 8,
  },
});

export default PixCopyPasteReceipt;
