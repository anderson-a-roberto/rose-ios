import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from './AppHeader';

const AppLayout = ({ 
  children, 
  title, 
  showBackButton = true, 
  showLogo = true, 
  userInfo = null,
  rightComponent = null,
  onBackPress = null,
  contentStyle = {}
}) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <AppHeader 
          title={title}
          showBackButton={showBackButton}
          showLogo={showLogo}
          userInfo={userInfo}
          rightComponent={rightComponent}
          onBackPress={onBackPress}
        />
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#682145', // Cor do topo igual à tela de boas-vindas
  },
  container: {
    flex: 1,
    backgroundColor: '#682145', // Cor do topo igual à tela de boas-vindas
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Conteúdo com fundo branco
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  }
});

export default AppLayout;
