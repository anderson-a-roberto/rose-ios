import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Select } from 'react-native';
import { Text, Button, TextInput, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import PixKeySuccessModal from './PixKeySuccessModal';
import DeletePixKeyDialog from './DeletePixKeyDialog';

const KEY_TYPES = {
  EVP: "Chave Aleatória",
  CPF: "CPF",
  EMAIL: "Email",
  PHONE: "Telefone",
  CNPJ: "CNPJ"
};

const PixKeyItem = ({ keyId, type, value, createdAt, onCopy, onDelete }) => (
  <View style={styles.keyItem}>
    <MaterialCommunityIcons name="key-variant" size={24} color="#FF1493" />
    <View style={styles.keyInfo}>
      <Text style={styles.keyValue}>{value}</Text>
      <Text style={styles.keyType}>Tipo: {type}</Text>
      <Text style={styles.keyDate}>Criada em: {createdAt}</Text>
    </View>
    <View style={styles.keyActions}>
      <Button
        mode="text"
        onPress={onCopy}
        icon="content-copy"
        textColor="#333"
      >
        Copiar
      </Button>
      <Button
        mode="text"
        onPress={onDelete}
        icon="delete"
        textColor="#F44336"
      >
        Excluir
      </Button>
    </View>
  </View>
);

const PixKeysForm = () => {
  const [selectedType, setSelectedType] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pixKeys, setPixKeys] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedKeyToDelete, setSelectedKeyToDelete] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Buscar chaves PIX existentes
  const fetchPixKeys = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchPixKeys();
  }, []);

  // Formatar chave PIX de acordo com o tipo
  const formatPixKey = (key, type) => {
    switch (type) {
      case 'CPF':
        return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      case 'PHONE':
        return key.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      default:
        return key;
    }
  };

  const handleCreateKey = async () => {
    try {
      if (!selectedType) {
        setError('Selecione um tipo de chave');
        return;
      }

      if (selectedType !== 'EVP' && !keyValue) {
        setError('Digite uma chave PIX');
        return;
      }

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

      // Registrar chave PIX
      const { data: registerData, error: registerError } = await supabase.functions.invoke(
        'register-pix-key',
        {
          body: {
            account: kycData.account,
            keyType: selectedType,
            key: selectedType === 'EVP' ? undefined : keyValue
          }
        }
      );

      if (registerError) throw registerError;

      if (registerData.status === 'CONFIRMED') {
        setSuccessData({
          keyType: KEY_TYPES[selectedType],
          key: registerData.body.key
        });
        setShowSuccessModal(true);
        setSelectedType('');
        setKeyValue('');
        fetchPixKeys(); // Atualizar lista de chaves
      } else {
        throw new Error('Erro ao registrar chave PIX');
      }

    } catch (err) {
      console.error('Erro ao criar chave PIX:', err);
      setError(err.message || 'Erro ao criar chave PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async (key) => {
    try {
      const formattedKey = formatPixKey(key.key, key.keyType);
      await navigator.clipboard.writeText(formattedKey);
      setSnackbarMessage('Chave PIX copiada com sucesso!');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Erro ao copiar chave:', err);
      setSnackbarMessage('Não foi possível copiar a chave PIX');
      setSnackbarVisible(true);
    }
  };

  const handleDeleteKey = async () => {
    if (!selectedKeyToDelete) return;

    try {
      setLoading(true);
      setError(null);

      // Usar o número da conta que vem na estrutura correta
      const accountNumber = selectedKeyToDelete.account?.account;
      
      if (!accountNumber) {
        throw new Error('Número da conta não encontrado');
      }

      const { error: deleteError } = await supabase.functions.invoke(
        'delete-pix-key',
        {
          body: {
            key: selectedKeyToDelete.key,
            type: selectedKeyToDelete.keyType,
            account: accountNumber
          }
        }
      );

      if (deleteError) throw deleteError;

      setSnackbarMessage('Chave PIX excluída com sucesso!');
      setSnackbarVisible(true);
      fetchPixKeys(); // Atualizar lista de chaves

    } catch (err) {
      console.error('Erro ao excluir chave PIX:', err);
      setError('Erro ao excluir chave PIX. Tente novamente.');
      setSnackbarMessage('Erro ao excluir chave PIX');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setSelectedKeyToDelete(null);
    }
  };

  const openDeleteDialog = (key) => {
    setSelectedKeyToDelete(key);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedKeyToDelete(null);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Minhas Chaves PIX</Text>

      <View style={styles.keysList}>
        {pixKeys.map((key) => (
          <PixKeyItem
            key={key.key}
            keyId={key.key}
            type={KEY_TYPES[key.keyType]}
            value={formatPixKey(key.key, key.keyType)}
            createdAt={new Date(key.account?.createDate).toLocaleDateString('pt-BR')}
            onCopy={() => handleCopyKey(key)}
            onDelete={() => openDeleteDialog(key)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Criar Nova Chave PIX</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tipo de Chave</Text>
        <View style={styles.selectContainer}>
          <Select
            style={styles.select}
            value={selectedType}
            onValueChange={(e) => setSelectedType(e)}
          >
            <Select.Item label="Selecione o tipo de chave" value="" disabled />
            {Object.entries(KEY_TYPES).map(([value, label]) => (
              <Select.Item key={value} label={label} value={value} />
            ))}
          </Select>
        </View>
      </View>

      {selectedType !== 'EVP' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Chave PIX <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            mode="outlined"
            placeholder="Digite a chave PIX"
            value={keyValue}
            onChangeText={setKeyValue}
            outlineColor="#FF1493"
            activeOutlineColor="#FF1493"
          />
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleCreateKey}
        style={styles.createButton}
        buttonColor="#FF1493"
        loading={loading}
      >
        Criar Chave PIX
      </Button>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PixKeySuccessModal
        visible={showSuccessModal}
        data={successData}
        onClose={handleCloseModal}
      />

      <DeletePixKeyDialog
        visible={showDeleteDialog}
        onDismiss={closeDeleteDialog}
        onConfirm={handleDeleteKey}
        loading={loading}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  keysList: {
    marginBottom: 32,
    gap: 16,
  },
  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  keyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  keyValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  keyType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  keyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  keyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  required: {
    color: '#F44336',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#FF1493',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  select: {
    width: '100%',
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 0,
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
  },
  createButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
  },
  snackbar: {
    marginBottom: 20,
  },
});

export default PixKeysForm;
