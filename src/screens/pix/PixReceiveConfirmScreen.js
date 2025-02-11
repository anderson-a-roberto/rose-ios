import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import QRCodeStaticDialog from '../../components/pix/receive/QRCodeStaticDialog';
import QRCodeDynamicDialog from '../../components/pix/receive/QRCodeDynamicDialog';
import { supabase } from '../../config/supabase';

const KEY_TYPES = {
  EVP: "Chave Aleatória",
  CPF: "CPF",
  EMAIL: "Email",
  PHONE: "Celular",
  CNPJ: "CNPJ"
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const PixReceiveConfirmScreen = ({ navigation, route }) => {
  const { amount, selectedKey } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showStaticQR, setShowStaticQR] = useState(false);
  const [showDynamicQR, setShowDynamicQR] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStaticQR = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profile) {
        throw new Error('Dados do usuário não encontrados');
      }

      const payload = {
        key: selectedKey.key,
        amount: amount,
        merchant: {
          merchantCategoryCode: "5651",
          name: profile.full_name,
          city: profile.address_city || "São Paulo",
          postalCode: profile.address_postal_code || "01000-000"
        }
      };

      const { data: response, error: qrError } = await supabase.functions.invoke(
        'brcode-static',
        { body: payload }
      );

      if (qrError) throw qrError;

      if (response.status === 'ERROR') {
        throw new Error(response.error?.message || 'Erro ao gerar QR Code');
      }

      console.log('Response from Edge Function:', response);
      setQrCodeData(response); 
      setShowStaticQR(true);
    } catch (err) {
      console.error('Erro ao gerar QR Code estático:', err);
      setError('Não foi possível gerar o QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDynamicQR = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profile) {
        throw new Error('Dados do usuário não encontrados');
      }

      const payload = {
        key: selectedKey.key,
        amount: amount,
        merchant: {
          merchantCategoryCode: "5651",
          name: profile.full_name,
          city: profile.address_city || "São Paulo",
          postalCode: profile.address_postal_code || "01000-000"
        }
      };

      const { data: response, error: qrError } = await supabase.functions.invoke(
        'brcode-dynamic',
        { body: payload }
      );

      if (qrError) throw qrError;

      if (response.status === 'ERROR') {
        throw new Error(response.error?.message || 'Erro ao gerar QR Code');
      }

      setQrCodeData(response.body);
      setShowDynamicQR(true);
    } catch (err) {
      console.error('Erro ao gerar QR Code dinâmico:', err);
      setError('Não foi possível gerar o QR Code');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Gerando QR Code...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Confirmar cobrança</Text>
        <Text style={styles.subtitle}>Escolha como deseja receber</Text>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
          <Text style={styles.amountLabel}>Valor da cobrança</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Key Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chave selecionada</Text>
          <View style={styles.keyInfo}>
            <MaterialCommunityIcons name="key-variant" size={24} color="#E91E63" />
            <View style={styles.keyDetails}>
              <Text style={styles.keyType}>{KEY_TYPES[selectedKey.keyType] || selectedKey.keyType}</Text>
              <Text style={styles.keyValue}>{selectedKey.key}</Text>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* QR Code Options */}
        <View style={styles.qrOptions}>
          <Button
            mode="contained"
            onPress={handleGenerateStaticQR}
            style={styles.qrButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon={() => <MaterialCommunityIcons name="qrcode" size={24} color="#FFF" />}
          >
            QR CODE ESTÁTICO
          </Button>
          <Button
            mode="contained"
            onPress={handleGenerateDynamicQR}
            style={[styles.qrButton, styles.qrButtonSecondary]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon={() => <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFF" />}
          >
            QR CODE DINÂMICO
          </Button>
        </View>
      </View>

      {/* QR Code Dialogs */}
      <QRCodeStaticDialog
        visible={showStaticQR}
        onDismiss={() => setShowStaticQR(false)}
        qrData={qrCodeData}
      />
      <QRCodeDynamicDialog
        visible={showDynamicQR}
        onDismiss={() => setShowDynamicQR(false)}
        qrData={qrCodeData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    color: '#E91E63',
    fontSize: 32,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amountValue: {
    fontSize: 32,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
    marginBottom: 16,
  },
  keyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  keyDetails: {
    marginLeft: 16,
    flex: 1,
  },
  keyType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  qrOptions: {
    gap: 16,
  },
  qrButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  qrButtonSecondary: {
    backgroundColor: '#682145',
  },
  buttonContent: {
    height: 56,
    flexDirection: 'row-reverse',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFF',
    marginLeft: 8,
  },
});

export default PixReceiveConfirmScreen;
