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
import DashboardScreen from '../screens/DashboardScreen';
import Dashboard2Screen from '../screens/Dashboard2Screen';
import StatementScreen from '../screens/StatementScreen';
import PayBillScreen from '../screens/PayBillScreen';
import PayBillConfirmScreen from '../screens/PayBillConfirmScreen';
import PayBillLoadingScreen from '../screens/PayBillLoadingScreen';
import PayBillSuccessScreen from '../screens/PayBillSuccessScreen';
import PayBillReceiptScreen from '../screens/PayBillReceiptScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PasswordScreen from '../screens/PasswordScreen';
import HomePix from '../screens/HomePix';

// Onboarding Screens
import OnboardingTermsScreen from '../screens/onboarding/TermsScreen';
import OnboardingPersonalDataScreen from '../screens/onboarding/PersonalDataScreen';
// Removendo a importação da tela PEP, pois agora é um modal
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

// Novas telas PIX
import PixLimitsScreen from '../screens/PixLimitsScreen';
import PixQrCodeScanScreen from '../screens/PixQrCodeScanScreen';
import PixCopyPasteScreen from '../screens/PixCopyPasteScreen';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['http://localhost:19006'],
  config: {
    screens: {
      LoginCPF: '',
      LoginPassword: 'login-password',
      Step1: 'step1',
      Step2: 'step2',
      Step3: 'step3',
      ThankYou: 'thank-you',
      KYC: 'kyc',
      Dashboard: 'dashboard',
      Dashboard2: 'dashboard2',
      Statement: 'statement',
      PayBill: 'pay-bill',
      PayBillConfirm: 'pay-bill-confirm',
      PayBillLoading: 'pay-bill-loading',
      PayBillSuccess: 'pay-bill-success',
      PayBillReceipt: 'pay-bill-receipt',
      Welcome: 'welcome',
      Login: 'login',
      Password: 'password',
      // Onboarding routes
      OnboardingTerms: 'onboarding/terms',
      OnboardingPersonalData: 'onboarding/personal-data',
      // Removendo a rota PEP, pois agora é um modal
      OnboardingAddress: 'onboarding/address',
      OnboardingPhone: 'onboarding/phone',
      OnboardingEmail: 'onboarding/email',
      OnboardingPassword: 'onboarding/password',
      OnboardingSuccess: 'onboarding/success',
      CompanyData: 'onboarding/company-data',
      CompanyAddress: 'onboarding/company-address',
      PartnerData: 'onboarding/partner-data',
      CompanyContact: 'onboarding/company-contact',
      CompanyPassword: 'onboarding/company-password',
      // Novas rotas PIX
      PixLimits: 'pix-limits',
      PixQrCode: 'pix-qr-scan',
      PixCopyPaste: 'pix-copy-paste',
    },
  },
};

const AppNavigator = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FF1493' }
        }}
        initialRouteName="Welcome"
      >
        <Stack.Screen name="LoginCPF" component={LoginCPFScreen} />
        <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
        <Stack.Screen name="Step1" component={Step1Screen} />
        <Stack.Screen name="Step2" component={Step2Screen} />
        <Stack.Screen name="Step3" component={Step3Screen} />
        <Stack.Screen name="ThankYou" component={ThankYouScreen} />
        <Stack.Screen name="KYC" component={KYCScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Dashboard2" component={Dashboard2Screen} />
        <Stack.Screen name="Statement" component={StatementScreen} />
        <Stack.Screen name="PayBill" component={PayBillScreen} />
        <Stack.Screen name="PayBillConfirm" component={PayBillConfirmScreen} />
        <Stack.Screen name="PayBillLoading" component={PayBillLoadingScreen} />
        <Stack.Screen name="PayBillSuccess" component={PayBillSuccessScreen} />
        <Stack.Screen name="PayBillReceipt" component={PayBillReceiptScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Password" component={PasswordScreen} />
        <Stack.Screen name="HomePix" component={HomePix} />

        {/* Onboarding Screens */}
        <Stack.Screen name="OnboardingTerms" component={OnboardingTermsScreen} />
        <Stack.Screen name="OnboardingPersonalData" component={OnboardingPersonalDataScreen} />
        {/* Removendo a tela PEP, pois agora é um modal */}
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

        {/* Novas telas PIX */}
        <Stack.Screen name="PixLimits" component={PixLimitsScreen} />
        <Stack.Screen name="PixQrCode" component={PixQrCodeScanScreen} />
        <Stack.Screen name="PixCopyPaste" component={PixCopyPasteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;