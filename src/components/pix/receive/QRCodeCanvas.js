import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const QRCodeImage = ({ value = "", size = 256 }) => {
  if (!value) {
    return (
      <View style={{ 
        width: size, 
        height: size, 
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0'
      }}>
        <MaterialCommunityIcons 
          name="qrcode" 
          size={size * 0.8} 
          color="#000000" 
        />
      </View>
    );
  }

  return (
    <View style={{ 
      width: size, 
      height: size, 
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    }}>
      <QRCode
        value={value}
        size={size - 32}
        color="#000000"
        backgroundColor="white"
      />
    </View>
  );
};

export default QRCodeImage;
