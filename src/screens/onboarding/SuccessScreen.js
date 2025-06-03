import React from 'react';
import { View, StyleSheet, SafeAreaView, Image, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';

const SuccessScreen = ({ navigation }) => {
  const { resetOnboardingData } = useOnboarding();

  const handleGoToHome = () => {
    resetOnboardingData();
    navigation.replace('Welcome');
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

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Scrollable Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.centerContent}>
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
          </ScrollView>
        </View>

        {/* Footer - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleGoToHome}
            style={styles.continueButton}
            labelStyle={styles.continueButtonLabel}
            uppercase={false}
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
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#682145',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 48,
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24, // Espaço normal sem necessidade de compensação para botão absoluto
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    minHeight: 300, // Garante altura mínima para conteúdo centralizado
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
    }),
  },
  checkMark: {
    color: '#682145',
    fontSize: 40,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFF',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFF',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 8,
  },
  submessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFF',
    opacity: 0.9,
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#682145',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
    }),
  },
  continueButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#682145',
    textTransform: 'uppercase',
  },
});

export default SuccessScreen;
