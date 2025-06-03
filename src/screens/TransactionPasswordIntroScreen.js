import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TransactionPasswordIntroScreen() {
  const navigation = useNavigation();

  const handleCreatePassword = () => {
    navigation.navigate('TransactionPasswordCreate');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            })}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Senha de transação</Text>
          <Text style={styles.subtitle}>
            Crie uma senha para autorizar suas transações no aplicativo
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <View style={styles.lockIconContainer}>
            <MaterialCommunityIcons name="lock" size={60} color="#682145" />
            <View style={styles.arrowIconContainer}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#682145" />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleCreatePassword}
        >
          <Text style={styles.continueButtonText}>Criar senha de transação</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    zIndex: 10,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(104, 33, 69, 0.1)', // Cor rosa com opacidade
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  arrowIconContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  continueButton: {
    backgroundColor: '#E91E63', // Cor rosa mais vibrante como na imagem 2
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
});
