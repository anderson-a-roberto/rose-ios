import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const InfoItem = ({ icon, title, description }) => (
  <View style={styles.infoItem}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="#682145" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoDescription}>{description}</Text>
    </View>
  </View>
);

const PixInfoScreen = ({ navigation }) => {
  const openBCBLink = () => {
    Linking.openURL('https://www.bcb.gov.br/acessoinformacao/');
  };

  const openBCBComplaintLink = () => {
    Linking.openURL('https://www.bcb.gov.br/acessoinformacao/registrar_reclamacao');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#682145" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dúvidas sobre o Pix</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Seção de Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que é o Pix?</Text>
          <Text style={styles.sectionDescription}>
            O Pix é o meio de pagamento instantâneo criado pelo Banco Central do Brasil.
            Com ele, você pode fazer e receber transferências a qualquer hora do dia, todos os dias do ano,
            incluindo fins de semana e feriados.
          </Text>
        </View>

        {/* Características principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características principais</Text>
          
          <InfoItem 
            icon="flash" 
            title="Velocidade" 
            description="Transação realizada em poucos segundos, 24 horas por dia, 7 dias por semana." 
          />
          
          <InfoItem 
            icon="calendar-clock" 
            title="Disponibilidade" 
            description="Disponível a qualquer dia e a qualquer hora, incluindo finais de semana e feriados." 
          />
          
          <InfoItem 
            icon="hand-coin" 
            title="Conveniência" 
            description="Experiência simples e prática, sem necessidade de dados complexos." 
          />
          
          <InfoItem 
            icon="cash" 
            title="Custo" 
            description="Gratuito para pessoas físicas e jurídicas. Sem tarifas para transferências." 
          />
          
          <InfoItem 
            icon="qrcode" 
            title="Formas de iniciação" 
            description="Transferências via chave Pix, QR Code ou dados bancários." 
          />
        </View>

        {/* Atendimento e Reclamações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atendimento e Reclamações</Text>
          <Text style={styles.sectionDescription}>
            Se você tiver algum problema com uma transação Pix, entre em contato com nosso suporte.
          </Text>
          
          <Text style={styles.noteText}>
            Caso sua ocorrência não seja resolvida pelo nosso atendimento, você pode registrar uma reclamação no site do Banco Central:
          </Text>
          
          <TouchableOpacity style={styles.linkContainer} onPress={openBCBComplaintLink}>
            <MaterialCommunityIcons name="bank" size={16} color="#682145" />
            <Text style={styles.linkText}>Registrar Reclamação no Banco Central</Text>
          </TouchableOpacity>
        </View>

        {/* Mais Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mais Informações</Text>
          <Text style={styles.sectionDescription}>
            Para mais informações sobre o Pix, visite o site do Banco Central do Brasil:
          </Text>
          
          <TouchableOpacity style={styles.linkContainer} onPress={openBCBLink}>
            <MaterialCommunityIcons name="information" size={16} color="#682145" />
            <Text style={styles.linkText}>Acessar Site do Banco Central</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0e6eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  noteText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  linkText: {
    color: '#682145',
    fontWeight: '500',
    marginLeft: 8,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

export default PixInfoScreen;
