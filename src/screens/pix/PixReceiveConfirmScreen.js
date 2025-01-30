import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import QRCodeStaticDialog from '../../components/pix/receive/QRCodeStaticDialog';
import QRCodeDynamicDialog from '../../components/pix/receive/QRCodeDynamicDialog';
import { supabase } from '../../config/supabase';

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

      // Busca usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Busca perfil do usuário
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
          name: profile.full_name
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

      setQrCodeData(response.body);
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
          name: profile.full_name
        },
        expiration: 3600, // 1 hora
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#682145" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cobrar</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>
        Confira seus dados, essas informações serão visualizadas na leitura do QR Code
      </Text>

      {/* Valor */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Valor</Text>
        <Text style={styles.infoValue}>{formatCurrency(amount)}</Text>
      </View>

      {/* Chave */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Chave</Text>
        <Text style={styles.infoValue}>{selectedKey.key}</Text>
      </View>

      {/* Nome */}
      {profile && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Nome</Text>
          <Text style={styles.infoValue}>{profile.full_name}</Text>
        </View>
      )}

      {/* CPF/CNPJ */}
      {profile && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>CPF/CNPJ</Text>
          <Text style={styles.infoValue}>{profile.document_number}</Text>
        </View>
      )}

      {/* Instituição Financeira */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Instituição Financeira</Text>
        <Text style={styles.infoValue}>Bank o'Clock</Text>
      </View>

      {/* QR Code Buttons */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleGenerateStaticQR}
          style={styles.qrButton}
          labelStyle={styles.qrButtonLabel}
          disabled={loading}
        >
          QR CODE ESTÁTICO
        </Button>

        <Button
          mode="contained"
          onPress={handleGenerateDynamicQR}
          style={styles.qrButton}
          labelStyle={styles.qrButtonLabel}
          disabled={loading}
        >
          QR CODE DINÂMICO
        </Button>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  qrButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 25,
    marginBottom: 8,
  },
  qrButtonLabel: {
    fontSize: 16,
    color: '#fff',
  },
});

export default PixReceiveConfirmScreen;
