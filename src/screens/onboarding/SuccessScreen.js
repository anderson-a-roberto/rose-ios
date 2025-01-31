import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../contexts/OnboardingContext';

const SuccessScreen = ({ navigation }) => {
  const { resetOnboardingData } = useOnboarding();

  const handleGoToHome = () => {
    resetOnboardingData();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="check-circle-outline" 
          size={64} 
          color="#000" 
          style={styles.icon}
        />
        
        <Text style={styles.title}>Obrigado pelo seu cadastro!</Text>
        <Text style={styles.message}>
          Seu cadastro foi recebido com sucesso e está em análise.
        </Text>
        <Text style={styles.submessage}>
          Você receberá uma notificação assim que seu cadastro for aprovado.
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={handleGoToHome}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        VOLTAR PARA A PÁGINA INICIAL
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#000',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    marginBottom: 8,
  },
  submessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 25,
    height: 48,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default SuccessScreen;
