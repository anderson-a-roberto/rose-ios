import { useCallback } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';

export const useTestData = () => {
  const { updateOnboardingData } = useOnboarding();

  const testData = {
    personalData: {
      fullName: "Douglas Panacho",
      documentNumber: "85985845885",
      birthDate: "12/08/1990",
      motherName: "Maria Panacho da Silva",
      isPep: false
    },
    addressData: {
      postalCode: "05007-000",
      street: "Rua Cardeal Arcoverde",
      number: "359",
      complement: "10º Andar",
      neighborhood: "Pinheiros",
      city: "São Paulo",
      state: "SP"
    },
    contactData: {
      email: "email@gmail.com",
      phoneNumber: "11912341234"
    },
    securityData: {
      password: "Teste@123",
      confirmPassword: "Teste@123"
    }
  };

  const fillTestData = useCallback((section) => {
    if (testData[section]) {
      updateOnboardingData({
        [section]: testData[section]
      });
      return testData[section];
    }
    return null;
  }, [updateOnboardingData]);

  return {
    testData,
    fillTestData
  };
};
