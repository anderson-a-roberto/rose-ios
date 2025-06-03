import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PinLoadingScreen from '../screens/PinLoadingScreen';

const Stack = createStackNavigator();

const PinLoadingStack = () => {
  console.log('[NAVIGATION] Renderizando PinLoadingStack');
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' }
      }}
    >
      <Stack.Screen name="PinLoading" component={PinLoadingScreen} />
    </Stack.Navigator>
  );
};

export default PinLoadingStack;
