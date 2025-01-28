import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PixOptionsForm = ({ onTransfer, onReceive, onKeys }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PIX</Text>

      <View style={styles.options}>
        <Button
          mode="contained"
          onPress={onTransfer}
          icon="arrow-right"
          buttonColor="#FF1493"
          style={styles.button}
        >
          Transferir PIX
        </Button>

        <Button
          mode="contained"
          onPress={onReceive}
          icon="qrcode"
          buttonColor="#FF1493"
          style={styles.button}
        >
          Receber PIX
        </Button>

        <Button
          mode="contained"
          onPress={onKeys}
          icon="key"
          buttonColor="#FF1493"
          style={styles.button}
        >
          Chaves PIX
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  options: {
    gap: 16,
  },
  button: {
    justifyContent: 'center',
  },
});

export default PixOptionsForm;
