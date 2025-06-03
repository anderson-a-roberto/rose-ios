import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { supabase } from '../../config/supabase';
import MaskInput from 'react-native-mask-input';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CloseAccountDialog from './CloseAccountDialog';
import { useNavigation } from '@react-navigation/native';

export default function ProfileSettingsForm({ onBack }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    // Dados Pessoais
    fullName: '',
    socialName: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    motherName: '',
    documentNumber: '',
    documentType: 'CPF',
    // Dados PJ
    businessName: '',
    businessEmail: '',
    contactNumber: '',

    // Endereço
    addressPostalCode: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: ''
  });
  
  // Estados para o encerramento de conta
  const [showCloseAccountDialog, setShowCloseAccountDialog] = useState(false);
  const [isClosingAccount, setIsClosingAccount] = useState(false);
  const [closeAccountError, setCloseAccountError] = useState({});
  const [accountNumber, setAccountNumber] = useState('');
  const [userTaxId, setUserTaxId] = useState('');
  const [isPJ, setIsPJ] = useState(false);

  useEffect(() => {
    loadProfile();
    loadAccountNumber();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Preencher o formulário com os dados do perfil
      setForm(prevForm => ({
        ...prevForm,
        fullName: data.full_name || '',
        socialName: data.social_name || '',
        email: data.email || '',
        phoneNumber: data.phone_number || '',
        birthDate: data.birth_date || '',
        motherName: data.mother_name || '',
        documentNumber: data.document_number || '',
        documentType: data.document_type || 'CPF',
        // Dados PJ
        businessName: data.business_name || '',
        businessEmail: data.business_email || '',
        contactNumber: data.contact_number || '',
        addressPostalCode: data.address_postal_code || '',
        addressStreet: data.address_street || '',
        addressNumber: data.address_number || '',
        addressComplement: data.address_complement || '',
        addressNeighborhood: data.address_neighborhood || '',
        addressCity: data.address_city || '',
        addressState: data.address_state || ''
      }));
      
      // Armazenar o CPF/CNPJ do usuário para uso no encerramento de conta
      if (data.document_number) {
        setUserTaxId(data.document_number);
        // Verificar se é PJ com base no tamanho do documento (CNPJ tem 14 dígitos)
        setIsPJ(data.document_number.replace(/[^0-9]/g, '').length > 11);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError('Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const loadAccountNumber = async () => {
    try {
      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Obter o perfil do usuário para conseguir o document_number
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('document_number')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      if (!profileData || !profileData.document_number) {
        console.error('Documento não encontrado no perfil');
        return;
      }

      // Buscar o número da conta na tabela kyc_proposals_v2
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_proposals_v2')
        .select('account')
        .eq('document_number', profileData.document_number)
        .eq('onboarding_create_status', 'CONFIRMED')
        .single();

      if (kycError) {
        console.error('Erro ao buscar conta na kyc_proposals_v2:', kycError);
        return;
      }
      
      if (kycData && kycData.account) {
        setAccountNumber(kycData.account);
      } else {
        console.warn('Número da conta não encontrado na kyc_proposals_v2');
      }
    } catch (error) {
      console.error('Erro ao carregar número da conta:', error);
    }
  };

  const handleCloseAccount = (data) => {
    setIsClosingAccount(true);
    setCloseAccountError({});
    
    // Gerar um código de cliente único para a transação
    const clientCode = `CLOSE_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    console.log('Enviando solicitação de encerramento:', {
      account: data.account,
      documentNumber: data.documentNumber,
      reason: data.reason,
      clientCode: clientCode
    });
    
    supabase.functions.invoke("close-account", {
      body: {
        account: data.account,
        documentNumber: data.documentNumber,
        reason: data.reason,
        clientCode: clientCode
      },
      method: 'DELETE'
    }).then(({ data: responseData, error }) => {
      console.log('Resposta da API:', responseData, error);
      
      if (error) {
        console.error('Erro ao encerrar conta:', error);
        setCloseAccountError({
          errorCode: 'GENERIC',
          errorMessage: typeof error.message === 'string' ? error.message : 'Ocorreu um erro ao processar sua solicitação.'
        });
        setIsClosingAccount(false);
        return;
      }
      
      if (responseData && responseData.status === 'ERROR') {
        console.error('Erro retornado pela API:', responseData);
        
        // Extrair a mensagem de erro, garantindo que seja uma string
        let errorMessage = 'Ocorreu um erro ao processar sua solicitação.';
        
        if (responseData.error) {
          if (typeof responseData.error === 'string') {
            errorMessage = responseData.error;
          } else if (responseData.error.message && typeof responseData.error.message === 'string') {
            errorMessage = responseData.error.message;
          }
        } else if (responseData.message && typeof responseData.message === 'string') {
          errorMessage = responseData.message;
        }
        
        setCloseAccountError({
          errorCode: responseData.errorCode || 'UNKNOWN',
          errorMessage: errorMessage
        });
        setIsClosingAccount(false);
        return;
      }
      
      // Sucesso
      Alert.alert(
        "Conta Encerrada",
        "Sua conta foi encerrada com sucesso. Você será redirecionado para a tela inicial.",
        [{ text: "OK" }]
      );
      
      // Fechar o diálogo e redirecionar após 2 segundos
      setTimeout(() => {
        setShowCloseAccountDialog(false);
        setIsClosingAccount(false);
        
        // Fazer logout e navegar para a tela inicial
        supabase.auth.signOut().then(() => {
          // Usar reset em vez de navigate para garantir que não haja histórico de navegação
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }).catch(error => {
          console.error('Erro ao fazer logout:', error);
          // Em caso de erro no logout, ainda tentamos redirecionar para a tela inicial
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        });
      }, 2000);
    }).catch(error => {
      console.error('Erro inesperado:', error);
      setCloseAccountError({
        errorCode: 'UNEXPECTED',
        errorMessage: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.'
      });
      setIsClosingAccount(false);
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Configurações do Perfil</Text>
          <Text style={styles.subtitle}>
            Aqui você pode visualizar e atualizar seus dados cadastrais
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          {/* Dados Pessoais */}
          <Text style={styles.sectionTitle}>Dados {isPJ ? 'Empresariais' : 'Pessoais'}</Text>
          
          {isPJ ? (
            // Campos para Pessoa Jurídica (PJ)
            <>
              <Text style={styles.label}>Razão Social</Text>
              <TextInput
                value={form.businessName}
                onChangeText={(text) => setForm(prev => ({ ...prev, businessName: text }))}
                style={[styles.input, form.businessName && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />

              <Text style={styles.label}>Email Comercial</Text>
              <TextInput
                value={form.businessEmail}
                onChangeText={(text) => setForm(prev => ({ ...prev, businessEmail: text }))}
                style={[styles.input, form.businessEmail && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />

              <Text style={styles.label}>Telefone de Contato</Text>
              <TextInput
                value={form.contactNumber}
                onChangeText={(text) => setForm(prev => ({ ...prev, contactNumber: text }))}
                style={[styles.input, form.contactNumber && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />
            </>
          ) : (
            // Campos para Pessoa Física (PF)
            <>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                value={form.fullName}
                onChangeText={(text) => setForm(prev => ({ ...prev, fullName: text }))}
                style={[styles.input, form.fullName && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />

              <Text style={styles.label}>Nome Social</Text>
              <TextInput
                value={form.socialName}
                onChangeText={(text) => setForm(prev => ({ ...prev, socialName: text }))}
                style={[styles.input, form.socialName && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                style={[styles.input, form.email && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />

              <Text style={styles.label}>Telefone</Text>
              <TextInput
                value={form.phoneNumber}
                onChangeText={(text) => setForm(prev => ({ ...prev, phoneNumber: text }))}
                style={[styles.input, form.phoneNumber && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />

              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                value={form.birthDate}
                onChangeText={(text) => setForm(prev => ({ ...prev, birthDate: text }))}
                style={[styles.input, form.birthDate && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />

              <Text style={styles.label}>Nome da Mãe</Text>
              <TextInput
                value={form.motherName}
                onChangeText={(text) => setForm(prev => ({ ...prev, motherName: text }))}
                style={[styles.input, form.motherName && styles.filledInput]}
                contentStyle={{ color: '#000000', fontSize: 16 }}
                theme={{
                  colors: {
                    text: '#000000',
                    disabled: '#000000',
                    placeholder: '#666666',
                    primary: '#E91E63',
                  }
                }}
                disabled
              />
            </>
          )}

          <Text style={styles.label}>{isPJ ? 'CNPJ' : 'CPF'}</Text>
          <TextInput
            value={form.documentNumber}
            onChangeText={(text) => setForm(prev => ({ ...prev, documentNumber: text }))}
            style={[styles.input, form.documentNumber && styles.filledInput]}
            contentStyle={{ color: '#000000', fontSize: 16 }}
            theme={{
              colors: {
                text: '#000000',
                disabled: '#000000',
                placeholder: '#666666',
                primary: '#E91E63',
              }
            }}
            disabled
          />

          {/* Endereço */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Endereço</Text>

          <Text style={styles.label}>CEP</Text>
          <TextInput
            value={form.addressPostalCode}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressPostalCode: text }))}
            style={[styles.input, form.addressPostalCode && styles.filledInput]}
            contentStyle={{ color: '#000000', fontSize: 16 }}
            theme={{
              colors: {
                text: '#000000',
                disabled: '#000000',
                placeholder: '#666666',
                primary: '#E91E63',
              }
            }}
            disabled
          />

          <Text style={styles.label}>Rua</Text>
          <TextInput
            value={form.addressStreet}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressStreet: text }))}
            style={[styles.input, form.addressStreet && styles.filledInput]}
            contentStyle={{ color: '#000000', fontSize: 16 }}
            theme={{
              colors: {
                text: '#000000',
                disabled: '#000000',
                placeholder: '#666666',
                primary: '#E91E63',
              }
            }}
            disabled
          />

          <Text style={styles.label}>Número</Text>
          <TextInput
            value={form.addressNumber}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressNumber: text }))}
            style={[styles.input, form.addressNumber && styles.filledInput]}
            contentStyle={{ color: '#000000', fontSize: 16 }}
            theme={{
              colors: {
                text: '#000000',
                disabled: '#000000',
                placeholder: '#666666',
                primary: '#E91E63',
              }
            }}
            disabled
          />

          <Text style={styles.label}>Complemento</Text>
          <TextInput
            value={form.addressComplement}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressComplement: text }))}
            style={[styles.input, form.addressComplement && styles.filledInput]}
            contentStyle={{ color: '#000000', fontSize: 16 }}
            theme={{
              colors: {
                text: '#000000',
                disabled: '#000000',
                placeholder: '#666666',
                primary: '#E91E63',
              }
            }}
            disabled
          />

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            value={form.addressNeighborhood}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressNeighborhood: text }))}
            style={[styles.input, form.addressNeighborhood && styles.filledInput]}
            contentStyle={{ color: '#000000', fontSize: 16 }}
            theme={{
              colors: {
                text: '#000000',
                disabled: '#000000',
                placeholder: '#666666',
                primary: '#E91E63',
              }
            }}
            disabled
          />

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            value={form.addressCity}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressCity: text }))}
            style={[styles.input, form.addressCity && styles.filledInput]}
            contentStyle={{ color: '#000000', fontSize: 16 }}
            theme={{
              colors: {
                text: '#000000',
                disabled: '#000000',
                placeholder: '#666666',
                primary: '#E91E63',
              }
            }}
            disabled
          />

          <Text style={styles.label}>Estado</Text>
          <TextInput
            value={form.addressState}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressState: text }))}
            style={[styles.input, form.addressState && styles.filledInput]}
            contentStyle={{ color: '#000000', fontSize: 16 }}
            theme={{
              colors: {
                text: '#000000',
                disabled: '#000000',
                placeholder: '#666666',
                primary: '#E91E63',
              }
            }}
            disabled
          />
        </View>
        {/* Seção de Encerramento de Conta */}
        <View style={styles.closeAccountSection}>
          <Button
            mode="contained"
            onPress={() => setShowCloseAccountDialog(true)}
            style={styles.closeAccountButton}
            labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
            buttonColor="#F44336"
            icon="logout"
          >
            ENCERRAR CONTA
          </Button>
        </View>
      </ScrollView>
      <CloseAccountDialog
        visible={showCloseAccountDialog}
        onDismiss={() => setShowCloseAccountDialog(false)}
        documentNumber={userTaxId}
        accountNumber={accountNumber}
        onCloseAccount={handleCloseAccount}
        isClosingAccount={isClosingAccount}
        closeAccountError={closeAccountError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 8,
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
    marginTop: -4,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    marginTop: 24,
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    fontSize: 16,
    height: 48,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filledInput: {
    fontWeight: '500',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  closeAccountSection: {
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  closeAccountButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 4,
  },
});
