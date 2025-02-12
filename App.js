import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import Dashboard2Screen from './src/screens/Dashboard2Screen';
import StatementScreen from './src/screens/StatementScreen';
import PayBillScreen from './src/screens/PayBillScreen';
import PayBillConfirmScreen from './src/screens/PayBillConfirmScreen';
import PayBillLoadingScreen from './src/screens/PayBillLoadingScreen';
import PayBillSuccessScreen from './src/screens/PayBillSuccessScreen';
import PayBillReceiptScreen from './src/screens/PayBillReceiptScreen';
import HomePix from './src/screens/HomePix';
import PixKeysScreen from './src/screens/PixKeysScreen';
import RegisterPixKeyScreen from './src/screens/RegisterPixKeyScreen';
import PixTransferAmountScreen from './src/screens/pix/PixTransferAmountScreen';
import PixTransferKeyScreen from './src/screens/pix/PixTransferKeyScreen';
import PixTransferConfirmScreen from './src/screens/pix/PixTransferConfirmScreen';
import PixTransferLoadingScreen from './src/screens/pix/PixTransferLoadingScreen';
import PixTransferSuccessScreen from './src/screens/pix/PixTransferSuccessScreen';
import PixTransferReceiptScreen from './src/screens/pix/PixTransferReceiptScreen';
import PixReceiveAmountScreen from './src/screens/pix/PixReceiveAmountScreen';
import PixReceiveKeyScreen from './src/screens/pix/PixReceiveKeyScreen';
import PixReceiveKeyScreenV2 from './src/screens/pix/PixReceiveKeyScreenV2';
import PixReceiveConfirmScreen from './src/screens/pix/PixReceiveConfirmScreen';
import TransferAmountScreen from './src/screens/transfer/TransferAmountScreen';
import TransferAccountScreen from './src/screens/transfer/TransferAccountScreen';
import TransferSuccessScreen from './src/screens/transfer/TransferSuccessScreen';
import TransferReceiptScreen from './src/screens/transfer/TransferReceiptScreen';
import ChargesScreen from './src/screens/ChargesScreen';
import CreateChargePersonalDataScreen from './src/screens/charges/CreateChargePersonalDataScreen';
import CreateChargeAddressScreen from './src/screens/charges/CreateChargeAddressScreen';
import CreateChargeConfirmDataScreen from './src/screens/charges/CreateChargeConfirmDataScreen';
import CreateChargeAmountScreen from './src/screens/charges/CreateChargeAmountScreen';
import CreateChargeFinesScreen from './src/screens/charges/CreateChargeFinesScreen';
import CreateChargeDueDateScreen from './src/screens/charges/CreateChargeDueDateScreen';
import CreateChargeSummaryScreen from './src/screens/charges/CreateChargeSummaryScreen';
import CreateChargeSuccessScreen from './src/screens/charges/CreateChargeSuccessScreen';
import LoginPasswordScreen from './src/screens/LoginPasswordScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
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
import CompanyContactScreen from './src/screens/onboarding/company/CompanyContactScreen';
import TermsScreen from './src/screens/onboarding/TermsScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

  useEffect(() => {
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

    initializeApp();
  }, []);

  // Aguardar definição da rota inicial
  if (!initialRoute) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <PaperProvider>
            <ChargeProvider>
              <OnboardingProvider>
                <Stack.Navigator 
                  initialRouteName={initialRoute}
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
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
                    name="CompanyPassword"
                    component={PasswordScreen}
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
                  <Stack.Screen name="PixKeysScreen" component={PixKeysScreen} />
                  <Stack.Screen name="RegisterPixKey" component={RegisterPixKeyScreen} />
                  <Stack.Screen name="PixTransferAmount" component={PixTransferAmountScreen} />
                  <Stack.Screen name="PixTransferKey" component={PixTransferKeyScreen} />
                  <Stack.Screen name="PixTransferConfirm" component={PixTransferConfirmScreen} />
                  <Stack.Screen name="PixTransferLoading" component={PixTransferLoadingScreen} />
                  <Stack.Screen name="PixTransferSuccess" component={PixTransferSuccessScreen} />
                  <Stack.Screen name="PixTransferReceipt" component={PixTransferReceiptScreen} />
                  <Stack.Screen name="PixReceiveAmount" component={PixReceiveAmountScreen} />
                  <Stack.Screen
                    name="PixReceiveKey"
                    component={PixReceiveKeyScreenV2}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen name="PixReceiveConfirm" component={PixReceiveConfirmScreen} />
                  <Stack.Screen name="PayBill" component={PayBillScreen} />
                  <Stack.Screen name="PayBillConfirm" component={PayBillConfirmScreen} />
                  <Stack.Screen name="PayBillLoading" component={PayBillLoadingScreen} />
                  <Stack.Screen name="PayBillSuccess" component={PayBillSuccessScreen} />
                  <Stack.Screen name="PayBillReceipt" component={PayBillReceiptScreen} />
                  <Stack.Screen name="TransferAmount" component={TransferAmountScreen} />
                  <Stack.Screen name="TransferAccount" component={TransferAccountScreen} />
                  <Stack.Screen name="TransferSuccess" component={TransferSuccessScreen} />
                  <Stack.Screen name="TransferReceipt" component={TransferReceiptScreen} />
                  <Stack.Screen name="CreateChargePersonalData" component={CreateChargePersonalDataScreen} />
                  <Stack.Screen name="CreateChargeAddress" component={CreateChargeAddressScreen} />
                  <Stack.Screen name="CreateChargeConfirmData" component={CreateChargeConfirmDataScreen} />
                  <Stack.Screen name="CreateChargeAmount" component={CreateChargeAmountScreen} />
                  <Stack.Screen name="CreateChargeFines" component={CreateChargeFinesScreen} />
                  <Stack.Screen name="CreateChargeDueDate" component={CreateChargeDueDateScreen} />
                  <Stack.Screen name="CreateChargeSummary" component={CreateChargeSummaryScreen} />
                  <Stack.Screen name="CreateChargeSuccess" component={CreateChargeSuccessScreen} />
                </Stack.Navigator>
              </OnboardingProvider>
            </ChargeProvider>
          </PaperProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
