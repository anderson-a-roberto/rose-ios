import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const TransferSuccessScreen = ({ navigation, route }) => {
  const { transferData } = route.params;
  const scaleValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(0);

  useEffect(() => {
    // Animar o ícone de check
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: 200,
        easing: Easing.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.easeIn,
        useNativeDriver: true,
      }),
    ]).start();

    // Animar o texto
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 300,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Navegar para o comprovante após 2 segundos
    const timer = setTimeout(() => {
      navigation.replace('TransferReceipt', { transferData });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name="check"
            size={48}
            color="#fff"
          />
        </Animated.View>
        <Animated.View style={{ opacity: opacityValue }}>
          <Text style={styles.text}>
            Transferência{'\n'}
            realizada com sucesso!
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#682145',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },
});

export default TransferSuccessScreen;
