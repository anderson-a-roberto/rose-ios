import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Telas principais (autenticadas)
import Dashboard2Screen from '../screens/Dashboard2Screen';
import StatementScreen from '../screens/StatementScreen';

// Telas de senha de transação
import TransactionPasswordIntroScreen from '../screens/TransactionPasswordIntroScreen';
import TransactionPasswordCreateScreen from '../screens/TransactionPasswordCreateScreen';
import TransactionPasswordVerifyScreen from '../screens/TransactionPasswordVerifyScreen';
import TransactionPinLoadingScreen from '../screens/TransactionPinLoadingScreen';
import PayBillScreen from '../screens/PayBillScreen';
import PayBillConfirmScreen from '../screens/PayBillConfirmScreen';
import PayBillLoadingScreen from '../screens/PayBillLoadingScreen';
import PayBillSuccessScreen from '../screens/PayBillSuccessScreen';
import PayBillReceiptScreen from '../screens/PayBillReceiptScreen';
import PayBillErrorScreen from '../screens/PayBillErrorScreen';
import HomePix from '../screens/HomePix';
import PixLimitsScreen from '../screens/PixLimitsScreen';
import PixQrCodeScanScreen from '../screens/PixQrCodeScanScreen';
import PixCopyPasteScreen from '../screens/pix/PixCopyPasteScreen';
import PixKeysScreen from '../screens/PixKeysScreen';
import PixTransferAmountScreen from '../screens/pix/PixTransferAmountScreen';
import PixTransferKeyScreen from '../screens/pix/PixTransferKeyScreen';
import PixTransferConfirmScreen from '../screens/pix/PixTransferConfirmScreen';
import PixTransferPinScreen from '../screens/pix/PixTransferPinScreen';
import PixTransferLoadingScreen from '../screens/pix/PixTransferLoadingScreen';
import PixTransferSuccessScreen from '../screens/pix/PixTransferSuccessScreen';
import PixTransferReceiptScreen from '../screens/pix/PixTransferReceiptScreen';
import PixTransferErrorScreen from '../screens/pix/PixTransferErrorScreen';
import PixQrCodePinScreen from '../screens/pix/PixQrCodePinScreen';
import PixCopyPastePinScreen from '../screens/pix/PixCopyPastePinScreen';
import PixCopyPasteConfirmScreen from '../screens/pix/PixCopyPasteConfirmScreen';
import PixReceiveAmountScreen from '../screens/pix/PixReceiveAmountScreen';
import PixReceiveKeyScreen from '../screens/pix/PixReceiveKeyScreen';
import PixReceiveKeyScreenV2 from '../screens/pix/PixReceiveKeyScreenV2';
import PixReceiveConfirmScreen from '../screens/pix/PixReceiveConfirmScreen';
import TransferAmountScreen from '../screens/transfer/TransferAmountScreen';
import TransferAccountScreen from '../screens/transfer/TransferAccountScreen';
import TransferPinScreen from '../screens/transfer/TransferPinScreen';
import TransferSuccessScreen from '../screens/transfer/TransferSuccessScreen';
import TransferReceiptScreen from '../screens/transfer/TransferReceiptScreen';
import ChargesScreen from '../screens/ChargesScreen';
import CreateChargePersonalDataScreen from '../screens/charges/CreateChargePersonalDataScreen';
import CreateChargeAddressScreen from '../screens/charges/CreateChargeAddressScreen';
import CreateChargeConfirmDataScreen from '../screens/charges/CreateChargeConfirmDataScreen';
import CreateChargeAmountScreen from '../screens/charges/CreateChargeAmountScreen';
import CreateChargeKeyScreen from '../screens/charges/CreateChargeKeyScreen';
import CreateChargeFinesScreen from '../screens/charges/CreateChargeFinesScreen';
import CreateChargeDueDateScreen from '../screens/charges/CreateChargeDueDateScreen';
import CreateChargeSummaryScreen from '../screens/charges/CreateChargeSummaryScreen';
import CreateChargeSuccessScreen from '../screens/charges/CreateChargeSuccessScreen';

const Stack = createStackNavigator();

