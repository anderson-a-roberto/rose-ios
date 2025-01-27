import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Text, Button } from 'react-native-paper';

const DeletePixKeyDialog = ({ visible, onDismiss, onConfirm, loading }) => {
  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Excluir Chave PIX</Text>
        <Text style={styles.message}>
          Tem certeza que deseja excluir esta chave PIX? Esta ação não poderá ser desfeita.
        </Text>

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            style={styles.button}
            buttonColor="#F44336"
            loading={loading}
          >
            Excluir
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
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
  },
});

export default DeletePixKeyDialog;
