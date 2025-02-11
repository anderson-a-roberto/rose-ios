import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PixTransferLoadingScreen = ({ navigation, route }) => {
  const { transferData } = route.params;

  useEffect(() => {
    // Simular tempo de processamento e navegar para tela de sucesso
    const timer = setTimeout(() => {
      navigation.replace('PixTransferSuccess', { transferData });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#682145" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={40}
              color="#FFF"
            />
          </View>
          <Text style={styles.title}>Processando...</Text>
          <Text style={styles.subtitle}>
            Estamos processando sua transferência
          </Text>
          <ActivityIndicator 
            size="large" 
            color="#FFF" 
            style={styles.loader}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#682145'
  },
  container: {
    flex: 1,
    backgroundColor: '#682145',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
});

export default PixTransferLoadingScreen;
