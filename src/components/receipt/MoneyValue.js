import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const MoneyValue = ({ value, style }) => {
  const isNegative = value < 0;
  const formattedValue = Math.abs(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <Text style={[
      styles.value,
      isNegative && styles.negative,
      style
    ]}>
      {isNegative ? '-' : ''}{formattedValue}
    </Text>
  );
};

const styles = StyleSheet.create({
  value: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  negative: {
    color: '#E91E63',
  },
});

export default MoneyValue;
