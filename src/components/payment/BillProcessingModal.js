import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BillProcessingModal = ({ visible, data, onClose }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.container}
      >
        <View style={styles.content}>
          <MaterialCommunityIcons 
            name="file-document-outline" 
            size={24} 
            color="#FF1493"
            style={styles.icon}
          />
          <Text style={styles.title}>Boleto em Processamento</Text>

          <View style={styles.detailGroup}>
            <Text style={styles.label}>Beneficiário:</Text>
            <Text style={styles.value}>{data?.assignor}</Text>
          </View>

          <View style={styles.detailGroup}>
            <Text style={styles.label}>Código de Barras:</Text>
            <Text style={styles.value}>{data?.barCode?.digitable}</Text>
          </View>

          <View style={styles.detailGroup}>
            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.value}>{formatCurrency(data?.value || 0)}</Text>
          </View>

          <View style={styles.alert}>
            <Text style={styles.alertText}>
              Seu pagamento está sendo processado. Em breve será concluído.
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={onClose}
            style={styles.button}
            buttonColor="#FF1493"
          >
            Fechar
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  detailGroup: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  alert: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    width: '100%',
  },
  alertText: {
    color: '#856404',
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    width: '100%',
  },
});

export default BillProcessingModal;
