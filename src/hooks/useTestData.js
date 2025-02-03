import { useCallback } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';

export const useTestData = () => {
  const { updateOnboardingData } = useOnboarding();

  const testData = {
    // Dados PF
    personalData: {
      fullName: "Douglas Panacho",
      documentNumber: "859.858.458-85",
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
      phoneNumber: "+5511912341234"
    },
    securityData: {
      password: "Teste@123",
      confirmPassword: "Teste@123"
    },
    // Dados PJ
    companyData: {
      documentNumber: "12.345.678/0001-90",
      businessName: "Tech Solutions",
      tradingName: "Tech Solutions LTDA",
      companyType: "ME"
    },
    companyAddress: {
      postalCode: "04538-133",
      street: "Av. Brigadeiro Faria Lima",
      number: "3477",
      addressComplement: "Torre Norte, 14º andar",
      neighborhood: "Itaim Bibi",
      city: "São Paulo",
      state: "SP"
    },
    companyContact: {
      businessEmail: "contato@techsolutions.com.br",
      contactNumber: "+5511987654321"
    },
    partners: [
      {
        ownerType: "SOCIO",
        documentNumber: "390.642.568-10",
        fullName: "Anderson Alves",
        socialName: "Anderson",
        birthDate: "17/08/1990",
        motherName: "Nair Alves",
        email: "socio1123@gmail.com",
        phoneNumber: "+5511988235709",
        isPoliticallyExposedPerson: false,
        address: {
          postalCode: "06663-440",
          street: "Rua dos Cariocas",
          number: "415",
          addressComplement: "casa 2",
          neighborhood: "Parque Suburbano",
          city: "Itapevi",
          state: "SP"
        }
      }
    ]
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
