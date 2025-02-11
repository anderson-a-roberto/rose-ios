import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Clipboard, StatusBar } from 'react-native';
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
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => {
            onDelete();
            setMenuVisible(false);
          }}
        >
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Minhas Chaves</Text>
            <Text style={styles.subtitle}>Cadastre e gerencie suas chaves</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
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
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <Text style={styles.messageText}>Carregando...</Text>
            ) : error ? (
              <Text style={styles.messageText}>{error}</Text>
            ) : pixKeys.length === 0 ? (
              <Text style={styles.messageText}>Você ainda não possui chaves cadastradas</Text>
            ) : (
              pixKeys.map((key) => (
                <PixKeyItem
                  key={`${key.keyType}-${key.key}`}
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
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('RegisterPixKey')}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              CADASTRAR CHAVE
            </Button>
          </View>
        </View>

        {/* Delete Dialog */}
        <DeletePixKeyDialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF'
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#682145',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#682145',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
  keyItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
    backgroundColor: '#F5E6ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  keyInfo: {
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
  keyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#682145',
    marginRight: 8,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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

export default PixKeysScreen;
