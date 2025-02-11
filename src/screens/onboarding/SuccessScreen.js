import React from 'react';
import { View, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';

const SuccessScreen = ({ navigation }) => {
  const { resetOnboardingData } = useOnboarding();

  const handleGoToHome = () => {
    resetOnboardingData();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          
          <Text style={styles.title}>Obrigado pelo seu cadastro!</Text>
          <Text style={styles.message}>
            Seu cadastro foi recebido com sucesso e está em análise.
          </Text>
          <Text style={styles.submessage}>
            Você receberá uma notificação assim que seu cadastro for aprovado.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleGoToHome}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Voltar para a página inicial
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#682145',
  },
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkMark: {
    color: '#682145',
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFF',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFF',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 8,
  },
  submessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFF',
    opacity: 0.8,
    lineHeight: 24,
  },
  footer: {
    padding: 16,
  },
  button: {
    height: 56,
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 4,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default SuccessScreen;
