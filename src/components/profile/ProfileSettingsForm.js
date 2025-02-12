import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
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
          fullName: profile.full_name || '',
          socialName: profile.social_name || '',
          email: profile.email || '',
          phoneNumber: profile.phone_number || '',
          birthDate: profile.birth_date || '',
          motherName: profile.mother_name || '',
          documentNumber: profile.document_number || '',
          documentType: profile.document_type || 'CPF',
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
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            value={form.fullName}
            onChangeText={(text) => setForm(prev => ({ ...prev, fullName: text }))}
            style={[styles.input, form.fullName && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Nome Social</Text>
          <TextInput
            value={form.socialName}
            onChangeText={(text) => setForm(prev => ({ ...prev, socialName: text }))}
            style={[styles.input, form.socialName && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
            style={[styles.input, form.email && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            value={form.phoneNumber}
            onChangeText={(text) => setForm(prev => ({ ...prev, phoneNumber: text }))}
            style={[styles.input, form.phoneNumber && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput
            value={form.birthDate}
            onChangeText={(text) => setForm(prev => ({ ...prev, birthDate: text }))}
            style={[styles.input, form.birthDate && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Nome da Mãe</Text>
          <TextInput
            value={form.motherName}
            onChangeText={(text) => setForm(prev => ({ ...prev, motherName: text }))}
            style={[styles.input, form.motherName && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>CPF/CNPJ</Text>
          <TextInput
            value={form.documentNumber}
            onChangeText={(text) => setForm(prev => ({ ...prev, documentNumber: text }))}
            style={[styles.input, form.documentNumber && styles.filledInput]}
            disabled
          />

          {/* Endereço */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Endereço</Text>

          <Text style={styles.label}>CEP</Text>
          <TextInput
            value={form.addressPostalCode}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressPostalCode: text }))}
            style={[styles.input, form.addressPostalCode && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Rua</Text>
          <TextInput
            value={form.addressStreet}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressStreet: text }))}
            style={[styles.input, form.addressStreet && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Número</Text>
          <TextInput
            value={form.addressNumber}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressNumber: text }))}
            style={[styles.input, form.addressNumber && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Complemento</Text>
          <TextInput
            value={form.addressComplement}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressComplement: text }))}
            style={[styles.input, form.addressComplement && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            value={form.addressNeighborhood}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressNeighborhood: text }))}
            style={[styles.input, form.addressNeighborhood && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Cidade</Text>
          <TextInput
            value={form.addressCity}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressCity: text }))}
            style={[styles.input, form.addressCity && styles.filledInput]}
            disabled
          />

          <Text style={styles.label}>Estado</Text>
          <TextInput
            value={form.addressState}
            onChangeText={(text) => setForm(prev => ({ ...prev, addressState: text }))}
            style={[styles.input, form.addressState && styles.filledInput]}
            disabled
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={onBack}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Voltar
        </Button>
      </View>
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
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  button: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});
