import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';

const KYCScreen = ({ route }) => {
  const { kycUrl, documentNumber } = route.params;
  const navigation = useNavigation();

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
          navigation.navigate('ThankYou');
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [documentNumber, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: kycUrl }}
        style={styles.webview}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});

export default KYCScreen;