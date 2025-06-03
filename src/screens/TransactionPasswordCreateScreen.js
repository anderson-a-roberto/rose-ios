import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  KeyboardAvoidingView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTransactionPassword } from '../contexts/TransactionPasswordContext';

export default function TransactionPasswordCreateScreen() {
  const navigation = useNavigation();
  const { setTransactionPassword } = useTransactionPassword();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordInputRef = useRef(null);
  
  // Validações da senha
  const hasMinLength = password.length === 6;
  const hasFourDifferentDigits = new Set(password.split('')).size >= 4;
  const hasNoSequence = !/(123|321|111|222|333|444|555|666|777|888|999|000)/.test(password);
  const isValid = hasMinLength && hasFourDifferentDigits && hasNoSequence;
  
  // Removido useFocusEffect em favor do autoFocus nativo do TextInput do React Native Paper

  const handleBack = () => {
    // Usar navigation.reset para forçar a navegação para a tela de Welcome
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleContinue = async () => {
    if (isValid && !isSubmitting) {
      try {
        setIsSubmitting(true);
        const success = await setTransactionPassword(password);
        
        if (success) {
          // Usar navigation.reset para forçar a navegação para a tela de Dashboard2
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard2' }],
          });
        } else {
          Alert.alert(
            'Erro',
            'Não foi possível salvar o PIN. Tente novamente.',
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao salvar o PIN. Tente novamente.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {/* Header com botão de voltar */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={isSubmitting}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.content}>
          {/* Ícone de segurança */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons name="lock" size={36} color="#E91E63" />
            </View>
          </View>
          
          {/* Título e subtítulo */}
          <Text style={styles.title}>Crie a sua senha de transação</Text>
          <Text style={styles.subtitle}>Crie uma senha para autorizar suas transações no aplicativo</Text>
          
          {/* Input para o PIN */}
          <View style={styles.inputContainer}>
              <TextInput
                mode="flat"
                ref={passwordInputRef}
                value={password.replace(/./g, '•')}
                onChangeText={(value) => {
                  const prevLen = password.length;
                  const currLen = value.length;

                  if (currLen > prevLen) {
                    const last = value.charAt(value.length - 1);
                    if (/\d/.test(last)) setPassword((p) => (p + last).slice(0, 6));
                  } else if (currLen < prevLen) {
                    setPassword((p) => p.slice(0, -1));
                  }
                }}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                maxLength={6}
                underlineColor="#E91E63"
                activeUnderlineColor="#E91E63"
                placeholder="Digite sua senha de 6 dígitos"
                placeholderTextColor="#666"
                autoFocus
                style={styles.pinInput}
            />
            

          </View>
          
          {/* Instruções */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              Crie uma senha com 6 dígitos
            </Text>
            <Text style={[styles.instructionText, hasMinLength ? styles.validInstruction : null]}>
              Utilize quatro números diferentes
            </Text>
            <Text style={[styles.instructionText, hasFourDifferentDigits ? styles.validInstruction : null]}>
              Não utilize sequências (ex: 123, 321, 111)
            </Text>
            <Text style={[styles.instructionText, hasNoSequence ? styles.validInstruction : null]}>
              Não utilizar dados pessoais
            </Text>
          </View>
          
          {/* Botão de continuar */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!isValid || isSubmitting) && styles.confirmButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>CADASTRAR</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 8,
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
    flex: 0,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    marginTop: -20,
  },
  iconContainer: {
    marginBottom: 10,
    marginTop: 0,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  pinInput: {
    backgroundColor: 'transparent',
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#000000',
    width: '100%',
    height: 50,
    marginBottom: 10,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    height: 40,
    position: 'relative',
    width: '100%',
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  pinDotEmpty: {
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  pinDotCurrent: {
    borderColor: '#E91E63',
    borderWidth: 2,
    transform: [{scale: 1.1}],
  },
  instructionsContainer: {
    width: '100%',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  validInstruction: {
    color: '#000000',
  },
  confirmButton: {
    backgroundColor: '#E91E63',
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
