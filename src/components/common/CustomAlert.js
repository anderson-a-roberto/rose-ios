import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

/**
 * Componente de alerta customizado que segue o padrão visual do aplicativo
 * 
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.visible - Controla a visibilidade do alerta
 * @param {Function} props.onDismiss - Função chamada ao fechar o alerta
 * @param {string} props.title - Título do alerta
 * @param {string} props.message - Mensagem do alerta
 * @param {string} props.confirmText - Texto do botão de confirmação (opcional)
 * @param {Function} props.onConfirm - Função chamada ao confirmar (opcional)
 * @param {string} props.cancelText - Texto do botão de cancelamento (opcional)
 * @param {Function} props.onCancel - Função chamada ao cancelar (opcional)
 * @param {string} props.type - Tipo do alerta: 'success', 'error', 'warning', 'info' (opcional)
 * @param {string} props.confirmButtonColor - Cor personalizada para o botão de confirmação (opcional)
 */
const CustomAlert = ({
  visible,
  onDismiss = () => {},  
  title,
  message,
  confirmText = 'OK',
  onConfirm,
  cancelText,
  onCancel,
  type = 'info',
  confirmButtonColor
}) => {
  // Determina o ícone e a cor com base no tipo
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: '#4CAF50' };
      case 'error':
        return { icon: 'alert-circle', color: '#F44336' };
      case 'warning':
        return { icon: 'alert', color: '#FFC107' };
      default:
        return { icon: 'information', color: '#2196F3' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons name={icon} size={32} color={color} />
            {title && <Text style={styles.title}>{title}</Text>}
          </View>
          
          <View style={styles.content}>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.actions}>
            {cancelText && onCancel && (
              <Button 
                mode="text" 
                onPress={() => {
                  if (onCancel) onCancel();
                  if (onDismiss) onDismiss();
                }}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                textColor="#666"
              >
                {cancelText}
              </Button>
            )}
            
            <Button 
              mode="contained" 
              onPress={() => {
                if (onConfirm) onConfirm();
                if (onDismiss) onDismiss();
              }}
              style={[styles.button, styles.confirmButton]}
              buttonColor={confirmButtonColor || "#E91E63"}
              labelStyle={styles.buttonLabel}
              textColor="#FFFFFF"
            >
              {confirmText}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
    padding: 24,
    elevation: 5,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
    borderRadius: 8,
  },
  confirmButton: {
    minWidth: 100,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CustomAlert;
