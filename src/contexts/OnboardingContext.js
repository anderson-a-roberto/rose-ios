import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext({});

export const OnboardingProvider = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState({
    personalData: {
      fullName: '',
      documentNumber: '',
      birthDate: '',
      motherName: '',
      isPep: false
    },
    contactData: {
      email: '',
      phoneNumber: ''
    },
    addressData: {
      postalCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    securityData: {
      password: ''
    }
  });

  const updateOnboardingData = (newData) => {
    setOnboardingData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const resetOnboardingData = () => {
    setOnboardingData({
      personalData: {
        fullName: '',
        documentNumber: '',
        birthDate: '',
        motherName: '',
        isPep: false
      },
      contactData: {
        email: '',
        phoneNumber: ''
      },
      addressData: {
        postalCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
      },
      securityData: {
        password: ''
      }
    });
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        onboardingData, 
        updateOnboardingData,
        resetOnboardingData
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
