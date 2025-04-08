import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';

const STATUS_COLORS = {
  PENDING: '#FFA500',  // Laranja
  PAID: '#4CAF50',     // Verde
  EXPIRED: '#FF0000',  // Vermelho
  CANCELED: '#F44336', // Vermelho (igual ao CANCELADA)
  ERROR: '#FF0000'     // Vermelho
};

const STATUS_LABELS = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  EXPIRED: 'Expirado',
  CANCELED: 'CANCELADA', // Texto igual ao CANCELADA
  ERROR: 'Erro'
};

export default function ChargeItem({ charge, onViewPDF, loading }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.chargeInfo}>
          <Text style={styles.chargeName}>{charge.debtor_name}</Text>
          <Text style={styles.chargeDate}>
            Vencimento: {formatDate(charge.due_date)}
          </Text>
          <Text style={styles.chargeValue}>
            {formatCurrency(charge.amount)}
          </Text>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: STATUS_COLORS[charge.status] }
            ]}
            textStyle={styles.statusText}
          >
            {STATUS_LABELS[charge.status]}
          </Chip>
        </View>
        <Button
          icon="file-document-outline"
          mode="text"
          onPress={() => onViewPDF(charge.transaction_id)}
          textColor="#FF1493"
          loading={loading}
          disabled={loading}
        >
          Ver boleto
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chargeInfo: {
    flex: 1,
  },
  chargeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chargeDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chargeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF1493',
    marginTop: 4,
  },
  statusChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
});
