import React from 'react';
import StandardPinScreen from './StandardPinScreen';

const PayBillPinScreen = ({ navigation, route }) => {
  const { billData, paymentData } = route.params;
  
  const handlePinSuccess = () => {
    console.log('[PayBillPinScreen] PIN verificado com sucesso! Executando pagamento...');
    
    // Executar pagamento do boleto diretamente (não usa loading screen)
    executePayment();
  };

  const executePayment = async () => {
    try {
      console.log('[PayBillPinScreen] Executando pagamento do boleto...');
      
      const response = await fetch('https://sandbox.openfinance.celcoin.dev/v5/transactions/billpayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGllbnRfaWQiOiI0MWI0NGFiOWE1NjQ0MC5jZWxjb2luYXBpLmlvIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6InJvc2UiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiNDIyNDgxNDQwIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJkNmY2YjU4Ny1lNmE3LTQwYzItOTBkZi1lMGJkNGVkMzI2YjEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3ZlcnNpb24iOiIyMDAiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL2xpbWl0IjoiOTk5OTk5OTk5IiwiaHR0cDovL2V4YW1wbGUub3JnL2NsYWltcy9tZW1iZXJzaGlwIjoiUHJlbWl1bSIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbGFuZ3VhZ2UiOiJlbi1VUyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvZXhwaXJhdGlvbiI6IjEzLzA2LzIwMjUgMTQ6MjM6MDkiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL21lbWJlcnNoaXBzdGFydCI6IjE5LzA2LzIwMjUiLCJpc3MiOiJjZWxjb2luYXBpLmlvIiwiYXVkIjoiY2VsY29pbmFwaS5pbyIsImV4cCI6MTc1MDI3MzM4OSwibmJmIjoxNzE4NzM3Mzg5fQ.3_lnHQqQcgWLGbvJKQJLnUoqJJBgJjxLOy8ckJfQZXs'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      console.log('[PayBillPinScreen] Resposta do pagamento:', result);

      if (response.ok && result.status === 'CONFIRMED') {
        // Navegar para o comprovante
        navigation.replace('BillPaymentReceipt', {
          billData,
          paymentData,
          transactionData: result
        });
      } else {
        throw new Error(result.message || 'Erro no pagamento');
      }
    } catch (error) {
      console.error('[PayBillPinScreen] Erro no pagamento:', error);
      Alert.alert(
        'Erro no Pagamento',
        'Não foi possível processar o pagamento. Tente novamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <StandardPinScreen
      navigation={navigation}
      route={{
        params: {
          onSuccess: handlePinSuccess,
          onBack: handleBack,
          billData,
          paymentData
        }
      }}
    />
  );
};

export default PayBillPinScreen;
