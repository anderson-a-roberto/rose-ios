import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCurrency = (value) => {
  // Converte para número e formata como moeda
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const PixLimitsScreen = ({ navigation }) => {
  // Limites fixos definidos pelo Banco Central
  const personDayLimit = 3000.00; // R$ 3.000,00
  const personNightLimit = 1000.00; // R$ 1.000,00
  const companyDayLimit = 3000.00; // R$ 3.000,00
  const companyNightLimit = 1000.00; // R$ 1.000,00

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      <View style={{ flex: 1 }}>
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
            <Text style={styles.subtitle}>Limites de transferência PIX</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.container}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Suas transferências ainda mais protegidas</Text>
              <Text style={styles.infoDescription}>Limites de transferência PIX definidos pelo Banco Central para garantir mais segurança para suas transações.</Text>
            </View>

            {/* Limites para pessoas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Limites para pessoas</Text>
              
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limite PIX Dia (6h às 20h)</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{formatCurrency(personDayLimit)}</Text>
                </View>
              </View>
              
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limite PIX Noite (20h às 6h)</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{formatCurrency(personNightLimit)}</Text>
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Limites para empresas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Defina quanto pode ser enviado para empresas</Text>
              
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limite PIX Dia (6h às 20h)</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{formatCurrency(companyDayLimit)}</Text>
                </View>
              </View>
              
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limite PIX Noite (20h às 6h)</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>{formatCurrency(companyNightLimit)}</Text>
                </View>
              </View>
            </View>
            
            {/* Texto de contato com suporte */}
            <View style={styles.supportSection}>
              <Text style={styles.supportText}>
                Para solicitar alterações nos seus limites PIX, entre em contato com o suporte.
              </Text>
            </View>
          </View>
        </ScrollView>

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
  valueContainer: {
    backgroundColor: '#F5F5F5',
    height: 50,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
  supportSection: {
    marginVertical: 24,
    marginHorizontal: 20,
    padding: 16,
  },
  supportText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PixLimitsScreen;
