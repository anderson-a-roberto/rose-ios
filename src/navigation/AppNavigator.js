import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginCPFScreen from '../screens/LoginCPFScreen';
import LoginPasswordScreen from '../screens/LoginPasswordScreen';
import Step1Screen from '../screens/Step1Screen';
import Step2Screen from '../screens/Step2Screen';
import Step3Screen from '../screens/Step3Screen';
import ThankYouScreen from '../screens/ThankYouScreen';
import KYCScreen from '../screens/KYCScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FF1493' }
        }}
        initialRouteName="LoginCPF"
      >
        <Stack.Screen name="LoginCPF" component={LoginCPFScreen} />
        <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
        <Stack.Screen name="Step1" component={Step1Screen} />
        <Stack.Screen name="Step2" component={Step2Screen} />
        <Stack.Screen name="Step3" component={Step3Screen} />
        <Stack.Screen name="ThankYou" component={ThankYouScreen} />
        <Stack.Screen name="KYC" component={KYCScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;