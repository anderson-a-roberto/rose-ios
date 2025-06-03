import { createRef } from 'react';
import { CommonActions } from '@react-navigation/native';

// Referência global para o NavigationContainer
export const navigationRef = createRef();

// Função para resetar a navegação para uma rota específica
export function resetNavigation(routeName) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: routeName }],
    })
  );
}

// Função para navegar para uma rota específica
export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}
