import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileSettingsForm from '../components/profile/ProfileSettingsForm';

export default function ProfileSettingsScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ProfileSettingsForm 
        onBack={() => navigation.goBack()} 
      />
    </SafeAreaView>
  );
}
