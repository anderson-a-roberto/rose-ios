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
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            style={styles.confirmButton}
            labelStyle={styles.confirmButtonLabel}
            loading={loading}
            textColor="#FFF"
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
    padding: 24,
    margin: 20,
    borderRadius: 12,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    borderColor: '#E91E63',
    borderWidth: 2,
  },
  cancelButtonLabel: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#E91E63',
  },
  confirmButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default DeletePixKeyDialog;
