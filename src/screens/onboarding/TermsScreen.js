import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Text, Checkbox, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TERMS_TEXT } from '../../constants/terms';

export default function TermsScreen() {
  const navigation = useNavigation();
  const { onboardingData, setTermsAccepted, updateOnboardingData } = useOnboarding();
  const [accepted, setAccepted] = useState(false);

  const handleAcceptTerms = () => {
    // Marca os termos como aceitos
    setTermsAccepted();

    // Navega para a próxima tela
    if (onboardingData.accountType === 'PF') {
      navigation.navigate('OnboardingPersonalData');
    } else {
      navigation.navigate('CompanyData');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Camada 1: Header Fixo */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TERMOS E CONDIÇÕES</Text>
          <View style={styles.backButton} />
        </View>

        {/* Camada 2: Viewport Fixo com Conteúdo Rolável */}
        <View style={styles.viewportContainer}>
          <View style={styles.viewport}>
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.termsBox}>
                <Image 
                  source={require('../../assets/images/logo-white.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.mainTitle}>
                  CONDIÇÕES GERAIS DE ABERTURA E{'\n'}
                  MANUTENÇÃO DE CONTA DE PAGAMENTO{'\n'}
                  PRÉ-PAGA {onboardingData.accountType === 'PF' ? 'PESSOA FÍSICA' : 'PESSOA JURÍDICA'}
                </Text>

                <Text style={styles.paragraph}>
                  {TERMS_TEXT.INTRODUCTION}
                </Text>

                {TERMS_TEXT.SERVICES.map((service, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    <Text style={styles.paragraph}>{service.content}</Text>
                  </View>
                ))}

                {TERMS_TEXT.CLAUSES.map((clause, index) => (
                  <View key={index} style={styles.clauseItem}>
                    <Text style={styles.clauseTitle}>
                      [Cláusula {clause.number}] {clause.title}
                    </Text>
                    <Text style={styles.paragraph}>{clause.content}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Camada 3: Footer Fixo */}
        <View style={styles.footer}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={accepted ? 'checked' : 'unchecked'}
              onPress={() => setAccepted(!accepted)}
              color="#682145"
            />
            <Text style={styles.checkboxLabel}>
              LI E CONCORDO COM OS TERMOS E CONDIÇÕES
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleAcceptTerms}
            disabled={!accepted}
            style={[styles.button, !accepted && styles.buttonDisabled]}
            labelStyle={styles.buttonLabel}
          >
            CONTINUAR
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  viewportContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    position: 'relative',
  },
  viewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  termsBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    borderRadius: 4,
  },
  logo: {
    width: 120,
    height: 30,
    alignSelf: 'center',
    marginBottom: 24,
    tintColor: '#682145',
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  serviceItem: {
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  clauseItem: {
    marginBottom: 24,
  },
  clauseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 16,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    zIndex: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 4,
    height: 48,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
