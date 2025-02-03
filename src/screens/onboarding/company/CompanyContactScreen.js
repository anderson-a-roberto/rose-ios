import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import TestDataButton from '../../../components/TestDataButton';
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

const CompanyContactScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    businessEmail: onboardingData.companyContact?.businessEmail || '',
    contactNumber: onboardingData.companyContact?.contactNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Atualizar dados de contato
      updateOnboardingData({
        companyContact: {
          businessEmail: formData.businessEmail.toLowerCase().trim(),
          contactNumber: formData.contactNumber
        }
      });

      // 2. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.businessEmail.toLowerCase().trim(),
        password: onboardingData.securityData.password,
        options: {
          data: {
            cnpj: formatCNPJ(onboardingData.companyData.documentNumber),
            business_name: onboardingData.companyData.businessName,
            account_type: 'PJ'
          }
        }
      });
      if (authError) throw new Error('Erro ao criar conta: ' + authError.message);

      // 3. Inserir no profiles com dados da empresa e array de sócios
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        document_type: 'CNPJ',
        document_number: formatCNPJ(onboardingData.companyData.documentNumber),
        full_name: onboardingData.companyData.businessName, // Nome da empresa
        company_type: onboardingData.companyData.companyType,
        business_name: onboardingData.companyData.businessName,
        trading_name: onboardingData.companyData.tradingName,
        business_email: formData.businessEmail.toLowerCase().trim(),
        contact_number: formatPhone(formData.contactNumber),
        address_postal_code: formatCEP(onboardingData.companyAddress.postalCode),
        address_street: onboardingData.companyAddress.street,
        address_number: onboardingData.companyAddress.number,
        address_complement: onboardingData.companyAddress.addressComplement || null,
        address_neighborhood: onboardingData.companyAddress.neighborhood,
        address_city: onboardingData.companyAddress.city,
        address_state: onboardingData.companyAddress.state,
        // Array de sócios
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
      });
      if (profileError) throw new Error('Erro ao salvar perfil: ' + profileError.message);

      // 4. Gerar código do cliente
      const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-client-code');
      if (codeError) throw new Error('Erro ao gerar código: ' + codeError.message);

      // 5. Preparar dados para Celcoin
      const celcoinData = {
        clientCode: codeData.code,
        documentNumber: formatCNPJ(onboardingData.companyData.documentNumber),
        businessName: onboardingData.companyData.businessName,
        tradingName: onboardingData.companyData.tradingName,
        businessEmail: formData.businessEmail.toLowerCase().trim(),
        contactNumber: formatPhone(formData.contactNumber),
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
        owner: (onboardingData.partners || []).map(partner => ({
          ownerType: partner.ownerType || 'SOCIO',
          documentNumber: (partner.documentNumber || '').replace(/\D/g, ''),
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

      // Log para debug
      console.log('Dados enviados para Celcoin:', JSON.stringify(celcoinData, null, 2));

      // 6. Enviar para Celcoin
      const { error: celcoinError } = await supabase.functions.invoke('submit-onboarding', {
        body: celcoinData
      });
      if (celcoinError) throw new Error('Erro ao enviar para Celcoin: ' + celcoinError.message);

      // 7. Navegar para tela de sucesso
      navigation.navigate('OnboardingSuccess');
    } catch (err) {
      console.log('Erro no cadastro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TestDataButton
        section="companyContact"
        onFill={(data) => setFormData(data)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Contato da Empresa</Text>
      <Text style={styles.subtitle}>
        Informe os dados de contato da empresa
      </Text>

      <View style={styles.form}>
        <TextInput
          label="E-mail comercial"
          value={formData.businessEmail}
          onChangeText={(value) => setFormData(prev => ({ ...prev, businessEmail: value }))}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!error}
        />

        <TextInput
          label="Telefone de contato"
          value={formData.contactNumber}
          onChangeText={(value) => setFormData(prev => ({ ...prev, contactNumber: value }))}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
        />

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          disabled={loading || !formData.businessEmail || !formData.contactNumber}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            'CONTINUAR'
          )}
        </Button>
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 24,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    color: '#666',
  },
  form: {
    paddingHorizontal: 24,
  },
  input: {
    marginTop: 16,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: '#000',
  },
});

export default CompanyContactScreen;
