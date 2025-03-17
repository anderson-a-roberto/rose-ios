import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PixQrCodeSuccessScreen = ({ navigation, route }) => {
  const { paymentData } = route.params;

  useEffect(() => {
    // Navegar para o comprovante após 2 segundos
    const timer = setTimeout(() => {
      navigation.replace('PixQrCodeReceipt', { paymentData });
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
              name="check-circle-outline"
              size={40}
              color="#FFF"
            />
          </View>
          <Text style={styles.title}>Transferência realizada!</Text>
          <Text style={styles.subtitle}>
            Sua transferência foi concluída com sucesso
          </Text>
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
  },
});

export default PixQrCodeSuccessScreen;
