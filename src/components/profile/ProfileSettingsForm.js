import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface } from 'react-native-paper';
import { supabase } from '../../config/supabase';
import MaskInput from 'react-native-mask-input';

export default function ProfileSettingsForm({ onBack }) {
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

    // Endereço
    addressPostalCode: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          full_name, social_name, email, phone_number, birth_date, 
          mother_name, document_number, document_type,
          address_postal_code, address_street, address_number, address_complement,
          address_neighborhood, address_city, address_state
        `)
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        setForm({
          // Dados Pessoais
          fullName: profile.full_name || '',
          socialName: profile.social_name || '',
          email: profile.email || '',
          phoneNumber: profile.phone_number || '',
          birthDate: profile.birth_date || '',
          motherName: profile.mother_name || '',
          documentNumber: profile.document_number || '',
          documentType: profile.document_type || 'CPF',

          // Endereço
          addressPostalCode: profile.address_postal_code || '',
          addressStreet: profile.address_street || '',
          addressNumber: profile.address_number || '',
          addressComplement: profile.address_complement || '',
          addressNeighborhood: profile.address_neighborhood || '',
          addressCity: profile.address_city || '',
          addressState: profile.address_state || ''
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          // Dados Pessoais
          full_name: form.fullName,
          social_name: form.socialName,
          email: form.email,
          phone_number: form.phoneNumber,
          birth_date: form.birthDate,
          mother_name: form.motherName,
          document_number: form.documentNumber,
          document_type: form.documentType,

          // Endereço
          address_postal_code: form.addressPostalCode,
          address_street: form.addressStreet,
          address_number: form.addressNumber,
          address_complement: form.addressComplement,
          address_neighborhood: form.addressNeighborhood,
          address_city: form.addressCity,
          address_state: form.addressState
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      console.log('Perfil atualizado com sucesso!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.fullName) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF1493" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={styles.backButton}
        >
          Voltar
        </Button>
      </View>

      <Text style={styles.title}>Configurações do Perfil</Text>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <ScrollView style={styles.form}>
        {/* Dados Pessoais */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                value={form.fullName}
                onChangeText={(value) => handleChange('fullName', value)}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Nome Social</Text>
              <TextInput
                value={form.socialName}
                onChangeText={(value) => handleChange('socialName', value)}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(value) => handleChange('email', value)}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                value={form.phoneNumber}
                onChangeText={(value) => handleChange('phoneNumber', value)}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
                render={props => (
                  <MaskInput
                    {...props}
                    mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                value={form.birthDate}
                onChangeText={(value) => handleChange('birthDate', value)}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
                render={props => (
                  <MaskInput
                    {...props}
                    mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
                  />
                )}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Nome da Mãe</Text>
              <TextInput
                value={form.motherName}
                onChangeText={(value) => handleChange('motherName', value)}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>CPF/CNPJ</Text>
              <TextInput
                value={form.documentNumber}
                mode="outlined"
                style={styles.input}
                disabled={true}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
                render={props => (
                  <MaskInput
                    {...props}
                    mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                  />
                )}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Tipo do Documento</Text>
              <TextInput
                value={form.documentType}
                mode="outlined"
                style={styles.input}
                disabled={true}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
          </View>
        </Surface>

        {/* Endereço */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço</Text>

          <Text style={styles.label}>CEP</Text>
          <TextInput
            value={form.addressPostalCode}
            onChangeText={(value) => handleChange('addressPostalCode', value)}
            mode="outlined"
            style={[styles.input, { marginBottom: 24 }]}
            disabled={loading}
            outlineColor="#666"
            activeOutlineColor="#000"
            textColor="#000"
            render={props => (
              <MaskInput
                {...props}
                mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]}
              />
            )}
          />

          <Text style={styles.label}>Rua</Text>
          <TextInput
            value={form.addressStreet}
            onChangeText={(value) => handleChange('addressStreet', value)}
            mode="outlined"
            style={[styles.input, { marginBottom: 24 }]}
            disabled={loading}
            outlineColor="#666"
            activeOutlineColor="#000"
            textColor="#000"
          />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Número</Text>
              <TextInput
                value={form.addressNumber}
                onChangeText={(value) => handleChange('addressNumber', value)}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                value={form.addressComplement}
                onChangeText={(value) => handleChange('addressComplement', value)}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
          </View>

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            value={form.addressNeighborhood}
            onChangeText={(value) => handleChange('addressNeighborhood', value)}
            mode="outlined"
            style={[styles.input, { marginBottom: 24 }]}
            disabled={loading}
            outlineColor="#666"
            activeOutlineColor="#000"
            textColor="#000"
          />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                value={form.addressCity}
                onChangeText={(value) => handleChange('addressCity', value)}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Estado</Text>
              <TextInput
                value={form.addressState}
                onChangeText={(value) => handleChange('addressState', value)}
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor="#666"
                activeOutlineColor="#000"
                textColor="#000"
              />
            </View>
          </View>
        </Surface>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        >
          Salvar Alterações
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    paddingHorizontal: 16,
    color: '#000000',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#000000',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#FF0000',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: '#FF1493',
    padding: 8,
  },
});
