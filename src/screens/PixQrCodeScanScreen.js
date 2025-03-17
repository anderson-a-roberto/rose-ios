import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';

const PixQrCodeScanScreen = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setLoading(false);
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Verificar se é um QR Code PIX válido
    try {
      // Aqui você pode adicionar uma validação mais específica para o formato PIX
      // Por exemplo, verificar se começa com "pix://" ou se contém campos específicos
      
      // Simulando processamento dos dados do QR Code
      setTimeout(() => {
        // Navegar para a próxima tela com os dados do QR Code
        // Aqui você pode adaptar para seguir o fluxo de pagamento similar ao "Copia e Cola"
        navigation.navigate('PixCopyPaste', { pixCode: data });
      }, 500);
    } catch (error) {
      Alert.alert(
        "Erro na leitura",
        "O QR Code escaneado não é um código PIX válido.",
        [
          {
            text: "Tentar novamente",
            onPress: () => setScanned(false)
          }
        ]
      );
    }
  };

  if (hasPermission === null || loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Ler QR Code</Text>
            <Text style={styles.subtitle}>Escaneie um QR Code para fazer um pagamento</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#E91E63" style={styles.loader} />
          <Text style={styles.loadingText}>Solicitando permissão da câmera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Ler QR Code</Text>
            <Text style={styles.subtitle}>Escaneie um QR Code para fazer um pagamento</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.errorText}>Sem acesso à câmera</Text>
          <Button 
            mode="contained" 
            style={styles.button}
            buttonColor="#E91E63"
            onPress={() => navigation.goBack()}
          >
            Voltar
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Ler QR Code</Text>
          <Text style={styles.subtitle}>Escaneie um QR Code para fazer um pagamento</Text>
        </View>
      </View>
      
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        />
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              <MaterialCommunityIcons 
                name="scan-helper" 
                size={230} 
                color="rgba(255, 255, 255, 0.7)" 
              />
              {scanned && (
                <View style={styles.scanIndicator}>
                  <ActivityIndicator size="large" color="#FFF" />
                  <Text style={styles.scanningText}>Processando QR Code...</Text>
                </View>
              )}
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          style={styles.button}
          buttonColor="#E91E63"
          textColor="#FFFFFF"
          onPress={() => setScanned(false)}
          disabled={!scanned}
        >
          Escanear Novamente
        </Button>
        
        <TouchableOpacity 
          style={styles.manualEntryButton}
          onPress={() => navigation.navigate('PixCopyPaste')}
        >
          <Text style={styles.manualEntryText}>Inserir código manualmente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    color: '#E91E63',
    fontSize: 32,
    fontWeight: '300',
  },
  headerContent: {
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#E91E63',
    marginBottom: 20,
  },
  loader: {
    marginBottom: 20,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    flexDirection: 'column',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
  },
  scanningText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  button: {
    paddingHorizontal: 24,
    height: 50,
    justifyContent: 'center',
    borderRadius: 4,
    width: '100%',
  },
  manualEntryButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  manualEntryText: {
    color: '#E91E63',
    fontSize: 16,
  },
});

export default PixQrCodeScanScreen;
