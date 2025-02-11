import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Portal, Modal } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const CreateChargeSuccessScreen = ({ navigation }) => {
  const handleViewCharges = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Charges' }],
    });
  };

  const handleNewCharge = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CreateChargePersonalData' }],
    });
  };

  return (
    <Portal>
      <Modal
        visible={true}
        dismissable={false}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color="#E91E63"
            />
          </View>

          {/* Success Message */}
          <Text style={styles.title}>Boleto gerado com sucesso!</Text>
          <Text style={styles.subtitle}>
            Deseja visualizar suas cobranças ou gerar um novo boleto?
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleNewCharge}
              style={styles.newButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.newButtonLabel}
            >
              NOVO BOLETO
            </Button>
            <Button
              mode="contained"
              onPress={handleViewCharges}
              style={styles.viewButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.viewButtonLabel}
            >
              VER COBRANÇAS
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    margin: 24,
    borderRadius: 16,
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  buttonContent: {
    height: 56,
  },
  newButton: {
    borderColor: '#E91E63',
    borderRadius: 8,
  },
  newButtonLabel: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  viewButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  viewButtonLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default CreateChargeSuccessScreen;
