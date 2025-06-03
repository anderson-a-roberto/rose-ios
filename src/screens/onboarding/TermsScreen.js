import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform } from 'react-native';
import { Text, Checkbox, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TERMS_TEXT } from '../../constants/terms';

export default function TermsScreen({ route }) {
  const navigation = useNavigation();
  const { onboardingData, setTermsAccepted, updateOnboardingData } = useOnboarding();
  const [accepted, setAccepted] = useState(false);
  
  // Receber parâmetros diretamente da rota
  const { documentNumber, accountType } = route.params || {};
  
  // Atualizar o contexto com os dados da rota ao montar o componente
  React.useEffect(() => {
    if (documentNumber && accountType) {
      console.log('TermsScreen: Atualizando contexto com dados da rota', { documentNumber, accountType });
      updateOnboardingData({
        accountType,
        ...(accountType === 'PF' 
          ? { personalData: { documentNumber } }
          : { companyData: { documentNumber } }
        ),
      });
    }
  }, [documentNumber, accountType]);

  const handleAcceptTerms = () => {
    // Marca os termos como aceitos
    setTermsAccepted();

    // Navega para a próxima tela
    // Usar accountType da rota se disponível, senão usar do contexto
    const currentAccountType = accountType || onboardingData.accountType;
    
    if (currentAccountType === 'PF') {
      navigation.navigate('OnboardingPersonalData');
    } else {
      navigation.navigate('CompanyData');
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
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Termos e Condições</Text>
            <Text style={styles.subtitle}>
              Leia com atenção os termos e condições
            </Text>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Scrollable Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
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
                PRÉ-PAGA {(accountType || onboardingData.accountType) === 'PF' ? 'PESSOA FÍSICA' : 'PESSOA JURÍDICA'}
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

          {/* Footer - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAccepted(!accepted)}
              activeOpacity={0.7}
            >
              <View style={styles.customCheckbox}>
                {accepted && (
                  <View style={styles.checkboxInner}>
                    <Text style={styles.checkboxIcon}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Li e concordo com os termos e condições
              </Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleAcceptTerms}
              disabled={!accepted}
              style={[styles.continueButton, !accepted && styles.buttonDisabled]}
              labelStyle={styles.continueButtonLabel}
            >
              CONTINUAR
            </Button>
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 32,
    color: '#E91E63',
    marginTop: -4,
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  termsBox: {
    borderWidth: 1,
    borderColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 30,
    alignSelf: 'center',
    marginBottom: 24,
    tintColor: '#E91E63',
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  clauseItem: {
    marginBottom: 24,
  },
  clauseTitle: {
    fontSize: 14,
    fontWeight: '600',
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
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#682145',
    borderRadius: 4,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  continueButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
});
