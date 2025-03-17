import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function PayBillErrorScreen({ navigation, route }) {
  const { error } = route.params;

  const handleTryAgain = () => {
    navigation.navigate('PayBill');
  };

  const handleGoHome = () => {
    navigation.navigate('Dashboard2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#682145" barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="close-circle" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Ops!</Text>
        <Text style={styles.message}>{error}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleTryAgain}
          style={[styles.button, styles.retryButton]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          TENTAR NOVAMENTE
        </Button>

        <Button
          mode="outlined"
          onPress={handleGoHome}
          style={[styles.button, styles.homeButton]}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, styles.homeButtonLabel]}
        >
          IR PARA O INÍCIO
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#682145',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  button: {
    marginBottom: 16,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
  },
  homeButton: {
    borderColor: '#FFFFFF',
  },
  homeButtonLabel: {
    color: '#FFFFFF',
  },
});
