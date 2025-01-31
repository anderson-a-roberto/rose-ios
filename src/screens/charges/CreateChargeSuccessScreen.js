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
              size={48}
              color="#4CAF50"
            />
          </View>

          {/* Success Message */}
          <Text style={styles.title}>Boleto gerado com sucesso!</Text>
          <Text style={styles.subtitle}>
            Visualize seu boleto ou clique em novo boleto para gerar um novo.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleNewCharge}
              style={styles.noButton}
              labelStyle={styles.noButtonLabel}
            >
              NÃO
            </Button>
            <Button
              mode="contained"
              onPress={handleViewCharges}
              style={styles.yesButton}
              labelStyle={styles.yesButtonLabel}
            >
              SIM
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  noButton: {
    flex: 1,
    borderColor: '#000',
    borderRadius: 25,
  },
  noButtonLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  yesButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 25,
  },
  yesButtonLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateChargeSuccessScreen;
