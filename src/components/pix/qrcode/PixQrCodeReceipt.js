import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const PixQrCodeReceipt = ({ paymentResult, emvData, dictData }) => {
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
          <Text style={styles.value}>{dictData?.psp_name || dictData?.participant || 'Não informado'}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalhes da Transação</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>Pagamento PIX via QR Code</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.value}>{transactionId}</Text>
        </View>
        {emvData?.additionalDataField?.referenceLabel && (
          <View style={styles.row}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.value}>{emvData.additionalDataField.referenceLabel}</Text>
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
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
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
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
});

export default PixQrCodeReceipt;
