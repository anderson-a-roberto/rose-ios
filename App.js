import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Removendo o import direto do AppState pois agora é gerenciado pelo SessionContext
// import { AppState } from 'react-native';
import { SessionProvider } from './src/contexts/SessionContext';
import { TransactionPasswordProvider } from './src/contexts/TransactionPasswordContext';
import ActivityDetector from './src/components/security/ActivityDetector';
// Importar a referência de navegação global
import { navigationRef } from './src/navigation/RootNavigation';
import StatusBarCustom from './src/components/common/StatusBarCustom';
import LoginScreen from './src/screens/LoginScreen';
import BlockCheckScreen from './src/screens/BlockCheckScreen';
import UserBlockedScreen from './src/screens/UserBlockedScreen';
import Dashboard2Screen from './src/screens/Dashboard2Screen';
import StatementScreen from './src/screens/StatementScreen';
import PayBillScreen from './src/screens/PayBillScreen';
import PayBillConfirmScreen from './src/screens/PayBillConfirmScreen';
import PayBillPinScreen from './src/screens/PayBillPinScreen';
import PayBillLoadingScreen from './src/screens/PayBillLoadingScreen';
import PayBillSuccessScreen from './src/screens/PayBillSuccessScreen';
import PayBillErrorScreen from './src/screens/PayBillErrorScreen';
import PayBillReceiptScreen from './src/screens/PayBillReceiptScreen';
import HomePix from './src/screens/HomePix';
import PixKeysScreen from './src/screens/PixKeysScreen';
import RegisterPixKeyScreen from './src/screens/RegisterPixKeyScreen';
import PixTransferAmountScreen from './src/screens/pix/PixTransferAmountScreen';
import PixTransferKeyScreen from './src/screens/pix/PixTransferKeyScreen';
import PixTransferConfirmScreen from './src/screens/pix/PixTransferConfirmScreen';
import PixTransferPinScreen from './src/screens/pix/PixTransferPinScreen';
import PixTransferLoadingScreen from './src/screens/pix/PixTransferLoadingScreen';
import PixTransferSuccessScreen from './src/screens/pix/PixTransferSuccessScreen';
import PixTransferReceiptScreen from './src/screens/pix/PixTransferReceiptScreen';
import PixTransferErrorScreen from './src/screens/pix/PixTransferErrorScreen';
import PixReceiveAmountScreen from './src/screens/pix/PixReceiveAmountScreen';
import PixReceiveKeyScreen from './src/screens/pix/PixReceiveKeyScreen';
import PixReceiveKeyScreenV2 from './src/screens/pix/PixReceiveKeyScreenV2';
import PixReceiveConfirmScreen from './src/screens/pix/PixReceiveConfirmScreen';
import TransferAmountScreen from './src/screens/transfer/TransferAmountScreen';
import TransferAccountScreen from './src/screens/transfer/TransferAccountScreen';
import TransferPinScreen from './src/screens/transfer/TransferPinScreen';
import TransferSuccessScreen from './src/screens/transfer/TransferSuccessScreen';
import TransferReceiptScreen from './src/screens/transfer/TransferReceiptScreen';
import ChargesScreen from './src/screens/ChargesScreen';
import CreateChargePersonalDataScreen from './src/screens/charges/CreateChargePersonalDataScreen';
import CreateChargeAddressScreen from './src/screens/charges/CreateChargeAddressScreen';
import CreateChargeConfirmDataScreen from './src/screens/charges/CreateChargeConfirmDataScreen';
import CreateChargeAmountScreen from './src/screens/charges/CreateChargeAmountScreen';
import CreateChargeKeyScreen from './src/screens/charges/CreateChargeKeyScreen';
import CreateChargeFinesScreen from './src/screens/charges/CreateChargeFinesScreen';
import CreateChargeDueDateScreen from './src/screens/charges/CreateChargeDueDateScreen';
import CreateChargeSummaryScreen from './src/screens/charges/CreateChargeSummaryScreen';
import CreateChargeSuccessScreen from './src/screens/charges/CreateChargeSuccessScreen';
import LoginPasswordScreen from './src/screens/LoginPasswordScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
// Telas de PIN
import PinLoadingScreen from './src/screens/PinLoadingScreen';
import TransactionPasswordIntroScreen from './src/screens/TransactionPasswordIntroScreen';
import TransactionPasswordCreateScreen from './src/screens/TransactionPasswordCreateScreen';
import TransactionPasswordVerifyScreen from './src/screens/TransactionPasswordVerifyScreen';
import ForgotPinScreen from './src/screens/ForgotPinScreen';
import ResetPinScreen from './src/screens/ResetPinScreen';
import { supabase } from './src/config/supabase';
import { ChargeProvider } from './src/contexts/ChargeContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import AccountTypeScreen from './src/screens/onboarding/AccountTypeScreen';
import PersonalDataScreen from './src/screens/onboarding/PersonalDataScreen';
import PepInfoScreen from './src/screens/onboarding/PepInfoScreen';
import AddressScreen from './src/screens/onboarding/AddressScreen';
import PasswordScreen from './src/screens/onboarding/PasswordScreen';
import PhoneScreen from './src/screens/onboarding/PhoneScreen';
import EmailScreen from './src/screens/onboarding/EmailScreen';
import SuccessScreen from './src/screens/onboarding/SuccessScreen';
import CompanyDataScreen from './src/screens/onboarding/company/CompanyDataScreen';
import CompanyAddressScreen from './src/screens/onboarding/company/CompanyAddressScreen';
import PartnerDataScreen from './src/screens/onboarding/company/PartnerDataScreen';
import PartnerFormScreen from './src/screens/onboarding/company/PartnerFormScreen';
import CompanyContactScreen from './src/screens/onboarding/company/CompanyContactScreen';
import CompanyPasswordScreen from './src/screens/onboarding/company/CompanyPasswordScreen';
import TermsScreen from './src/screens/onboarding/TermsScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PixLimitsScreen from './src/screens/pix/PixLimitsScreen';
import PixQrCodeScanScreen from './src/screens/pix/PixQrCodeScanScreen';
import PixCopyPasteScreen from './src/screens/pix/PixCopyPasteScreen';
import PixCopyPasteConfirmScreen from './src/screens/pix/PixCopyPasteConfirmScreen';
import PixCopyPastePinScreen from './src/screens/pix/PixCopyPastePinScreen';
import PixQrCodePaymentScreen from './src/screens/pix/PixQrCodePaymentScreen';
import PixQrCodeLoadingScreen from './src/screens/pix/PixQrCodeLoadingScreen';
import PixQrCodeSuccessScreen from './src/screens/pix/PixQrCodeSuccessScreen';
import PixQrCodeReceiptScreen from './src/screens/pix/PixQrCodeReceiptScreen';
import PixInfoScreen from './src/screens/pix/PixInfoScreen';
import KYCScreen from './src/screens/KYCScreen';
import ThankYouScreen from './src/screens/ThankYouScreen';
import RejectedScreen from './src/screens/RejectedScreen';

