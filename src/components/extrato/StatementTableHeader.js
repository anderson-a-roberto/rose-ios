import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const StatementTableHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerCell, styles.dateCell]}>Data</Text>
      <Text style={[styles.headerCell, styles.descriptionCell]}>Descrição</Text>
      <Text style={[styles.headerCell, styles.typeCell]}>Tipo</Text>
      <Text style={[styles.headerCell, styles.valueCell]}>Valor</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerCell: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  dateCell: {
    flex: 2,
  },
  descriptionCell: {
    flex: 3,
  },
  typeCell: {
    flex: 2,
  },
  valueCell: {
    flex: 2,
    textAlign: 'right',
  },
});

export default StatementTableHeader;
