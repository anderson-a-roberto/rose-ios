import React, { createContext, useContext, useState } from 'react';

const ChargeContext = createContext({});

export const ChargeProvider = ({ children }) => {
  const [chargeData, setChargeData] = useState({
    // Dados Pessoais
    nome: '',
    cpfCnpj: '',
    
    // Endereço
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    
    // Valores e Datas
    valor: '',
    multa: '0',
    juros: '0',
    dataVencimento: '',
    
    // Dados do beneficiário (serão preenchidos automaticamente)
    beneficiarioCpfCnpj: '',
    conta: '',
    chavePix: ''
  });

  const updateChargeData = (newData) => {
    setChargeData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const resetChargeData = () => {
    setChargeData({
      nome: '',
      cpfCnpj: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      valor: '',
      multa: '0',
      juros: '0',
      dataVencimento: '',
      beneficiarioCpfCnpj: '',
      conta: '',
      chavePix: ''
    });
  };

  return (
    <ChargeContext.Provider value={{
      chargeData,
      updateChargeData,
      resetChargeData
    }}>
      {children}
    </ChargeContext.Provider>
  );
};

export const useCharge = () => {
  const context = useContext(ChargeContext);
  if (!context) {
    throw new Error('useCharge must be used within a ChargeProvider');
  }
  return context;
};
