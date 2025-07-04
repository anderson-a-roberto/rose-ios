import React from 'react';
import StandardPinScreen from '../StandardPinScreen';

const PixQrCodePinScreen = ({ navigation, route }) => {
  const { paymentData, emvData, dictData, amount } = route.params;
  
  const handlePinSuccess = () => {
    console.log('[PixQrCodePinScreen] PIN verificado com sucesso! Navegando para loading...');
    
    // Estruturar dados para o loading screen (igual ao Copy-Paste)
    const transferData = {
      amount: amount,
      description: emvData?.merchantName || dictData?.name || 'Pagamento PIX QR Code',
      beneficiary: {
        name: emvData?.merchantName || dictData?.name || 'Beneficiário',
        taxId: dictData?.documentnumber || 'N/A',
        bank: dictData?.participant || 'N/A'
      }
    };

    // Gerar clientCode único
    const clientCode = `QR${Date.now()}`;
    
    // Estruturar payload para API (usando mesma estrutura do Copy-Paste)
    const payload = {
      ...paymentData,
      clientCode
    };

    console.log('[PixQrCodePinScreen] Navegando para PixTransferLoading com:', {
      transferData,
      payload,
      isQrCode: true
    });

    // Navegar para loading screen que executará o pagamento
    navigation.replace('PixTransferLoading', {
      transferData,
      payload,
      isQrCode: true
    });
  };

  const handleBack = () => {
    navigation.navigate('Dashboard2');
  };

  return (
    <StandardPinScreen
      navigation={navigation}
      route={{
        params: {
          onSuccess: handlePinSuccess,
          onBack: handleBack,
          paymentData,
          emvData,
          dictData,
          amount
        }
      }}
    />
  );
};

export default PixQrCodePinScreen;
