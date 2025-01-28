import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PixProcessingModal = ({ visible, onDismiss, transferData }) => {
  const formatValue = (value) => {
    return `R$ ${Number(value).toFixed(2)}`.replace('.', ',');
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="bank-transfer" size={32} color="#FF1493" />
          <Text style={styles.title}>PIX em Processamento</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Destinatário:</Text>
            <Text style={styles.value}>{transferData?.beneficiaryName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Chave PIX:</Text>
            <Text style={styles.value}>{transferData?.pixKey}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.value}>{formatValue(transferData?.value)}</Text>
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            Seu PIX está sendo processado. Em breve a transferência será concluída.
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={onDismiss}
          buttonColor="#FF1493"
          style={styles.button}
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 24,
    gap: 16,
  },
  infoRow: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  messageContainer: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  message: {
    color: '#997000',
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});

export default PixProcessingModal;
