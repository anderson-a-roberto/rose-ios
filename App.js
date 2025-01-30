import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
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
import PixReceiveConfirmScreen from './src/screens/pix/PixReceiveConfirmScreen';
import PixReceiveKeyScreenV2 from './src/screens/pix/PixReceiveKeyScreenV2';
import TransferAmountScreen from './src/screens/transfer/TransferAmountScreen';
import TransferAccountScreen from './src/screens/transfer/TransferAccountScreen';
import TransferSuccessScreen from './src/screens/transfer/TransferSuccessScreen';
import TransferReceiptScreen from './src/screens/transfer/TransferReceiptScreen';
import ChargesScreen from './src/screens/ChargesScreen';
import { supabase } from './src/config/supabase';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: '17927237098@email.com',
          password: '17927237098'
        });
        
        if (error) {
          console.error('Erro no login automático:', error);
        } else {
          console.log('Login automático realizado com sucesso');
        }
      } catch (err) {
        console.error('Erro ao realizar login automático:', err);
      }
    };

    autoLogin();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Dashboard2" component={Dashboard2Screen} />
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
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
