import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const UserBlockedScreen = () => {
  const navigation = useNavigation();

  const handleReturnToHome = () => {
    // Navega de volta para a tela inicial
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Logo do banco */}
      <Image
        source={require('../assets/images/logo-white.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Acesso Bloqueado</Text>

      <View style={styles.messageContainer}>
        {/* Ícone de bloqueio */}
        <View style={styles.iconContainer}>
          <Ionicons name="close" size={40} color="#FFFFFF" />
        </View>

        <Text style={styles.blockMessage}>
          Conta Temporariamente Bloqueada
        </Text>

        <View style={styles.contactContainer}>
          <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" style={styles.contactIcon} />
          <Text style={styles.contactText}>
            Entre em contato com nossa equipe:
          </Text>
        </View>

        <Text style={styles.emailText}>
          atendimento@obancorose.com
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleReturnToHome}
      >
        <Text style={styles.buttonText}>Voltar para a página inicial</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#682145', // Cor primária do Banco Rose
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E91E63', // Cor secundária do Banco Rose
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  blockMessage: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#E91E63', // Cor secundária do Banco Rose
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8, // Bordas mais quadradas para seguir o estilo do app
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserBlockedScreen;
