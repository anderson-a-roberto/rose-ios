import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import StatementTable from './StatementTable';

const StatementForm = ({ onSubmit }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const formatDate = (text) => {
    const numbers = text.replace(/\D/g, '');
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
    <View style={styles.mainContainer}>
      <View style={styles.formContainer}>
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
              outlineColor="#e92176"
              activeOutlineColor="#e92176"
              textColor="white"
              theme={{
                colors: {
                  background: '#682145',
                  placeholder: '#e92176',
                  text: 'white'
                }
              }}
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
              outlineColor="#e92176"
              activeOutlineColor="#e92176"
              textColor="white"
              theme={{
                colors: {
                  background: '#682145',
                  placeholder: '#e92176',
                  text: 'white'
                }
              }}
            />
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          buttonColor="#E91E63"
          textColor="white"
          loading={loading}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          FILTRAR
        </Button>
      </View>

      <View style={styles.contentContainer}>
        <StatementTable
          transactions={transactions}
          loading={loading}
          error={error}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#682145',
  },
  formContainer: {
    padding: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
  },
  label: {
    color: 'white',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#682145',
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#E91E63',
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default StatementForm;
