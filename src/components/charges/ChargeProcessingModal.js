import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, ActivityIndicator } from 'react-native-paper';

export default function ChargeProcessingModal({ visible }) {
  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#FF1493" style={styles.spinner} />
          <Text style={styles.text}>Gerando cobrança e PDF...</Text>
          <Text style={styles.subtext}>Isso pode levar alguns segundos</Text>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
  },
});
