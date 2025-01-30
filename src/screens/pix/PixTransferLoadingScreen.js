import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="progress-clock"
            size={40}
            color="#fff"
          />
        </View>
        <Text style={styles.text}>
          Aguarde,{'\n'}
          estamos validando...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4D4D4D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PixTransferLoadingScreen;
