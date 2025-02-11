import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PepInfoScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [checked, setChecked] = React.useState(onboardingData.personalData.isPep ? 'yes' : 'no');

  const handleNext = () => {
    updateOnboardingData({
      personalData: {
        ...onboardingData.personalData,
        isPep: checked === 'yes'
      }
    });
    navigation.navigate('OnboardingAddress');
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
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Pessoa Politicamente Exposta</Text>
            <Text style={styles.subtitle}>
              Precisamos saber se você tem alguma relação com atividades políticas
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                É considerada uma Pessoa Politicamente Exposta (PPE) ou (Pessoa Exposta Politicamente (PEP)) aquela que ocupa cargos e funções públicas listadas nas normas de Prevenção à Lavagem de Dinheiro e de Financiamento ao Terrorismo, editadas pelos órgãos reguladores e fiscalizadores.
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.optionRow}
                onPress={() => setChecked('no')}
              >
                <RadioButton
                  value="no"
                  status={checked === 'no' ? 'checked' : 'unchecked'}
                  onPress={() => setChecked('no')}
                  color="#E91E63"
                />
                <Text style={styles.optionText}>
                  Não sou e não tenho vínculo com pessoa exposta politicamente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionRow}
                onPress={() => setChecked('yes')}
              >
                <RadioButton
                  value="yes"
                  status={checked === 'yes' ? 'checked' : 'unchecked'}
                  onPress={() => setChecked('yes')}
                  color="#E91E63"
                />
                <Text style={styles.optionText}>
                  Sou pessoa politicamente exposta
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.continueButton}
            labelStyle={styles.continueButtonLabel}
          >
            CONTINUAR
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
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#FFF',
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
  content: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 24,
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
  },
  continueButton: {
    borderRadius: 4,
    backgroundColor: '#E91E63',
    height: 48,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

export default PepInfoScreen;
