import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import StatementTable from './StatementTable';

const StatementForm = ({ onSubmit }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const formatDate = (text) => {
    // Remove tudo que não for número
    const numbers = text.replace(/\D/g, '');

    // Aplica a máscara DD/MM/AAAA
    let formatted = numbers;
    if (numbers.length > 2) formatted = numbers.replace(/^(\d{2})/, '$1/');
    if (numbers.length > 4) formatted = numbers.replace(/^(\d{2})(\d{2})/, '$1/$2/');
    if (numbers.length > 4) {
      formatted = numbers.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
    }

    return formatted;
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, preencha as datas inicial e final');
      return;
    }

    if (startDate.length !== 10 || endDate.length !== 10) {
      alert('Por favor, preencha as datas no formato DD/MM/AAAA');
      return;
    }

    try {
      const parsedStartDate = parseDate(startDate);
      const parsedEndDate = parseDate(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        alert('Data inválida. Use o formato DD/MM/AAAA');
        return;
      }

      if (parsedEndDate < parsedStartDate) {
        alert('A data final não pode ser menor que a data inicial');
        return;
      }

      setLoading(true);
      setError(null);
      const result = await onSubmit(parsedStartDate, parsedEndDate);
      if (result.error) {
        setError(result.error);
      } else {
        setTransactions(result.transactions);
      }
    } catch (error) {
      setError('Erro ao consultar extrato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultar Extrato</Text>

      <View style={styles.formRow}>
        <View style={styles.dateField}>
          <Text style={styles.label}>Data Inicial</Text>
          <TextInput
            style={styles.input}
            mode="outlined"
            placeholder="DD/MM/AAAA"
            value={startDate}
            onChangeText={(text) => setStartDate(formatDate(text))}
            keyboardType="numeric"
            maxLength={10}
            outlineColor="#FF1493"
            activeOutlineColor="#FF1493"
          />
        </View>

        <View style={styles.dateField}>
          <Text style={styles.label}>Data Final</Text>
          <TextInput
            style={styles.input}
            mode="outlined"
            placeholder="DD/MM/AAAA"
            value={endDate}
            onChangeText={(text) => setEndDate(formatDate(text))}
            keyboardType="numeric"
            maxLength={10}
            outlineColor="#FF1493"
            activeOutlineColor="#FF1493"
          />
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        buttonColor="#FF1493"
      >
        Consultar Extrato
      </Button>

      <StatementTable
        transactions={transactions}
        loading={loading}
        error={error}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
    marginHorizontal: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 16,
    paddingVertical: 8,
  },
});

export default StatementForm;