const Stack = createStackNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // 30 segundos
    },
  },
});

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  
  // Removendo o gerenciamento de estado do app e timeout, agora gerenciados pelo SessionContext

  // Função para inicializar o app
  const initializeApp = async () => {
      try {
        // Primeiro, limpar qualquer sessão existente
        await supabase.auth.signOut();
        
        let flow = null;
        
        // Verificar se estamos na web
        if (typeof window !== 'undefined' && window.location) {
          const params = new URLSearchParams(window.location.search);
          flow = params.get('flow');
        }
        
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Flow:', flow);
        console.log('Session:', session);

        // Definir rota inicial
        if (flow === 'onboarding') {
          console.log('Redirecionando para onboarding');
          setInitialRoute('AccountType');
        } else if (session) {
          console.log('Usuário autenticado, redirecionando para dashboard');
          setInitialRoute('Dashboard2');
        } else {
          console.log('Usuário não autenticado, redirecionando para welcome');
          setInitialRoute('Welcome');
        }
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
        // Em caso de erro, redirecionar para welcome
        setInitialRoute('Welcome');
      }
    };
    
  // Inicializar o app quando o componente montar
  useEffect(() => {
    initializeApp();
  }, []);
  
  // Removendo o monitoramento de AppState, agora gerenciado pelo SessionContext

  // Aguardar definição da rota inicial
  if (!initialRoute) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SessionProvider>
          <TransactionPasswordProvider>
            <ActivityDetector>
              <StatusBarCustom />
              <NavigationContainer ref={navigationRef}>
                <PaperProvider>
                  <ChargeProvider>
                    <OnboardingProvider>
                      <Stack.Navigator 
                        initialRouteName={initialRoute}
                        screenOptions={{ headerShown: false }}
                      >
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="BlockCheck" component={BlockCheckScreen} />
                    <Stack.Screen name="UserBlocked" component={UserBlockedScreen} />
                    <Stack.Screen name="LoginPassword" component={LoginPasswordScreen} />
                    
                    {/* Onboarding PF */}
                    <Stack.Screen name="AccountType" component={AccountTypeScreen} />
                    <Stack.Screen name="OnboardingPersonalData" component={PersonalDataScreen} />
                    <Stack.Screen name="OnboardingTerms" component={TermsScreen} />
                    <Stack.Screen name="OnboardingPepInfo" component={PepInfoScreen} />
                    <Stack.Screen name="OnboardingAddress" component={AddressScreen} />
                    <Stack.Screen name="OnboardingPassword" component={PasswordScreen} />
                    <Stack.Screen name="OnboardingPhone" component={PhoneScreen} />
                    <Stack.Screen name="OnboardingEmail" component={EmailScreen} />
                    <Stack.Screen name="OnboardingSuccess" component={SuccessScreen} />

                    {/* Onboarding PJ */}
                  <Stack.Screen
                    name="CompanyData"
                    component={CompanyDataScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="CompanyAddress"
                    component={CompanyAddressScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="PartnerData"
                    component={PartnerDataScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="PartnerForm"
                    component={PartnerFormScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="CompanyPassword"
                    component={CompanyPasswordScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="CompanyContact"
                    component={CompanyContactScreen}
                    options={{ headerShown: false }}
                  />
                  
                  {/* Dashboard e outras telas */}
                  <Stack.Screen 
                    name="Dashboard2" 
                    component={Dashboard2Screen} 
                    options={{ headerShown: false }} 
                  />
                  <Stack.Screen 
                    name="ProfileSettings" 
                    component={ProfileSettingsScreen}
                    options={{ 
                      title: 'Configurações',
                      headerStyle: {
                        backgroundColor: '#682145',
                      },
                      headerTintColor: '#fff',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                      },
                    }}
                  />
                  <Stack.Screen name="Statement" component={StatementScreen} />
                  <Stack.Screen name="Charges" component={ChargesScreen} />
                  <Stack.Screen name="HomePix" component={HomePix} />
                  <Stack.Screen name="PixKeys" component={PixKeysScreen} />
                  <Stack.Screen name="RegisterPixKey" component={RegisterPixKeyScreen} />
                  <Stack.Screen name="PixTransferAmount" component={PixTransferAmountScreen} />
                  <Stack.Screen name="PixTransferKey" component={PixTransferKeyScreen} />
                  <Stack.Screen name="PixTransferConfirm" component={PixTransferConfirmScreen} />
                  <Stack.Screen name="PixTransferPin" component={PixTransferPinScreen} />
                  <Stack.Screen name="PixTransferLoading" component={PixTransferLoadingScreen} />
                  <Stack.Screen name="PixTransferSuccess" component={PixTransferSuccessScreen} />
                  <Stack.Screen name="PixTransferReceipt" component={PixTransferReceiptScreen} />
                  <Stack.Screen name="PixTransferError" component={PixTransferErrorScreen} />
                  <Stack.Screen name="PixReceiveAmount" component={PixReceiveAmountScreen} />
                  <Stack.Screen name="PixLimits" component={PixLimitsScreen} />
                  <Stack.Screen name="PixQrCode" component={PixQrCodeScanScreen} />
                  <Stack.Screen name="PixCopyPaste" component={PixCopyPasteScreen} />
                  <Stack.Screen name="PixCopyPasteConfirm" component={PixCopyPasteConfirmScreen} />
                  <Stack.Screen name="PixCopyPastePin" component={PixCopyPastePinScreen} />
                  <Stack.Screen name="PixQrCodePayment" component={PixQrCodePaymentScreen} />
                  <Stack.Screen name="PixQrCodeLoading" component={PixQrCodeLoadingScreen} />
                  <Stack.Screen name="PixQrCodeSuccess" component={PixQrCodeSuccessScreen} />
                  <Stack.Screen name="PixQrCodeReceipt" component={PixQrCodeReceiptScreen} />
                  <Stack.Screen name="PixInfo" component={PixInfoScreen} />

                  <Stack.Screen
                    name="PixReceiveKey"
                    component={PixReceiveKeyScreenV2}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen name="PixReceiveConfirm" component={PixReceiveConfirmScreen} />
                  <Stack.Screen name="PayBill" component={PayBillScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="PayBillConfirm" component={PayBillConfirmScreen} />
                  <Stack.Screen name="PayBillPin" component={PayBillPinScreen} />
                  <Stack.Screen name="PayBillLoading" component={PayBillLoadingScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="PayBillSuccess" component={PayBillSuccessScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="PayBillReceipt" component={PayBillReceiptScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="PayBillError" component={PayBillErrorScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="TransferAmount" component={TransferAmountScreen} />
                  <Stack.Screen name="TransferAccount" component={TransferAccountScreen} />
                  <Stack.Screen name="TransferPin" component={TransferPinScreen} />
                  <Stack.Screen name="TransferSuccess" component={TransferSuccessScreen} />
                  <Stack.Screen name="TransferReceipt" component={TransferReceiptScreen} />
                  <Stack.Screen name="CreateChargePersonalData" component={CreateChargePersonalDataScreen} />
                  <Stack.Screen name="CreateChargeAddress" component={CreateChargeAddressScreen} />
                  <Stack.Screen name="CreateChargeConfirmData" component={CreateChargeConfirmDataScreen} />
                  <Stack.Screen name="CreateChargeAmount" component={CreateChargeAmountScreen} />
                  <Stack.Screen name="CreateChargeKey" component={CreateChargeKeyScreen} />
                  <Stack.Screen name="CreateChargeFines" component={CreateChargeFinesScreen} />
                  <Stack.Screen name="CreateChargeDueDate" component={CreateChargeDueDateScreen} />
                  <Stack.Screen name="CreateChargeSummary" component={CreateChargeSummaryScreen} />
                  <Stack.Screen name="CreateChargeSuccess" component={CreateChargeSuccessScreen} />
                  <Stack.Screen name="KYC" component={KYCScreen} />
                  <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                  <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                  <Stack.Screen name="ThankYou" component={ThankYouScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Rejected" component={RejectedScreen} options={{ headerShown: false }} />
                  
                  {/* Telas de PIN */}
                  <Stack.Screen name="PinLoading" component={PinLoadingScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="TransactionPasswordIntro" component={TransactionPasswordIntroScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="TransactionPasswordCreate" component={TransactionPasswordCreateScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="TransactionPasswordVerify" component={TransactionPasswordVerifyScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="ForgotPin" component={ForgotPinScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="ResetPin" component={ResetPinScreen} options={{ headerShown: false }} />
                </Stack.Navigator>
                  </OnboardingProvider>
                </ChargeProvider>
                </PaperProvider>
              </NavigationContainer>
            </ActivityDetector>
          </TransactionPasswordProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
