import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, RadioButton } from 'react-native-paper';

const PepInfoModal = ({ visible, onDismiss, onConfirm, initialValue = false }) => {
  const [isPep, setIsPep] = useState(initialValue ? 'yes' : 'no');

  const handleConfirm = () => {
    onConfirm(isPep === 'yes');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pessoa Politicamente Exposta</Text>
          <Text style={styles.subtitle}>
            Precisamos saber se você tem alguma relação com atividades políticas
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              É considerada uma Pessoa Politicamente Exposta (PPE) ou (Pessoa Exposta Politicamente (PEP)) aquela que ocupa cargos e funções públicas listadas nas normas de Prevenção à Lavagem de Dinheiro e de Financiamento ao Terrorismo, editadas pelos órgãos reguladores e fiscalizadores.
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIsPep('no')}
            >
              <RadioButton
                value="no"
                status={isPep === 'no' ? 'checked' : 'unchecked'}
                onPress={() => setIsPep('no')}
                color="#E91E63"
              />
              <Text style={styles.optionText}>
                Não sou e não tenho vínculo com pessoa exposta politicamente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIsPep('yes')}
            >
              <RadioButton
                value="yes"
                status={isPep === 'yes' ? 'checked' : 'unchecked'}
                onPress={() => setIsPep('yes')}
                color="#E91E63"
              />
              <Text style={styles.optionText}>
                Sou pessoa politicamente exposta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
            uppercase={false}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.confirmButton}
            labelStyle={styles.confirmButtonLabel}
            uppercase={false}
          >
            Confirmar
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 480,
    alignSelf: 'center',
    width: '90%',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  content: {
    padding: 24,
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
    color: '#212121',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#E91E63',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
  },
  cancelButtonLabel: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#E91E63',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  confirmButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PepInfoModal;
