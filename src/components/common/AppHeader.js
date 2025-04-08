import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AppHeader = ({ 
  title, 
  showBackButton = true, 
  showLogo = true, 
  userInfo = null,
  rightComponent = null,
  onBackPress = null
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        {userInfo ? (
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            {userInfo.accountInfo && (
              <Text style={styles.accountInfo}>{userInfo.accountInfo}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>
      
      <View style={styles.rightContainer}>
        {rightComponent}
        {showLogo && (
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#682145',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountInfo: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
  },
  logo: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF'
  },
});

export default AppHeader;
