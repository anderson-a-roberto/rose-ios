import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Text, Button } from 'react-native-paper';

const PixDictDialog = ({ visible, onDismiss, onConfirm, beneficiaryName }) => {
  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Consulta PIX Dict</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nome do usuário:</Text>
          <Text style={styles.value}>{beneficiaryName}</Text>
        </View>

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            style={styles.button}
            buttonColor="#FF1493"
          >
            Confirmar
          </Button>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});

export default PixDictDialog;
