import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../../config/supabase';

// Funções de formatação
const formatCNPJ = (cnpj) => cnpj.replace(/\D/g, '');

const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55')) {
    return '+55' + cleaned;
  }
  return '+' + cleaned;
};

const formatDate = (date) => {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

const formatCEP = (cep) => cep.replace(/\D/g, '');

const CompanyPasswordScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validar dados necessários
      if (!onboardingData.companyData?.documentNumber) {
        throw new Error('Dados da empresa não encontrados');
      }
      if (!onboardingData.companyContact?.businessEmail) {
        throw new Error('Email não encontrado');
      }
      if (!onboardingData.partners || onboardingData.partners.length === 0) {
        throw new Error('Nenhum sócio cadastrado');
      }

      console.log('Dados para cadastro:', {
        email: onboardingData.companyContact.businessEmail,
        cnpj: onboardingData.companyData.documentNumber,
        businessName: onboardingData.companyData.businessName,
        partners: onboardingData.partners
      });

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: onboardingData.companyContact.businessEmail.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            cnpj: formatCNPJ(onboardingData.companyData.documentNumber),
            business_name: onboardingData.companyData.businessName,
            account_type: 'PJ'
          }
        }
      });
      
      if (authError) {
        console.error('Erro ao criar conta:', authError);
        throw new Error('Erro ao criar conta: ' + authError.message);
      }
      
      console.log('Conta criada com sucesso:', authData);

      if (!authData?.user?.id) {
        throw new Error('ID do usuário não encontrado após criar conta');
      }

      // 2. Inserir no profiles
      const profileData = {
        id: authData.user.id,
        document_type: 'CNPJ',
        document_number: formatCNPJ(onboardingData.companyData.documentNumber),
        full_name: onboardingData.companyData.businessName,
        company_type: onboardingData.companyData.companyType,
        business_name: onboardingData.companyData.businessName,
        trading_name: onboardingData.companyData.tradingName,
        business_email: onboardingData.companyContact.businessEmail.toLowerCase().trim(),
        contact_number: formatPhone(onboardingData.companyContact.contactNumber),
        address_postal_code: formatCEP(onboardingData.companyAddress.postalCode),
        address_street: onboardingData.companyAddress.street,
        address_number: onboardingData.companyAddress.number,
        address_complement: onboardingData.companyAddress.addressComplement || null,
        address_neighborhood: onboardingData.companyAddress.neighborhood,
        address_city: onboardingData.companyAddress.city,
        address_state: onboardingData.companyAddress.state,
        owners: onboardingData.partners.map(partner => ({
          ownerType: partner.ownerType,
          documentNumber: partner.documentNumber.replace(/\D/g, ''),
          fullName: partner.fullName,
          phoneNumber: formatPhone(partner.phoneNumber),
          email: partner.email,
          motherName: partner.motherName,
          socialName: partner.socialName,
          birthDate: formatDate(partner.birthDate),
          isPoliticallyExposedPerson: partner.isPoliticallyExposedPerson,
          address: {
            postalCode: formatCEP(partner.address.postalCode),
            street: partner.address.street,
            number: partner.address.number,
            addressComplement: partner.address.addressComplement || undefined,
            neighborhood: partner.address.neighborhood,
            city: partner.address.city,
            state: partner.address.state
          }
        }))
      };

      console.log('Dados do perfil a serem inseridos:', profileData);

      const { error: profileError } = await supabase.from('profiles').insert(profileData);
      
      if (profileError) {
        console.error('Erro ao salvar perfil:', profileError);
        throw new Error('Erro ao salvar perfil: ' + profileError.message);
      }

      console.log('Perfil criado com sucesso');

      // 3. Gerar código do cliente
      const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-client-code');
      
      if (codeError) {
        console.error('Erro ao gerar código:', codeError);
        throw new Error('Erro ao gerar código: ' + codeError.message);
      }

      console.log('Código gerado:', codeData);

      // 4. Preparar dados para Celcoin
      const celcoinData = {
        clientCode: codeData.code,
        documentNumber: formatCNPJ(onboardingData.companyData.documentNumber),
        businessName: onboardingData.companyData.businessName,
        tradingName: onboardingData.companyData.tradingName,
        businessEmail: onboardingData.companyContact.businessEmail.toLowerCase().trim(),
        contactNumber: formatPhone(onboardingData.companyContact.contactNumber),
        companyType: onboardingData.companyData.companyType,
        address: {
          postalCode: formatCEP(onboardingData.companyAddress?.postalCode || ''),
          street: onboardingData.companyAddress?.street || '',
          number: onboardingData.companyAddress?.number || '',
          addressComplement: onboardingData.companyAddress?.addressComplement,
          neighborhood: onboardingData.companyAddress?.neighborhood || '',
          city: onboardingData.companyAddress?.city || '',
          state: onboardingData.companyAddress?.state || ''
        },
        owner: onboardingData.partners.map(partner => ({
          ownerType: partner.ownerType || 'SOCIO',
          documentNumber: partner.documentNumber.replace(/\D/g, ''),
          fullName: partner.fullName || '',
          socialName: partner.socialName,
          birthDate: formatDate(partner.birthDate || ''),
          motherName: partner.motherName || '',
          email: partner.email || '',
          phoneNumber: formatPhone(partner.phoneNumber || ''),
          isPoliticallyExposedPerson: !!partner.isPoliticallyExposedPerson,
          address: {
            postalCode: formatCEP(partner.address?.postalCode || ''),
            street: partner.address?.street || '',
            number: partner.address?.number || '',
            addressComplement: partner.address?.addressComplement,
            neighborhood: partner.address?.neighborhood || '',
            city: partner.address?.city || '',
            state: partner.address?.state || ''
          }
        }))
      };

      console.log('Dados para Celcoin:', celcoinData);

      // 5. Enviar para Celcoin
      const { error: celcoinError } = await supabase.functions.invoke('submit-onboarding', {
        body: celcoinData
      });
      
      if (celcoinError) {
        console.error('Erro ao enviar para Celcoin:', celcoinError);
        throw new Error('Erro ao enviar para Celcoin: ' + celcoinError.message);
      }

      console.log('Dados enviados para Celcoin com sucesso');

      // 6. Navegar para sucesso
      navigation.navigate('OnboardingSuccess');
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="chevron-left" size={32} color="#E91E63" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Senha do App</Text>
            <Text style={styles.subtitle}>
              Nesta etapa, você vai precisar cadastrar uma senha de acesso ao app
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <TextInput
              label="Senha"
              value={formData.password}
              onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#666666"
                />
              }
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
            />

            <TextInput
              label="Confirmar Senha"
              value={formData.confirmPassword}
              onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color="#666666"
                />
              }
              mode="flat"
              style={styles.input}
              contentStyle={styles.inputContent}
              theme={{
                colors: {
                  primary: '#E91E63',
                  error: '#B00020',
                  onSurfaceVariant: '#666666',
                  onSurface: '#000000',
                },
              }}
            />

            {error ? (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            ) : null}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.continueButton}
            labelStyle={styles.continueButtonLabel}
            loading={loading}
            disabled={loading || !formData.password || !formData.confirmPassword}
          >
            {loading ? 'SALVANDO...' : 'CONTINUAR'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  inputContent: {
    backgroundColor: '#FFF',
    fontSize: 16,
    paddingHorizontal: 0,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: '#E91E63',
    height: 48,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default CompanyPasswordScreen;
