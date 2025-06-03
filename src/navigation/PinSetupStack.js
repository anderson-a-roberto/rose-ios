import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Telas de configuração de PIN
import TransactionPasswordIntroScreen from '../screens/TransactionPasswordIntroScreen';
import TransactionPasswordCreateScreen from '../screens/TransactionPasswordCreateScreen';
import TransactionPasswordVerifyScreen from '../screens/TransactionPasswordVerifyScreen';
import ForgotPinScreen from '../screens/ForgotPinScreen';
import ResetPinScreen from '../screens/ResetPinScreen';

const Stack = createStackNavigator();

const PinSetupStack = () => {
  console.log('[NAVIGATION] Renderizando PinSetupStack');
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' }
      }}
      initialRouteName="TransactionPasswordCreate"
    >
      <Stack.Screen name="TransactionPasswordIntro" component={TransactionPasswordIntroScreen} />
      <Stack.Screen name="TransactionPasswordCreate" component={TransactionPasswordCreateScreen} />
      <Stack.Screen name="TransactionPasswordVerify" component={TransactionPasswordVerifyScreen} />
      <Stack.Screen name="ForgotPin" component={ForgotPinScreen} />
      <Stack.Screen name="ResetPin" component={ResetPinScreen} />
    </Stack.Navigator>
  );
};

export default PinSetupStack;
