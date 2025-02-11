import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext({});

const initialState = {
  accountType: null, // 'PF' ou 'PJ'
  // Termos e condições
  termsAccepted: false,
  termsAcceptedAt: null,
  // Dados PF
  personalData: {
    documentNumber: '',
    fullName: '',
    socialName: '',
    birthDate: '',
    motherName: '',
  },
  pepInfo: {
    isPoliticallyExposedPerson: false,
  },
  addressData: {
    postalCode: '',
    street: '',
    number: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
  },
  securityData: {
    password: '',
  },
  contactData: {
    phoneNumber: '',
    email: '',
  },
  // Dados PJ
  companyData: {
    documentNumber: '',
    businessName: '',
    tradingName: '',
    companyType: '', // 'MEI', 'ME' ou 'PJ'
  },
  companyAddress: {
    postalCode: '',
    street: '',
    number: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
  },
  companyContact: {
    businessEmail: '',
    contactNumber: '',
  },
  partners: [
    // Modelo de sócio
    /*{
      ownerType: '', // 'SOCIO', 'REPRESENTANTE' ou 'DEMAIS_SOCIOS'
      documentNumber: '',
      fullName: '',
      socialName: '',
      birthDate: '',
      motherName: '',
      email: '',
      phoneNumber: '',
      isPoliticallyExposedPerson: false,
      address: {
        postalCode: '',
        street: '',
        number: '',
        addressComplement: '',
        neighborhood: '',
        city: '',
        state: '',
      }
    }*/
  ],
};

export function OnboardingProvider({ children }) {
  const [onboardingData, setOnboardingData] = useState(initialState);

  const updateOnboardingData = (newData) => {
    setOnboardingData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const resetOnboardingData = () => {
    setOnboardingData(initialState);
  };

  const setTermsAccepted = () => {
    setOnboardingData((prevData) => ({
      ...prevData,
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
    }));
  };

  const addPartner = (partner) => {
    setOnboardingData((prevData) => ({
      ...prevData,
      partners: [...prevData.partners, partner],
    }));
  };

  const updatePartner = (index, partner) => {
    setOnboardingData((prevData) => {
      const updatedPartners = [...prevData.partners];
      updatedPartners[index] = partner;
      return {
        ...prevData,
        partners: updatedPartners,
      };
    });
  };

  const removePartner = (index) => {
    setOnboardingData((prevData) => ({
      ...prevData,
      partners: prevData.partners.filter((_, i) => i !== index),
    }));
  };

  const formatDataForCelcoin = () => {
    if (onboardingData.accountType === 'PF') {
      // Formata dados para pessoa física
      return {
        clientCode: '', // Será preenchido pela função submit-onboarding
        documentNumber: onboardingData.personalData.documentNumber.replace(/\D/g, ''),
        fullName: onboardingData.personalData.fullName,
        socialName: onboardingData.personalData.socialName,
        birthDate: onboardingData.personalData.birthDate,
        motherName: onboardingData.personalData.motherName,
        email: onboardingData.contactData.email,
        phoneNumber: onboardingData.contactData.phoneNumber.replace(/\D/g, ''),
        isPoliticallyExposedPerson: onboardingData.pepInfo.isPoliticallyExposedPerson,
        address: {
          postalCode: onboardingData.addressData.postalCode.replace(/\D/g, ''),
          street: onboardingData.addressData.street,
          number: onboardingData.addressData.number,
          addressComplement: onboardingData.addressData.addressComplement,
          neighborhood: onboardingData.addressData.neighborhood,
          city: onboardingData.addressData.city,
          state: onboardingData.addressData.state,
        },
        onboardingType: "BAAS"
      };
    } else {
      // Formata dados para pessoa jurídica
      return {
        clientCode: '', // Será preenchido pela função submit-onboarding
        documentNumber: onboardingData.companyData.documentNumber.replace(/\D/g, ''),
        businessName: onboardingData.companyData.businessName,
        tradingName: onboardingData.companyData.tradingName,
        businessEmail: onboardingData.companyContact.businessEmail,
        contactNumber: onboardingData.companyContact.contactNumber.replace(/\D/g, ''),
        companyType: onboardingData.companyData.companyType,
        businessAddress: {
          postalCode: onboardingData.companyAddress.postalCode.replace(/\D/g, ''),
          street: onboardingData.companyAddress.street,
          number: onboardingData.companyAddress.number,
          addressComplement: onboardingData.companyAddress.addressComplement,
          neighborhood: onboardingData.companyAddress.neighborhood,
          city: onboardingData.companyAddress.city,
          state: onboardingData.companyAddress.state,
        },
        owner: onboardingData.partners.map(partner => ({
          ownerType: partner.ownerType,
          documentNumber: partner.documentNumber.replace(/\D/g, ''),
          fullName: partner.fullName,
          socialName: partner.socialName,
          birthDate: partner.birthDate,
          motherName: partner.motherName,
          email: partner.email,
          phoneNumber: partner.phoneNumber.replace(/\D/g, ''),
          isPoliticallyExposedPerson: partner.isPoliticallyExposedPerson,
          address: {
            postalCode: partner.address.postalCode.replace(/\D/g, ''),
            street: partner.address.street,
            number: partner.address.number,
            addressComplement: partner.address.addressComplement,
            neighborhood: partner.address.neighborhood,
            city: partner.address.city,
            state: partner.address.state,
          }
        })),
        onboardingType: "BAAS"
      };
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        resetOnboardingData,
        setTermsAccepted,
        addPartner,
        updatePartner,
        removePartner,
        formatDataForCelcoin,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
