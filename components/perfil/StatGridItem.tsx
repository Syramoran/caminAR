import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme, Icon } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

type Props = {
  icon: IconSource;
  value: string | number;
  label: string;
};

export const StatGridItem = ({ icon, value, label }: Props) => {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.content}>
        <Icon source={icon} size={32} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={styles.valueText}>
          {value}
        </Text>
        <Text variant="bodySmall" style={styles.labelText}>
          {label}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    // Cada tarjeta ocupa casi la mitad del espacio para crear una grilla 2x2
    width: '48%',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  valueText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  labelText: {
    marginTop: 2,
    textAlign: 'center',
  },
});
