import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Telas de autenticação e onboarding
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import LoginPasswordScreen from '../screens/LoginPasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import BlockCheckScreen from '../screens/BlockCheckScreen';
import UserBlockedScreen from '../screens/UserBlockedScreen';
import InviteCodeScreen from '../screens/InviteCodeScreen';
import DocumentScreen from '../screens/DocumentScreen';

// Telas de onboarding
import OnboardingTermsScreen from '../screens/onboarding/TermsScreen';
import OnboardingPersonalDataScreen from '../screens/onboarding/PersonalDataScreen';
import AddressScreen from '../screens/onboarding/AddressScreen';
import PhoneScreen from '../screens/onboarding/PhoneScreen';
import EmailScreen from '../screens/onboarding/EmailScreen';
import OnboardingPasswordScreen from '../screens/onboarding/PasswordScreen';
import OnboardingSuccessScreen from '../screens/onboarding/SuccessScreen';
import CompanyDataScreen from '../screens/onboarding/company/CompanyDataScreen';
import CompanyAddressScreen from '../screens/onboarding/company/CompanyAddressScreen';
import PartnerDataScreen from '../screens/onboarding/company/PartnerDataScreen';
import CompanyContactScreen from '../screens/onboarding/company/CompanyContactScreen';
import CompanyPasswordScreen from '../screens/onboarding/company/CompanyPasswordScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  console.log('[NAVIGATION] Renderizando AuthStack (não autenticado)');
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FF1493' }
      }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Document" component={DocumentScreen} />
      <Stack.Screen name="BlockCheck" component={BlockCheckScreen} />
      <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="UserBlocked" component={UserBlockedScreen} />
      <Stack.Screen name="InviteCode" component={InviteCodeScreen} />
      
      {/* Onboarding Screens */}
      <Stack.Screen name="OnboardingTerms" component={OnboardingTermsScreen} />
      <Stack.Screen name="OnboardingPersonalData" component={OnboardingPersonalDataScreen} />
      <Stack.Screen name="OnboardingAddress" component={AddressScreen} />
      <Stack.Screen name="OnboardingPhone" component={PhoneScreen} />
      <Stack.Screen name="OnboardingEmail" component={EmailScreen} />
      <Stack.Screen name="OnboardingPassword" component={OnboardingPasswordScreen} />
      <Stack.Screen name="OnboardingSuccess" component={OnboardingSuccessScreen} />
      <Stack.Screen name="CompanyData" component={CompanyDataScreen} />
      <Stack.Screen name="CompanyAddress" component={CompanyAddressScreen} />
      <Stack.Screen name="PartnerData" component={PartnerDataScreen} />
      <Stack.Screen name="CompanyContact" component={CompanyContactScreen} />
      <Stack.Screen name="CompanyPassword" component={CompanyPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
