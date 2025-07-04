import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const PixCopyPasteConfirmScreen = ({ navigation, route }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editableAmount, setEditableAmount] = useState('');
  
  const { 
    amount, 
    emvData, 
    dictData, 
    userAccount, 
    userTaxId, 
    userName,
    isDynamicQrCode = false,
    isStaticQrCode = true,
    recommendedInitiationType = 'DICT',
    sourceFlow = 'copypaste'
  } = route.params || {};
  
  // Log do tipo de QR code recebido para debug
  console.log(`[PixCopyPasteConfirmScreen] Tipo de QR code: ${isDynamicQrCode ? 'Dinâmico' : 'Estático'}`);
  console.log(`[PixCopyPasteConfirmScreen] Origem: ${sourceFlow}`);
  console.log(`[PixCopyPasteConfirmScreen] Tipo de iniciação: ${recommendedInitiationType}`);
  
  // Extrair o valor original do QR code
  const originalAmount = emvData?.amount?.original || amount || '';
  
  useEffect(() => {
    // Inicializar o valor editável com o valor original do QR code
    setEditableAmount(originalAmount.toString());
  }, [originalAmount]);

  const handleConfirm = () => {
    console.log('[PixCopyPasteConfirmScreen] Dados para confirmação:', { 
      emvData, 
      isDynamicQrCode, 
      isStaticQrCode,
      recommendedInitiationType,
      sourceFlow
    });
    
    // Usar os flags de QR code recebidos da tela anterior
    console.log(`[PixCopyPasteConfirmScreen] Processando QR code ${isDynamicQrCode ? 'dinâmico' : 'estático'}`);
    
    // Determinar o tipo de iniciação com base no tipo de QR code conforme documentação
    // Para QR codes dinâmicos: DYNAMIC_QRCODE
    // Para QR codes estáticos: STATIC_QRCODE
    const initiationType = isDynamicQrCode ? "DYNAMIC_QRCODE" : "STATIC_QRCODE";
    console.log(`[PixCopyPasteConfirmScreen] Usando initiationType: ${initiationType}`);
    
    // Extrair a chave PIX de forma segura
    const pixKey = emvData.key || emvData.merchantAccountInformation?.key || dictData.key;
    console.log(`[PixCopyPasteConfirmScreen] Chave PIX: ${pixKey}`);
    
    // Verificar se há ID de transação (específico para QR codes dinâmicos)
    if (isDynamicQrCode && emvData.transactionIdentification) {
      console.log(`[PixCopyPasteConfirmScreen] ID de transação: ${emvData.transactionIdentification}`);
    }
  
    // Preparar dados para a tela de PIN (mantendo a mesma estrutura que já funciona)
    const paymentData = {
      amount: parseFloat(editableAmount),
      clientCode: Math.floor(100000 + Math.random() * 900000).toString(),
      endToEndId: dictData.endtoendid || `E${Date.now()}`, // Fallback para um ID gerado na hora
      initiationType: initiationType, // Usar o tipo correto baseado no tipo de QR code
      paymentType: "IMMEDIATE", // Valor fixo para pagamentos imediatos
      urgency: "HIGH", // Valor fixo para urgência alta
      transactionType: "TRANSFER", // Valor fixo para transferências
      debitParty: {
        account: userAccount,
        branch: "1", // Valor padrão
        taxId: userTaxId,
        name: userName || "Titular da Conta", // Nome do usuário ou fallback
        accountType: "TRAN" // Valor padrão para conta de transação
      },
      creditParty: {
        bank: dictData.participant, // Banco do recebedor, vem da resposta do DICT
        key: pixKey, // Chave PIX do recebedor (extraída de forma segura)
        account: dictData.account, // Conta do recebedor, vem da resposta do DICT
        branch: dictData.branch || "0", // Agência do recebedor, vem da resposta do DICT
        taxId: dictData.documentnumber, // CPF/CNPJ do recebedor, vem do DICT
        name: dictData.name, // Nome do recebedor, vem do DICT
        accountType: dictData.accounttype || "TRAN" // Tipo de conta do recebedor, vem do DICT
      },
      remittanceInformation: description || emvData.description || "Pagamento PIX via Código EMV" // Informação adicional
    };

    // Se for QR code dinâmico, adicionar o ID de transação
    if (isDynamicQrCode && emvData.transactionIdentification) {
      paymentData.transactionIdentification = emvData.transactionIdentification;
    }

    // Navegar para a tela de PIN passando os flags de tipo de QR code
    navigation.navigate('PixCopyPastePin', {
      paymentData,
      emvData,
      dictData,
      amount: parseFloat(editableAmount),
      isDynamicQrCode,
      isStaticQrCode,
      sourceFlow
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Confirmar</Text>
            <Text style={styles.subtitle}>Confira os dados da transferência</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount - Editable for static QR, read-only for dynamic QR */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Valor</Text>
            {isDynamicQrCode ? (
              // QR code dinâmico - Valor fixo, não editável
              <Text style={styles.amountValue}>
                {formatCurrency(parseFloat(editableAmount) || 0)}
              </Text>
            ) : (
              // QR code estático ou copia e cola - Valor editável
              <TextInput
                mode="outlined"
                label="Valor"
                value={editableAmount}
                onChangeText={setEditableAmount}
                style={styles.amountInput}
                keyboardType="numeric"
                outlineColor="#E0E0E0"
                activeOutlineColor="#E91E63"
                placeholder="0,00"
                disabled={isDynamicQrCode}
              />
            )}
            {/* Texto explicativo removido */}
          </View>

          <Divider style={styles.divider} />

          {/* Recipient Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Para</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{dictData?.name || emvData?.merchantName || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CPF/CNPJ</Text>
              <Text style={styles.infoValue}>{dictData?.documentnumber || emvData?.merchantTaxId || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Instituição</Text>
              <Text style={styles.infoValue}>{dictData?.participant || emvData?.merchantCity || 'N/A'}</Text>
            </View>
            {dictData?.key && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Chave PIX</Text>
                <Text style={styles.infoValue}>{dictData.key}</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <TextInput
              mode="outlined"
              label="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              maxLength={140}
              multiline
              numberOfLines={3}
              outlineColor="#E0E0E0"
              activeOutlineColor="#E91E63"
            />
          </View>
        </ScrollView>

        {/* Transfer Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading}
          >
            TRANSFERIR
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  amountContainer: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    color: '#000',
    fontWeight: 'bold',
  },
  amountInput: {
    backgroundColor: '#FFF',
    fontSize: 24,
    marginTop: 4,
  },
  dynamicQrNote: {
    fontSize: 12,
    color: '#E91E63',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    backgroundColor: '#E0E0E0',
    height: 1,
    marginVertical: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFF',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#E91E63',
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFF',
  },
});

export default PixCopyPasteConfirmScreen;
