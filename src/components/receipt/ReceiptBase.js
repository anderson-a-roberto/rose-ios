import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Divider } from 'react-native-paper';

const ReceiptBase = ({ 
  children, 
  transactionId,
  timestamp,
  operationType,
  hideValidation = false
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
          defaultSource={require('../../assets/images/icon.png')}
        />
        <Text style={styles.title}>Comprovante</Text>
        <Text style={styles.transactionId}>ID: {transactionId}</Text>
      </View>

      <Divider style={styles.divider} />

      {/* Data e Hora */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Data e Hora:</Text>
        <Text style={styles.value}>
          {new Date(timestamp).toLocaleString('pt-BR')}
        </Text>
      </View>

      <Divider style={styles.divider} />

      {/* Tipo de Operação */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Tipo de Operação:</Text>
        <Text style={styles.value}>{operationType}</Text>
      </View>

      <Divider style={styles.divider} />

      {/* Content */}
      {children}

      {/* Footer */}
      {!hideValidation && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Este documento é uma representação digital de uma transação realizada em nossa plataforma.
            </Text>
            <Text style={styles.validationText}>
              Validação Digital: {transactionId}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  footer: {
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  validationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  }
});

export default ReceiptBase;
