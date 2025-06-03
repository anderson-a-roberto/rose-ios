import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { Appbar, ActivityIndicator, Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

const KYCScreen = ({ route }) => {
  const { kycUrl, documentNumber } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [webViewKey, setWebViewKey] = useState(1); // Usado para forçar o recarregamento do WebView
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  
  // Referência para o WebView - declarada no início do componente
  const webViewRef = React.useRef(null);

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

  // Função para selecionar imagem usando o Photo Picker
  const pickImage = async () => {
    try {
      console.log('Iniciando Photo Picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9, // Reduzir um pouco a qualidade para garantir compatibilidade
        base64: true,
        allowsMultipleSelection: false,
        exif: false, // Desabilitar metadados EXIF que podem causar problemas
      });

      console.log('Photo Picker resultado:', result.canceled ? 'cancelado' : 'imagem selecionada');

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Enviar a URI da imagem selecionada para o WebView
        if (webViewRef.current) {
          const asset = result.assets[0];
          
          // Determinar o tipo MIME correto baseado na extensão do arquivo
          let fileName = asset.uri.split('/').pop() || 'image.jpg';
          let mimeType = 'image/jpeg'; // Padrão para JPEG
          
          if (fileName.toLowerCase().endsWith('.png')) {
            mimeType = 'image/png';
          } else if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
            mimeType = 'image/jpeg';
          }
          
          // Garantir que o nome do arquivo tenha a extensão correta
          if (!fileName.toLowerCase().endsWith('.jpg') && 
              !fileName.toLowerCase().endsWith('.jpeg') && 
              !fileName.toLowerCase().endsWith('.png')) {
            fileName = fileName + '.jpg';
          }
          
          console.log('Imagem selecionada:', {
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            mimeType: mimeType,
            fileName: fileName
          });

          // Preparar os dados da imagem para enviar ao WebView
          const imageData = {
            type: 'image_selected',
            uri: asset.uri,
            base64: asset.base64,
            width: asset.width,
            height: asset.height,
            mimeType: mimeType,
            fileName: fileName
          };

          console.log('Enviando imagem para o WebView...');
          
          // Injetar um script mais robusto para processar a imagem no WebView
          webViewRef.current.injectJavaScript(`
            (function() {
              console.log('Recebendo imagem do React Native...');
              
              // Dados da imagem selecionada
              const imageData = ${JSON.stringify(imageData)};
              
              // Encontrar o input de arquivo ativo
              const fileInputs = document.querySelectorAll('input[type="file"]');
              console.log('Inputs de arquivo encontrados:', fileInputs.length);
              
              if (fileInputs.length > 0) {
                try {
                  // Verificar o tipo de arquivo aceito pelo input
                  const acceptAttr = fileInputs[0].accept || '';
                  console.log('Tipos de arquivo aceitos:', acceptAttr);
                  
                  // Criar um objeto Blob a partir do base64
                  const byteCharacters = atob(imageData.base64);
                  const byteArrays = [];
                  const sliceSize = 512;
                  
                  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    const slice = byteCharacters.slice(offset, offset + sliceSize);
                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                      byteNumbers[i] = slice.charCodeAt(i);
                    }
                    byteArrays.push(new Uint8Array(byteNumbers));
                  }
                  
                  const blob = new Blob(byteArrays, { type: imageData.mimeType });
                  
                  // Criar um objeto File a partir do Blob
                  const file = new File([blob], imageData.fileName, { 
                    type: imageData.mimeType,
                    lastModified: new Date().getTime()
                  });
                  console.log('Arquivo criado:', file.name, file.type, file.size);
                  
                  // Criar uma FileList simulada usando DataTransfer API
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  
                  // Atribuir os arquivos ao input
                  fileInputs[0].files = dataTransfer.files;
                  
                  // Disparar evento de mudança
                  const event = new Event('change', { bubbles: true });
                  fileInputs[0].dispatchEvent(event);
                  console.log('Evento de mudança disparado');
                  
                  // Verificar se o arquivo foi realmente atribuído
                  setTimeout(() => {
                    if (fileInputs[0].files.length > 0) {
                      console.log('Arquivo atribuído com sucesso:', 
                        fileInputs[0].files[0].name, 
                        fileInputs[0].files[0].type, 
                        fileInputs[0].files[0].size);
                    } else {
                      console.error('Falha ao atribuir arquivo ao input');
                    }
                  }, 100);
                  
                  return true;
                } catch (error) {
                  console.error('Erro ao processar imagem:', error);
                  alert('Erro ao processar a imagem selecionada. Tente novamente.');
                }
              } else {
                console.log('Nenhum input de arquivo encontrado');
              }
              
              return true;
            })();
          `);
        } else {
          console.log('WebView não está disponível');
        }
      }
    } catch (error) {
      console.log('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Injetar JavaScript para monitorar solicitações de permissão e substituir o input file
  const injectedJavaScript = `
    // Configurar sistema de logs para depuração
    const originalConsoleLog = console.log;
    console.log = function() {
      const args = Array.from(arguments);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'console_log',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
      }));
      originalConsoleLog.apply(console, arguments);
    };
    
    console.log('WebView inicializada com script injetado');
    
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

    // Monitorar todos os inputs de arquivo
    const monitorFileInputs = () => {
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        if (!input.hasAttribute('data-monitored')) {
          input.setAttribute('data-monitored', 'true');
          
          input.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Input de arquivo clicado:', this.id || 'sem-id');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'file_input_clicked',
              accept: this.accept || '*/*',
              inputId: this.id || Date.now().toString()
            }));
            return false;
          });
        }
      });
    };

    // Observar mudanças no DOM para monitorar novos inputs de arquivo
    const observer = new MutationObserver(() => {
      monitorFileInputs();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Monitorar inputs existentes
    document.addEventListener('DOMContentLoaded', monitorFileInputs);
    monitorFileInputs();
    
    // Capturar eventos de clique em todo o documento para inputs de arquivo
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (target.tagName === 'INPUT' && target.type === 'file') {
        console.log('Clique em input de arquivo capturado via delegação');
        e.preventDefault();
        e.stopPropagation();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'file_input_clicked',
          accept: target.accept || '*/*',
          inputId: target.id || Date.now().toString()
        }));
        return false;
      }
    }, true);

    true;
  `;

  // Referência para o WebView já foi declarada no início do componente

  // Manipular mensagens do WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Mensagem do WebView:', data);
      
      if (data.type === 'permission_request') {
        // Mostrar interface de solicitação de permissão
        setShowPermissionRequest(true);
      } else if (data.type === 'file_input_clicked') {
        // Abrir o Photo Picker quando um input de arquivo for clicado
        console.log('Input de arquivo clicado, abrindo Photo Picker...');
        pickImage();
      } else if (data.type === 'console_log') {
        // Exibir logs do WebView no console nativo
        console.log('WebView log:', data.message);
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
        ref={webViewRef}
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