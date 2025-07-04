import React from 'react';
import StandardPinScreen from '../StandardPinScreen';

const TransferPinScreen = ({ navigation, route }) => {
  const { transferData, transferPayload } = route.params;
  
  const handlePinSuccess = () => {
    console.log('[TransferPinScreen] PIN verificado com sucesso! Executando transferência...');
    
    // Executar transferência diretamente (não usa loading screen)
    executeTransfer();
  };

  const executeTransfer = async () => {
    try {
      console.log('[TransferPinScreen] Executando transferência...');
      
      const response = await fetch('https://sandbox.openfinance.celcoin.dev/v5/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGllbnRfaWQiOiI0MWI0NGFiOWE1NjQ0MC5jZWxjb2luYXBpLmlvIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6InJvc2UiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiNDIyNDgxNDQwIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJkNmY2YjU4Ny1lNmE3LTQwYzItOTBkZi1lMGJkNGVkMzI2YjEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3ZlcnNpb24iOiIyMDAiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL2xpbWl0IjoiOTk5OTk5OTk5IiwiaHR0cDovL2V4YW1wbGUub3JnL2NsYWltcy9tZW1iZXJzaGlwIjoiUHJlbWl1bSIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbGFuZ3VhZ2UiOiJlbi1VUyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvZXhwaXJhdGlvbiI6IjEzLzA2LzIwMjUgMTQ6MjM6MDkiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL21lbWJlcnNoaXBzdGFydCI6IjE5LzA2LzIwMjUiLCJpc3MiOiJjZWxjb2luYXBpLmlvIiwiYXVkIjoiY2VsY29pbmFwaS5pbyIsImV4cCI6MTc1MDI3MzM4OSwibmJmIjoxNzE4NzM3Mzg5fQ.3_lnHQqQcgWLGbvJKQJLnUoqJJBgJjxLOy8ckJfQZXs'
        },
        body: JSON.stringify(transferPayload)
      });

      const result = await response.json();
      console.log('[TransferPinScreen] Resposta da transferência:', result);

      if (response.ok && result.status === 'CONFIRMED') {
        // Navegar para o comprovante
        navigation.replace('TransferOutReceipt', {
          transferData,
          transactionData: result
        });
      } else {
        throw new Error(result.message || 'Erro na transferência');
      }
    } catch (error) {
      console.error('[TransferPinScreen] Erro na transferência:', error);
      Alert.alert(
        'Erro na Transferência',
        'Não foi possível processar a transferência. Tente novamente.',
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
          transferData,
          transferPayload
        }
      }}
    />
  );
};

export default TransferPinScreen;
