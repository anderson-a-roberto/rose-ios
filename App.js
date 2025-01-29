import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import PasswordScreen from './src/screens/PasswordScreen';
import Dashboard2Screen from './src/screens/Dashboard2Screen';
import StatementScreen from './src/screens/StatementScreen';
import PayBillScreen from './src/screens/PayBillScreen';
import PayBillConfirmScreen from './src/screens/PayBillConfirmScreen';
import PayBillLoadingScreen from './src/screens/PayBillLoadingScreen';
import PayBillSuccessScreen from './src/screens/PayBillSuccessScreen';
import PayBillReceiptScreen from './src/screens/PayBillReceiptScreen';
import { supabase } from './src/config/supabase';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Password" component={PasswordScreen} />
          <Stack.Screen name="Dashboard2" component={Dashboard2Screen} />
          <Stack.Screen name="Statement" component={StatementScreen} />
          <Stack.Screen name="PayBill" component={PayBillScreen} />
          <Stack.Screen name="PayBillConfirm" component={PayBillConfirmScreen} />
          <Stack.Screen name="PayBillLoading" component={PayBillLoadingScreen} />
          <Stack.Screen name="PayBillSuccess" component={PayBillSuccessScreen} />
          <Stack.Screen name="PayBillReceipt" component={PayBillReceiptScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
