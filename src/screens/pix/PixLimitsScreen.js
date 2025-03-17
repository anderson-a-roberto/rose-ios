import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../../config/supabase';

const formatCurrency = (value) => {
  if (!value) return '';
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/[^0-9]/g, '');
  // Converte para número e formata como moeda
  const formattedValue = (Number(numericValue) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  return formattedValue;
};

const parseCurrency = (value) => {
  if (!value) return '';
  // Remove todos os caracteres não numéricos
  return value.replace(/[^0-9]/g, '');
};

const PixLimitsScreen = ({ navigation }) => {
  // Estados para os limites
  const [personDayLimit, setPersonDayLimit] = useState('300000'); // R$ 3.000,00
  const [personNightLimit, setPersonNightLimit] = useState('100000'); // R$ 1.000,00
  const [companyDayLimit, setCompanyDayLimit] = useState('300000'); // R$ 3.000,00
  const [companyNightLimit, setCompanyNightLimit] = useState('100000'); // R$ 1.000,00
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar limites atuais do usuário
  useEffect(() => {
    fetchUserLimits();
  }, []);

  const fetchUserLimits = async () => {
    try {
      setIsLoading(true);
      
      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Erro ao obter usuário:', userError);
        return;
      }
      
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }

      // Buscar limites do usuário no banco de dados
      const { data, error } = await supabase
        .from('pix_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        console.error('Erro ao buscar limites:', error);
        return;
      }

      // Se encontrou dados, atualiza os estados
      if (data) {
        setPersonDayLimit(data.person_day_limit.toString());
        setPersonNightLimit(data.person_night_limit.toString());
        setCompanyDayLimit(data.company_day_limit.toString());
        setCompanyNightLimit(data.company_night_limit.toString());
      }
    } catch (error) {
      console.error('Erro ao buscar limites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLimits = async () => {
    try {
      setIsSaving(true);
      
      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Erro ao obter usuário:', userError);
        return;
      }
      
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }

      // Verificar se já existe um registro para o usuário
      const { data: existingData, error: checkError } = await supabase
        .from('pix_limits')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar limites existentes:', checkError);
        return;
      }

      // Preparar dados para salvar
      const limitsData = {
        user_id: user.id,
        person_day_limit: parseInt(personDayLimit),
        person_night_limit: parseInt(personNightLimit),
        company_day_limit: parseInt(companyDayLimit),
        company_night_limit: parseInt(companyNightLimit),
        updated_at: new Date()
      };

      let result;
      
      // Se já existe, atualiza. Caso contrário, insere.
      if (existingData) {
        result = await supabase
          .from('pix_limits')
          .update(limitsData)
          .eq('id', existingData.id);
      } else {
        result = await supabase
          .from('pix_limits')
          .insert([limitsData]);
      }

      if (result.error) {
        console.error('Erro ao salvar limites:', result.error);
        return;
      }

      // Exibir mensagem de sucesso
      alert('Limites atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar limites:', error);
      alert('Erro ao salvar limites. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencyInput = (value, setter) => {
    const numericValue = parseCurrency(value);
    setter(numericValue);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
            <Text style={styles.headerTitle}>Meus Limites PIX</Text>
            <Text style={styles.subtitle}>Defina limites personalizados para suas transferências</Text>
          </View>
        </View>


        <ScrollView style={styles.scrollView}>
          <View style={styles.container}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Suas transferências ainda mais protegidas</Text>
              <Text style={styles.infoDescription}>
                Defina limites personalizados para suas transferências PIX, garantindo mais segurança para suas transações.
              </Text>
            </View>

            {/* Limites para pessoas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Defina quanto pode ser enviado para pessoas</Text>
              
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limite PIX Dia (6h às 20h)</Text>
                <TextInput
                  style={styles.limitInput}
                  value={formatCurrency(personDayLimit)}
                  onChangeText={(value) => handleCurrencyInput(value, setPersonDayLimit)}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#E91E63"
                  disabled={isLoading}
                />
              </View>
              
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limite PIX Noite (20h às 6h)</Text>
                <TextInput
                  style={styles.limitInput}
                  value={formatCurrency(personNightLimit)}
                  onChangeText={(value) => handleCurrencyInput(value, setPersonNightLimit)}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#E91E63"
                  disabled={isLoading}
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Limites para empresas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Defina quanto pode ser enviado para empresas</Text>
              
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limite PIX Dia (6h às 20h)</Text>
                <TextInput
                  style={styles.limitInput}
                  value={formatCurrency(companyDayLimit)}
                  onChangeText={(value) => handleCurrencyInput(value, setCompanyDayLimit)}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#E91E63"
                  disabled={isLoading}
                />
              </View>
              
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limite PIX Noite (20h às 6h)</Text>
                <TextInput
                  style={styles.limitInput}
                  value={formatCurrency(companyNightLimit)}
                  onChangeText={(value) => handleCurrencyInput(value, setCompanyNightLimit)}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#E91E63"
                  disabled={isLoading}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSaveLimits}
            style={styles.saveButton}
            buttonColor="#E91E63"
            textColor="#FFFFFF"
            loading={isSaving}
            disabled={isSaving || isLoading}
          >
            Salvar Limites
          </Button>
        </View>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
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
  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginVertical: 16,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  limitItem: {
    marginBottom: 16,
  },
  limitLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  limitInput: {
    backgroundColor: '#FFF',
    height: 50,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#E0E0E0',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    borderRadius: 4,
    height: 50,
    justifyContent: 'center',
  },
});

export default PixLimitsScreen;
