import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
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
      setError('Digite o código de barras');
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

  const handleBarCodeChange = (text) => {
    setBarCode(text);
    setError(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Consultando boleto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Dashboard2')}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Pagar Conta</Text>
            <Text style={styles.subtitle}>Digite o código de barras do seu boleto</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              mode="flat"
              value={barCode}
              onChangeText={handleBarCodeChange}
              keyboardType="numeric"
              style={styles.input}
              contentStyle={{ color: '#000000', fontSize: 16 }}
              placeholder="Digite o código de barras"
              placeholderTextColor="#666"
              autoFocus={true}
              theme={{
                colors: {
                  text: '#000000',
                  placeholder: '#666666',
                  primary: '#E91E63',
                }
              }}
              error={!!error}
              disabled={loading}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              selectionColor="#E91E63"
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            disabled={loading || !barCode}
          >
            CONTINUAR
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    color: '#E91E63',
    fontSize: 32,
    fontWeight: '300',
  },
  headerContent: {
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
    paddingHorizontal: 0,
    height: 56,
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    marginTop: 8,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
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
});
