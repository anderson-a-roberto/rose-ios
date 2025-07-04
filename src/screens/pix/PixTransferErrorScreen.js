import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PixTransferErrorScreen = ({ navigation, route }) => {
  const { error, transferData } = route.params || {};

  const handleBackToDashboard = () => {
    navigation.navigate('Dashboard2');
  };

  const handleTryAgain = () => {
    // Voltar para a tela de confirmação para tentar novamente
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToDashboard}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ícone de erro */}
        <View style={styles.iconContainer}>
          <View style={styles.errorIconBackground}>
            <MaterialCommunityIcons name="close-circle" size={64} color="#FF5252" />
          </View>
        </View>

        {/* Título e mensagem */}
        <Text style={styles.title}>Ops! Algo deu errado</Text>
        <Text style={styles.subtitle}>
          Não foi possível processar sua transferência PIX
        </Text>

        {/* Detalhes do erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Detalhes do erro:</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {/* Informações da transferência */}
        {transferData && (
          <View style={styles.transferInfo}>
            <Text style={styles.infoTitle}>Dados da transferência:</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valor:</Text>
              <Text style={styles.infoValue}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(transferData.amount)}
              </Text>
            </View>

            {transferData.beneficiary && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Beneficiário:</Text>
                  <Text style={styles.infoValue}>{transferData.beneficiary.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CPF/CNPJ:</Text>
                  <Text style={styles.infoValue}>{transferData.beneficiary.taxId}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Banco:</Text>
                  <Text style={styles.infoValue}>{transferData.beneficiary.bank}</Text>
                </View>
              </>
            )}

            {transferData.description && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Descrição:</Text>
                <Text style={styles.infoValue}>{transferData.description}</Text>
              </View>
            )}
          </View>
        )}

        {/* Sugestões */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>O que você pode fazer:</Text>
          <Text style={styles.suggestionItem}>• Verifique sua conexão com a internet</Text>
          <Text style={styles.suggestionItem}>• Confirme se você tem saldo suficiente</Text>
          <Text style={styles.suggestionItem}>• Tente novamente em alguns minutos</Text>
          <Text style={styles.suggestionItem}>• Entre em contato com o suporte se o problema persistir</Text>
        </View>
      </ScrollView>

      {/* Botões de ação */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleTryAgain}
          style={styles.tryAgainButton}
          labelStyle={styles.tryAgainButtonLabel}
        >
          Tentar Novamente
        </Button>
        
        <Button
          mode="contained"
          onPress={handleBackToDashboard}
          style={styles.backButton}
          labelStyle={styles.backButtonLabel}
        >
          Voltar ao Início
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  errorIconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#B71C1C',
    lineHeight: 20,
  },
  transferInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  suggestionsContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  suggestionItem: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 6,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  tryAgainButton: {
    borderColor: '#E91E63',
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
  },
  tryAgainButtonLabel: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PixTransferErrorScreen;
