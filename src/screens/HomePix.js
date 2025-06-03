import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MenuItem = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="#682145" />
    </View>
    <Text style={styles.menuTitle}>{title}</Text>
    <Text style={styles.menuDescription}>{description}</Text>
  </TouchableOpacity>
);

const HomePix = ({ route, navigation }) => {
  const { balance = 0 } = route.params || {};
  const [showBalance, setShowBalance] = React.useState(true);

  const formatValue = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const menuItems = [
    {
      icon: 'bank-transfer',
      title: 'Transferir',
      description: 'Faça transferências através de chaves ou dados bancários.',
      onPress: () => navigation.navigate('PixTransferAmount', { balance }),
    },
    {
      icon: 'qrcode',
      title: 'Receber Pix',
      description: 'Compartilhe o QR Code para receber cobrança de terceiros.',
      onPress: () => navigation.navigate('PixReceiveAmount'),
    },
    {
      icon: 'qrcode-scan',
      title: 'Ler QR Code',
      description: 'Escaneie um QR Code para fazer um pagamento PIX.',
      onPress: () => navigation.navigate('PixQrCode'),
    },
    {
      icon: 'content-copy',
      title: 'Copia e Cola',
      description: 'Cole um código PIX para fazer uma transferência.',
      onPress: () => navigation.navigate('PixCopyPaste'),
    },
    {
      icon: 'key-variant',
      title: 'Minhas Chaves',
      description: 'Cadastre e gerencie suas chaves ativas e pendentes.',
      onPress: () => navigation.navigate('PixKeys', { balance }),
    },
    {
      icon: 'shield-lock',
      title: 'Meus Limites',
      description: 'Defina limites personalizados para suas transferências.',
      onPress: () => navigation.navigate('PixLimits'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#682145" />
      {/* Card do Topo */}
      <View style={styles.topCard}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard2')}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pix</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Card de Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
          <View style={styles.balanceRow}>
            {showBalance ? (
              <Text style={styles.balanceValue}>
                {formatValue(balance)}
              </Text>
            ) : (
              <View style={styles.hiddenBalanceContainer}>
                <View style={styles.hiddenBalanceDot} />
                <View style={styles.hiddenBalanceDot} />
                <View style={styles.hiddenBalanceDot} />
                <View style={styles.hiddenBalanceDot} />
                <View style={styles.hiddenBalanceDot} />
                <View style={styles.hiddenBalanceDot} />
              </View>
            )}
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <MaterialCommunityIcons
                name={showBalance ? 'eye-off' : 'eye'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Menu Grid */}
      <ScrollView style={styles.menuContainer}>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </View>
        
        {/* Seção de Dúvidas */}
        <View style={styles.helpSection}>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => navigation.navigate('PixInfo')}
          >
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#682145" />
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>Dúvidas sobre o Pix</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#682145" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topCard: {
    backgroundColor: '#682145',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#682145',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  hiddenBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hiddenBalanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  menuContainer: {
    flex: 1,
    padding: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  menuDescription: {
    fontSize: 12,
    color: '#000',
    lineHeight: 16,
  },
  helpSection: {
    marginTop: 24,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  helpTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#682145',
  },
});

export default HomePix;
