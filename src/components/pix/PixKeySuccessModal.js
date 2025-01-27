import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PixKeySuccessModal = ({ visible, data, onClose }) => {
  return (
    <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="check-circle"
          size={48} 
          color="#4CAF50"
          style={styles.icon}
        />
        
        <Text style={styles.title}>Chave PIX Registrada</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{data?.keyType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Chave:</Text>
            <Text style={styles.value}>{data?.key}</Text>
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
    color: '#333',
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
  button: {
    width: '100%',
  },
});

export default PixKeySuccessModal;
