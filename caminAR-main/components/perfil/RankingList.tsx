import React from 'react';
import { View } from 'react-native';
import { Card, Divider, Icon, Text } from 'react-native-paper';
import { RankingListItem } from './RankingListItem';

// --- DATOS DE EJEMPLO ---
// En una app real, estos datos vendrían de tu base de datos (Firestore, etc.)
const rankingData = [
  { id: 'user-456', name: 'Ana Martínez', score: 2150 },
  { id: 'user-789', name: 'Carlos López', score: 1890 },
  { id: 'user-123', name: 'María González', score: 1250 }, // Este es el usuario actual
  { id: 'user-101', name: 'Luis Rodríguez', score: 1180 },
  { id: 'user-112', name: 'Sofía Chen', score: 1050 },
];

// Simula el ID del usuario que ha iniciado sesión
const currentUserId = 'user-123';
// --- FIN DE DATOS DE EJEMPLO ---


export const RankingList = () => {
  return (
    <Card style={{ backgroundColor: '#fff' }}>
      <Card.Title
        title="Ranking Local"
        subtitle="Top usuarios en tu área"
        titleVariant="titleLarge"
        left={(props) => <Icon {...props} source="trophy-variant-outline" size={28} />}
      />
      <Card.Content>
        <View>
          {rankingData.map((user, index) => (
            <React.Fragment key={user.id}>
              <RankingListItem
                rank={index + 1}
                name={user.name}
                score={user.score}
                isCurrentUser={user.id === currentUserId}
              />
              {/* No mostrar el divisor después del último elemento */}
              {index < rankingData.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};
