import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PixOption = ({ icon, title, subtitle, onPress }) => (
  <TouchableRipple onPress={onPress} style={styles.optionButton}>
    <View style={styles.optionContent}>
      <MaterialCommunityIcons name={icon} size={24} color="#FF1493" />
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
    </View>
  </TouchableRipple>
);

const PixOptionsForm = ({ onTransfer, onReceive, onManageKeys }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PIX</Text>

      <View style={styles.optionsContainer}>
        <PixOption
          icon="arrow-right"
          title="Transferir PIX"
          subtitle="Envie um PIX"
          onPress={onTransfer}
        />

        <PixOption
          icon="qrcode"
          title="Receber PIX"
          subtitle="Gere um QR Code"
          onPress={onReceive}
        />

        <PixOption
          icon="key-variant"
          title="Chaves PIX"
          subtitle="Gerencie suas chaves"
          onPress={onManageKeys}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default PixOptionsForm;
