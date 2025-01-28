import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ChargesOptionsForm({ onBack, onCreate, onManage }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          icon="arrow-left"
          onPress={onBack}
          style={styles.backButton}
        >
          Voltar
        </Button>
      </View>

      <Card style={styles.card} onPress={onCreate}>
        <Card.Content style={styles.cardContent}>
          <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#FF1493" />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Criar Cobrança</Text>
            <Text style={styles.cardSubtitle}>Gere uma nova cobrança</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={onManage}>
        <Card.Content style={styles.cardContent}>
          <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#FF1493" />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Gerenciar Cobranças</Text>
            <Text style={styles.cardSubtitle}>Visualize suas cobranças</Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF1493',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
