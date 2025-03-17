import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { Appbar, ActivityIndicator, Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Camera } from 'expo-camera';

const KYCScreen = ({ route }) => {
  const { kycUrl, documentNumber } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [webViewKey, setWebViewKey] = useState(1); // Usado para forçar o recarregamento do WebView
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);

  // Solicitar permissão da câmera ao montar o componente
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      console.log('Permissão de câmera:', status);
    })();
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel('kyc_status_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'kyc_proposals',
        filter: `document_number=eq.${documentNumber}`,
      }, (payload) => {
        const newStatus = payload.new.status;
        if (newStatus === 'PROCESSING' || 
            newStatus === 'PROCESSING_DOCUMENTSCOPY' || 
            newStatus === 'APPROVED' || 
            newStatus === 'REJECTED') {
          navigation.navigate('OnboardingSuccess');
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [documentNumber, navigation]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Função para lidar com solicitações de permissão
  const handlePermissionRequest = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    setShowPermissionRequest(false);
    
    if (status === 'granted') {
      // Recarregar o WebView para aplicar as novas permissões
      setWebViewKey(prevKey => prevKey + 1);
    } else {
      Alert.alert(
        "Permissão Negada",
        "Você precisa permitir o acesso à câmera para continuar com a verificação de documentos.",
        [
          { text: "OK" }
        ]
      );
    }
  };

  // Injetar JavaScript para monitorar solicitações de permissão
  const injectedJavaScript = `
    // Interceptar solicitações de getUserMedia
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = async function(constraints) {
      console.log('getUserMedia solicitado com:', JSON.stringify(constraints));
      try {
        const stream = await originalGetUserMedia.call(this, constraints);
        console.log('getUserMedia bem-sucedido');
        return stream;
      } catch (err) {
        console.log('Erro getUserMedia:', err.message);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'permission_request',
          constraints: constraints
        }));
        throw err;
      }
    };
    true;
  `;

  // Manipular mensagens do WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Mensagem do WebView:', data);
      
      if (data.type === 'permission_request') {
        // Mostrar interface de solicitação de permissão
        setShowPermissionRequest(true);
      }
    } catch (error) {
      console.log('Erro ao processar mensagem do WebView:', error);
    }
  };

  // Se estiver aguardando permissão, mostrar tela de solicitação
  if (showPermissionRequest) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction color="#FFFFFF" onPress={handleGoBack} />
          <Appbar.Content title="Verificação de Documentos" color="#FFFFFF" />
        </Appbar.Header>
        
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera" size={64} color="#E91E63" />
          <Text style={styles.permissionTitle}>Permissão de Câmera Necessária</Text>
          <Text style={styles.permissionText}>
            Para continuar com a verificação de documentos, precisamos acessar sua câmera para tirar fotos dos seus documentos e selfies.
          </Text>
          <Button 
            mode="contained" 
            onPress={handlePermissionRequest}
            style={styles.permissionButton}
          >
            Permitir Acesso à Câmera
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleGoBack}
            style={styles.cancelButton}
          >
            Cancelar
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="#FFFFFF" onPress={handleGoBack} />
        <Appbar.Content title="Verificação de Documentos" color="#FFFFFF" />
      </Appbar.Header>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      )}
      
      <WebView
        key={webViewKey}
        source={{ uri: kycUrl }}
        style={styles.webview}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        allowsBackForwardNavigationGestures={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        cacheEnabled={false}
        geolocationEnabled={true}
        useWebKit={true}
        originWhitelist={['*']}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E91E63',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: '#E91E63',
    width: '100%',
    marginBottom: 10,
    paddingVertical: 8,
  },
  cancelButton: {
    width: '100%',
    borderColor: '#E91E63',
  },
});

export default KYCScreen;