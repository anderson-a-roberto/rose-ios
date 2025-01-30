import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PixTransferSuccessScreen = ({ navigation, route }) => {
  const { transferData } = route.params;

  useEffect(() => {
    // Navegar para o comprovante após 2 segundos
    const timer = setTimeout(() => {
      navigation.replace('PixTransferReceipt', { transferData });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="check"
            size={40}
            color="#fff"
          />
        </View>
        <Text style={styles.text}>
          Pronto,{'\n'}
          validação concluída!
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

export default PixTransferSuccessScreen;
