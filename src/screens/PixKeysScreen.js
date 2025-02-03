import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Clipboard } from 'react-native';
import { Text, Button, Menu, Snackbar } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../config/supabase';
import DeletePixKeyDialog from '../components/pix/DeletePixKeyDialog';
import { SafeAreaView } from 'react-native-safe-area-context';

const KEY_TYPES = {
  EVP: "Chave Aleatória",
  CPF: "CPF",
  EMAIL: "Email",
  PHONE: "Telefone",
  CNPJ: "CNPJ"
};

const PixKeyItem = ({ keyId, type, value, onCopy, onDelete }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.keyItem}>
      <View style={styles.keyContent}>
        <View style={styles.keyIconContainer}>
          <MaterialCommunityIcons name="key-variant" size={24} color="#682145" />
        </View>
        <View style={styles.keyInfo}>
          <Text style={styles.keyType}>{KEY_TYPES[type]}</Text>
          <Text style={styles.keyValue}>{value}</Text>
        </View>
      </View>
      
      <View style={styles.keyActions}>
        <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
          <Text style={styles.copyButtonText}>Copiar Chave</Text>
          <MaterialCommunityIcons name="content-copy" size={16} color="#682145" />
        </TouchableOpacity>
        
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              onDelete();
            }}
            title="Excluir"
            leadingIcon="delete"
          />
        </Menu>
      </View>
    </View>
  );
};

const PixKeysScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pixKeys, setPixKeys] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedKeyToDelete, setSelectedKeyToDelete] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchPixKeys();
  }, []);

  useEffect(() => {
    if (route.params?.updatePixKeys) {
      fetchPixKeys();
      navigation.setParams({ updatePixKeys: undefined });
    }
  }, [route.params?.updatePixKeys]);

  const fetchPixKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar CPF do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar número da conta
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycError) throw kycError;

      // Buscar chaves PIX
      const { data: keysData, error: keysError } = await supabase.functions.invoke(
        'get-pix-keys',
        { body: { account: kycData.account } }
      );

      if (keysError) throw keysError;

      setPixKeys(keysData.body?.listKeys || []);
    } catch (err) {
      console.error('Erro ao buscar chaves PIX:', err);
      setError('Não foi possível carregar suas chaves PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async (value) => {
    try {
      await Clipboard.setString(value);
      setSnackbarMessage('Chave copiada com sucesso!');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Erro ao copiar chave:', err);
      setSnackbarMessage('Erro ao copiar chave');
      setSnackbarVisible(true);
    }
  };

  const handleDeleteKey = async () => {
    if (!selectedKeyToDelete) return;

    try {
      setLoading(true);

      // Buscar usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar CPF do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar número da conta
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kycError) throw kycError;

      // Excluir chave PIX
      const { error: deleteError } = await supabase.functions.invoke(
        'delete-pix-key',
        {
          body: {
            key: selectedKeyToDelete.key,
            type: selectedKeyToDelete.keyType,
            account: kycData.account
          }
        }
      );

      if (deleteError) throw deleteError;

      setSnackbarMessage('Chave excluída com sucesso!');
      setSnackbarVisible(true);
      fetchPixKeys();
    } catch (err) {
      console.error('Erro ao excluir chave:', err);
      setSnackbarMessage('Erro ao excluir chave');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setSelectedKeyToDelete(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Chaves</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>Cadastre e gerencie suas chaves</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Ativas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pendentes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Keys List */}
      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : pixKeys.length === 0 ? (
          <Text style={styles.emptyText}>Você ainda não possui chaves cadastradas</Text>
        ) : (
          pixKeys.map((key) => (
            <PixKeyItem
              key={key.id}
              keyId={key.id}
              type={key.keyType}
              value={key.key}
              onCopy={() => handleCopyKey(key.key)}
              onDelete={() => {
                setSelectedKeyToDelete(key);
                setShowDeleteDialog(true);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Register Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('RegisterPixKey')}
          style={styles.registerButton}
          labelStyle={styles.registerButtonLabel}
        >
          CADASTRAR CHAVE
        </Button>
      </View>

      {/* Delete Dialog */}
      <DeletePixKeyDialog
        visible={showDeleteDialog}
        onDismiss={() => {
          setShowDeleteDialog(false);
          setSelectedKeyToDelete(null);
        }}
        onConfirm={handleDeleteKey}
        loading={loading}
      />

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#682145',
  },
  tabText: {
    fontSize: 14,
    color: '#000',
  },
  activeTabText: {
    color: '#682145',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  keyItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  keyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  keyInfo: {
    flex: 1,
  },
  keyType: {
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  keyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#682145',
    marginRight: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  registerButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 25,
  },
  registerButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  errorText: {
    textAlign: 'center',
    color: '#F44336',
    marginTop: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
});

export default PixKeysScreen;
