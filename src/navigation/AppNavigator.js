import React from 'react';
import { useSession } from '../contexts/SessionContext';
import { useTransactionPassword } from '../contexts/TransactionPasswordContext';
import { NavigationContainer } from '@react-navigation/native';

// Importar os stacks separados
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import PinSetupStack from './PinSetupStack';
import PinLoadingStack from './PinLoadingStack';

// Importar a referência de navegação
import { navigationRef } from './RootNavigation';

// Configuração de deep linking
const linking = {
  prefixes: ['http://localhost:19006'],
  // A configuração detalhada de linking pode ser mantida se necessário
  // ou simplificada já que agora temos stacks separados
};

const AppNavigator = () => {
  // Obter os estados necessários dos contextos
  const { isAuthenticated } = useSession();
  const { pinLoaded, hasPin } = useTransactionPassword();
  
  // Chave para forçar recriação do navegador quando os estados mudam
  const navigationKey = `${isAuthenticated}-${pinLoaded}-${hasPin}`;
  
  console.log('[NAVIGATION] Renderizando AppNavigator:', { isAuthenticated, pinLoaded, hasPin });
  
  return (
    // Usar a referência de navegação para poder acessar a navegação de fora dos componentes React
    <NavigationContainer ref={navigationRef} key={navigationKey} linking={linking}>
      {/* 
        Decidir qual stack mostrar com base nos estados:
        1. Se não estiver autenticado, mostrar o AuthStack (login)
        2. Se estiver autenticado mas o PIN ainda não foi verificado, mostrar a tela de carregamento
        3. Se estiver autenticado e tiver PIN, mostrar o MainStack (dashboard)
        4. Se estiver autenticado mas não tiver PIN, mostrar o PinSetupStack (configuração de PIN)
      */}
      {!isAuthenticated ? (
        <AuthStack />
      ) : !pinLoaded ? (
        <PinLoadingStack />
      ) : hasPin ? (
        <MainStack initialRouteName="Dashboard2" />
      ) : (
        <PinSetupStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;