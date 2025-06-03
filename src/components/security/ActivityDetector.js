import React from 'react';
import { View } from 'react-native';
import { useSession } from '../../contexts/SessionContext';

// Componente que detecta atividade do usuário e reseta o timer de inatividade
const ActivityDetector = ({ children }) => {
  const { resetActivity } = useSession();
  
  return (
    <View 
      style={{ flex: 1 }} 
      onTouchStart={resetActivity}  // Captura toques na tela
      onScrollBeginDrag={resetActivity}  // Captura rolagens
      onKeyPress={resetActivity}  // Captura digitação em teclados externos
    >
      {children}
    </View>
  );
};

export default ActivityDetector;
