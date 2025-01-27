import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TransferSuccessModal = ({ visible, data, onClose }) => {
  const getStatusConfig = () => {
    switch (data?.status) {
      case 'PROCESSING':
        return {
          icon: 'clock-outline',
          color: '#FFA000',
          title: 'Transferência em Processamento'
        };
      case 'SUCCESS':
        return {
          icon: 'check-circle',
          color: '#4CAF50',
          title: 'Transferência Realizada'
        };
      default:
        return {
          icon: 'alert-circle',
          color: '#F44336',
          title: 'Erro na Transferência'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name={statusConfig.icon}
          size={48} 
          color={statusConfig.color}
          style={styles.icon}
        />
        
        <Text style={[styles.title, { color: statusConfig.color }]}>
          {statusConfig.title}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Destinatário:</Text>
            <Text style={styles.value}>{data?.destinatario}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Conta:</Text>
            <Text style={styles.value}>{data?.conta}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.value}>{data?.valor}</Text>
          </View>

          {data?.status === 'PROCESSING' && (
            <Text style={[styles.processingText, { color: statusConfig.color }]}>
              Sua transferência está sendo processada. Em breve estará concluída.
            </Text>
          )}
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  processingText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    width: '100%',
  },
});

export default TransferSuccessModal;
