import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../config/supabase';

const PixReversalModal = ({ visible, onDismiss, endToEndId, amount }) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(amount.toString());
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validar valor
      const reversalAmount = parseFloat(value.replace(',', '.'));
      if (reversalAmount <= 0 || reversalAmount > amount) {
        Alert.alert('Erro', 'Valor inválido para devolução');
        return;
      }

      // Chamar a Edge Function de devolução
      const { data, error } = await supabase.functions.invoke(
        'pix-reversal',
        {
          body: {
            endToEndId,
            amount: reversalAmount,
            reason: reason || 'Devolução solicitada pelo usuário'
          }
        }
      );

      if (error) {
        console.error('Erro na chamada da edge function pix-reversal:', error);
        throw new Error('Não foi possível conectar ao serviço de devolução. Verifique sua conexão e tente novamente.');
      }

      if (data.status === 'ERROR') {
        console.warn('Status de erro na resposta da devolução:', data.error);
        throw new Error(data.error?.message || 'Erro ao processar devolução');
      }

      Alert.alert(
        'Sucesso',
        'Devolução do PIX realizada com sucesso!',
        [{ text: 'OK', onPress: onDismiss }]
      );

    } catch (err) {
      console.error('Erro ao devolver PIX:', err);
      Alert.alert(
        'Erro',
        err.message || 'Não foi possível processar a devolução. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Converte para float com 2 casas decimais
    const value = parseFloat(numbers) / 100;
    
    // Formata com vírgula
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleValueChange = (text) => {
    setValue(formatValue(text));
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Devolução de PIX</Text>
          
          <View style={styles.form}>
            {/* Valor */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Valor da Devolução</Text>
              <View style={styles.valueContainer}>
                <Text style={styles.currency}>R$</Text>
                <TextInput
                  mode="flat"
                  value={value}
                  onChangeText={handleValueChange}
                  keyboardType="numeric"
                  style={styles.valueInput}
                  maxLength={13}
                  disabled={loading}
                />
              </View>
              <Text style={styles.helper}>
                Valor máximo: R$ {amount.toFixed(2).replace('.', ',')}
              </Text>
            </View>

            {/* Motivo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Motivo (opcional)</Text>
              <TextInput
                mode="outlined"
                value={reason}
                onChangeText={setReason}
                placeholder="Digite o motivo da devolução"
                multiline
                numberOfLines={3}
                style={styles.reasonInput}
                disabled={loading}
                outlineColor="#E0E0E0"
                activeOutlineColor="#E91E63"
              />
            </View>
          </View>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[styles.button, styles.cancelButton]}
              textColor="#666666"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              buttonColor="#E91E63"
              textColor="#FFFFFF"
              loading={loading}
              disabled={loading}
            >
              Confirmar
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 4,
    padding: 20,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  currency: {
    fontSize: 20,
    color: '#000000',
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 20,
    height: 56,
    paddingHorizontal: 0,
  },
  helper: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  reasonInput: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 4,
  },
  cancelButton: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
});

export default PixReversalModal;
