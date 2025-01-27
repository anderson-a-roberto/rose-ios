import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BillSuccessModal = ({ visible, data, onClose }) => {
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
            name="check-circle" 
            size={48} 
            color="#4CAF50"
            style={styles.icon}
          />
          <Text style={styles.title}>Sucesso</Text>
          <Text style={styles.subtitle}>Pagamento realizado com sucesso</Text>

          <View style={styles.detailsContainer}>
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
              <Text style={[styles.value, styles.valueHighlight]}>
                {formatCurrency(data?.value || 0)}
              </Text>
            </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  detailGroup: {
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
  valueHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
    width: '100%',
  },
});

export default BillSuccessModal;
