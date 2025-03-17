import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PepInfoScreen = ({ navigation, route }) => {
  console.log('[PepInfoScreen] Inicializando tela PEP');
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [checked, setChecked] = useState('no'); // Default: não é PEP
  const [clickCount, setClickCount] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    console.log('[PepInfoScreen] Estado inicial do onboardingData:', JSON.stringify(onboardingData));
  }, []);

  // Solução para o problema do primeiro clique
  const handleNext = () => {
    // Evita múltiplos cliques
    if (isNavigating) {
      console.log('[PepInfoScreen] Navegação já em andamento, ignorando clique');
      return;
    }
    
    try {
      setIsNavigating(true);
      
      // Incrementa o contador de cliques
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);
      
      console.log(`[PepInfoScreen] Botão CONTINUAR clicado (clique #${newClickCount})`);
      console.log('[PepInfoScreen] Valor de PEP selecionado:', checked);
      
      // Atualiza o contexto primeiro
      const isPep = checked === 'yes';
      console.log('[PepInfoScreen] Atualizando contexto com isPoliticallyExposedPerson:', isPep);
      
      // Atualiza o estado local primeiro, depois navega
      updateOnboardingData({
        pepInfo: {
          isPoliticallyExposedPerson: isPep
        }
      });
      
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        console.log('[PepInfoScreen] Navegando para OnboardingAddress com params:', { isPep });
        
        // Navega com os parâmetros
        navigation.navigate('OnboardingAddress', {
          isPep,
          clickCount: newClickCount,
          timestamp: new Date().getTime() // Adiciona timestamp para garantir que a navegação é única
        });
      }, 100);
      
    } catch (error) {
      console.error('[PepInfoScreen] Erro ao processar:', error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao salvar os dados. Tente novamente.",
        [{ text: "OK" }]
      );
      setIsNavigating(false);
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
              onPress={() => navigation.goBack()}
              disabled={isNavigating}
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
                disabled={isNavigating}
              >
                <RadioButton
                  value="no"
                  status={checked === 'no' ? 'checked' : 'unchecked'}
                  onPress={() => setChecked('no')}
                  color="#E91E63"
                  disabled={isNavigating}
                />
                <Text style={styles.optionText}>
                  Não sou e não tenho vínculo com pessoa exposta politicamente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionRow}
                onPress={() => setChecked('yes')}
                disabled={isNavigating}
              >
                <RadioButton
                  value="yes"
                  status={checked === 'yes' ? 'checked' : 'unchecked'}
                  onPress={() => setChecked('yes')}
                  color="#E91E63"
                  disabled={isNavigating}
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
            disabled={isNavigating}
            loading={isNavigating}
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
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: '#E91E63',
  },
  headerContent: {
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    paddingVertical: 8,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PepInfoScreen;
