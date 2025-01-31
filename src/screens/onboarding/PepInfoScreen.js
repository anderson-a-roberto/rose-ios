import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Pessoa politicamente exposta</Text>

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
            color="#000"
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
            color="#000"
          />
          <Text style={styles.optionText}>
            Sou pessoa politicamente exposta
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.continueButton}
        labelStyle={styles.continueButtonLabel}
      >
        CONTINUAR
      </Button>
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
    marginBottom: 24,
    color: '#000',
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionsContainer: {
    marginTop: 32,
    marginHorizontal: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#000',
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 24,
    borderRadius: 25,
  },
  continueButtonLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default PepInfoScreen;
