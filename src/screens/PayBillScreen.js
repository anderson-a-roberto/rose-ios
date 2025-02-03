import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PayBillScreen({ route }) {
  const navigation = useNavigation();
  const { balance } = route.params;
  const [barCode, setBarCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleContinue = async () => {
    if (!barCode) {
      // TODO: Mostrar erro no campo
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chamar a edge function billpayments-authorize
      const { data, error: consultError } = await supabase.functions.invoke('billpayments-authorize', {
        body: {
          barCode: {
            type: 0,
            digitable: barCode
          }
        }
      });

      if (consultError) throw consultError;

      if (data.status === 0 && data.errorCode === '000') {
        // Navegar para tela de confirmação com os dados do boleto
        navigation.navigate('PayBillConfirm', {
          billData: {
            ...data,
            barCode: { digitable: barCode }
          },
          balance
        });
      } else {
        throw new Error('Boleto inválido');
      }

    } catch (err) {
      console.error('Erro ao consultar boleto:', err);
      setError('Erro ao consultar boleto. Verifique o código e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard2')}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagar Conta</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Digite o código de barras do seu boleto</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Código de Barras</Text>
          <TextInput
            value={barCode}
            onChangeText={setBarCode}
            style={styles.input}
            placeholder="00000000 00000 00000 00000000 0 00000000000000"
            keyboardType="numeric"
            error={!!error}
            disabled={loading}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (loading || !barCode) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={loading || !barCode}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>CONTINUAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 48,
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  continueButton: {
    backgroundColor: '#1D1D1D',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
