import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, FlatList, KeyboardAvoidingView } from 'react-native';
import { Text, Button, List, Card, Dialog, Portal } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';
// Modal substituído pela tela PartnerFormScreen

const OWNER_TYPES = [
  { label: 'Sócio', value: 'SOCIO' },
  { label: 'Representante Legal', value: 'REPRESENTANTE' },
  { label: 'Demais Sócios', value: 'DEMAIS SOCIOS' },
];

const PartnerDataScreen = ({ navigation, route }) => {
  const { onboardingData, addPartner, updatePartner, removePartner } = useOnboarding();
  // Não precisamos mais do estado do modal
  const [editingPartner, setEditingPartner] = useState(null);
  
  // Efeito para processar o retorno da tela de formulário
  useEffect(() => {
    if (route.params?.newPartner) {
      const { newPartner, action } = route.params;
      
      if (action === 'add') {
        // Adicionar novo sócio
        addPartner(newPartner);
      } else if (action === 'update') {
        // Atualizar sócio existente
        const index = onboardingData.partners.findIndex(p => p.documentNumber === newPartner.documentNumber);
        if (index !== -1) {
          updatePartner(index, newPartner);
        }
      }
      
      // Limpar os parâmetros da rota
      navigation.setParams({ newPartner: null, action: null });
    }
  }, [route.params]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  const handleAddPartner = () => {
    // Navegar para a tela de formulário de sócio
    navigation.navigate('PartnerForm', {
      existingPartners: onboardingData.partners
    });
  };

  const handleEditPartner = (partner) => {
    // Navegar para a tela de formulário de sócio com os dados do sócio para edição
    navigation.navigate('PartnerForm', {
      initialData: partner,
      existingPartners: onboardingData.partners
    });
  };

  const openEditPartner = (partner) => {
    setEditingPartner(partner);
    handleEditPartner(partner);
  };

  const confirmDeletePartner = (partner) => {
    setPartnerToDelete(partner);
    setShowDeleteConfirm(true);
  };

  const handleDeletePartner = () => {
    if (partnerToDelete) {
      const index = onboardingData.partners.findIndex(p => p.id === partnerToDelete.id);
      if (index !== -1) {
        removePartner(index);
      }
      setShowDeleteConfirm(false);
      setPartnerToDelete(null);
    }
  };

  const renderPartnerItem = ({ item }) => (
    <Card style={styles.partnerCard}>
      <Card.Content>
        <View style={styles.partnerHeader}>
          <View>
            <Text style={styles.partnerName}>{item.fullName}</Text>
            <Text style={styles.partnerType}>{OWNER_TYPES.find(t => t.value === item.ownerType)?.label || item.ownerType}</Text>
          </View>
          <View style={styles.partnerActions}>
            <TouchableOpacity onPress={() => openEditPartner(item)} style={styles.actionButton}>
              <MaterialCommunityIcons name="pencil" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDeletePartner(item)} style={styles.actionButton}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerInfoText}>CPF: {item.documentNumber}</Text>
          <Text style={styles.partnerInfoText}>Telefone: {item.phoneNumber}</Text>
          <Text style={styles.partnerInfoText}>Email: {item.email}</Text>
          <Text style={styles.partnerInfoText}>Data de Nascimento: {item.birthDate}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Dados do sócio</Text>
          <Text style={styles.subtitle}>Informe os dados do sócio administrador</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.mainContainer}>
          <View style={styles.scrollableContent}>
            {onboardingData.partners && onboardingData.partners.length > 0 ? (
              <FlatList
                data={onboardingData.partners}
                renderItem={renderPartnerItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.partnersList}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="account-group-outline" size={48} color="#CCCCCC" />
                </View>
                <Text style={styles.emptyTitle}>Nenhum sócio cadastrado</Text>
                <Text style={styles.emptySubtitle}>Adicione pelo menos um sócio para continuar</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPartner}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#E91E63" style={styles.addButtonIcon} />
              <Text style={styles.addButtonText}>Adicionar Sócio</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              style={[styles.continueButton, onboardingData.partners.length === 0 && styles.disabledButton]}
              labelStyle={styles.continueButtonLabel}
              disabled={onboardingData.partners.length === 0}
              onPress={() => navigation.navigate('CompanyPassword')}
              uppercase={false}
            >
              Continuar
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Portal>
        <Dialog visible={showDeleteConfirm} onDismiss={() => setShowDeleteConfirm(false)}>
          <Dialog.Title>Excluir sócio</Dialog.Title>
          <Dialog.Content>
            <Text>Deseja realmente excluir este sócio?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteConfirm(false)} color="#666">Cancelar</Button>
            <Button onPress={handleDeletePartner} color="#E91E63">Excluir</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Container principal para o KeyboardAvoidingView
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Container que envolve o ScrollView e o botão
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFF',
  },
  scrollableContent: {
    flex: 1,
    padding: 24,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTop: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#E91E63',
    marginTop: -4,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  partnersList: {
    paddingBottom: 16,
  },
  partnerCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
    backgroundColor: '#682145',
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  partnerType: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  partnerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    flexDirection: 'row',
    backgroundColor: '#e92176',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  partnerInfo: {
    marginTop: 8,
  },
  partnerInfoText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    height: 48,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  continueButton: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
});

export default PartnerDataScreen;
