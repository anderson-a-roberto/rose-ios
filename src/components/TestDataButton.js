import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTestData } from '../hooks/useTestData';

const TestDataButton = ({ section, onFill }) => {
  const { fillTestData } = useTestData();

  const handlePress = () => {
    const data = fillTestData(section);
    if (data && onFill) {
      onFill(data);
    }
  };

  if (!__DEV__) return null;

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handlePress}
    >
      <Text style={styles.text}>Preencher Teste</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 1000,
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
});

export default TestDataButton;