const MainStack = ({ initialRouteName = "Dashboard2" }) => {
  console.log('[NAVIGATION] Renderizando MainStack (autenticado) com initialRouteName =', initialRouteName);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FF1493' }
      }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Dashboard2" component={Dashboard2Screen} />
      <Stack.Screen name="Statement" component={StatementScreen} />
      <Stack.Screen name="PayBill" component={PayBillScreen} />
      <Stack.Screen name="PayBillConfirm" component={PayBillConfirmScreen} />
      <Stack.Screen name="PayBillLoading" component={PayBillLoadingScreen} />
      <Stack.Screen name="PayBillSuccess" component={PayBillSuccessScreen} />
      <Stack.Screen name="PayBillReceipt" component={PayBillReceiptScreen} />
      <Stack.Screen name="PayBillError" component={PayBillErrorScreen} />
      <Stack.Screen name="HomePix" component={HomePix} />
      
      {/* PIX Screens */}
      <Stack.Screen name="PixLimits" component={PixLimitsScreen} />
      <Stack.Screen name="PixQrCode" component={PixQrCodeScanScreen} />
      <Stack.Screen name="PixQrCodePin" component={PixQrCodePinScreen} />
      <Stack.Screen name="PixCopyPaste" component={PixCopyPasteScreen} />
      <Stack.Screen name="PixCopyPastePin" component={PixCopyPastePinScreen} />
      <Stack.Screen name="PixCopyPasteConfirm" component={PixCopyPasteConfirmScreen} />
      <Stack.Screen name="PixKeysScreen" component={PixKeysScreen} />
      <Stack.Screen name="PixTransferAmount" component={PixTransferAmountScreen} />
      <Stack.Screen name="PixTransferKey" component={PixTransferKeyScreen} />
      <Stack.Screen name="PixTransferConfirm" component={PixTransferConfirmScreen} />
      <Stack.Screen name="PixTransferPin" component={PixTransferPinScreen} />
      <Stack.Screen name="PixTransferLoading" component={PixTransferLoadingScreen} />
      <Stack.Screen name="PixTransferSuccess" component={PixTransferSuccessScreen} />
      <Stack.Screen name="PixTransferReceipt" component={PixTransferReceiptScreen} />
      <Stack.Screen name="PixTransferError" component={PixTransferErrorScreen} />
      <Stack.Screen name="PixReceiveAmount" component={PixReceiveAmountScreen} />
      <Stack.Screen name="PixReceiveKey" component={PixReceiveKeyScreen} />
      <Stack.Screen name="PixReceiveKeyV2" component={PixReceiveKeyScreenV2} />
      <Stack.Screen name="PixReceiveConfirm" component={PixReceiveConfirmScreen} />
      
      {/* Transfer Screens */}
      <Stack.Screen name="TransferAmount" component={TransferAmountScreen} />
      <Stack.Screen name="TransferAccount" component={TransferAccountScreen} />
      <Stack.Screen name="TransferPin" component={TransferPinScreen} />
      <Stack.Screen name="TransferSuccess" component={TransferSuccessScreen} />
      <Stack.Screen name="TransferReceipt" component={TransferReceiptScreen} />
      
      {/* Charges Screens */}
      <Stack.Screen name="Charges" component={ChargesScreen} />
      <Stack.Screen name="CreateChargePersonalData" component={CreateChargePersonalDataScreen} />
      <Stack.Screen name="CreateChargeAddress" component={CreateChargeAddressScreen} />
      <Stack.Screen name="CreateChargeConfirmData" component={CreateChargeConfirmDataScreen} />
      <Stack.Screen name="CreateChargeAmount" component={CreateChargeAmountScreen} />
      <Stack.Screen name="CreateChargeKey" component={CreateChargeKeyScreen} />
      <Stack.Screen name="CreateChargeFines" component={CreateChargeFinesScreen} />
      <Stack.Screen name="CreateChargeDueDate" component={CreateChargeDueDateScreen} />
      <Stack.Screen name="CreateChargeSummary" component={CreateChargeSummaryScreen} />
      <Stack.Screen name="CreateChargeSuccess" component={CreateChargeSuccessScreen} />
      
      {/* Transaction Password Screens */}
      <Stack.Screen name="TransactionPinLoading" component={TransactionPinLoadingScreen} />
      <Stack.Screen name="TransactionPasswordIntro" component={TransactionPasswordIntroScreen} />
      <Stack.Screen name="TransactionPasswordCreate" component={TransactionPasswordCreateScreen} />
      <Stack.Screen name="TransactionPasswordVerify" component={TransactionPasswordVerifyScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
