import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip, Button, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useChallenges } from '../../hooks/useChallenges';

export default function ActiveChallenges() {
    const { challenges } = useChallenges();
    const inProgress = challenges.filter(c => c.status === 'in_progress');

    if (inProgress.length === 0) {
        return null; // No muestra nada si no hay desafíos activos
    }

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <Icon name="target" size={24} color="#333" />
                    <Text style={styles.title}>Desafíos Activos</Text>
                </View>
                <Text style={styles.subtitle}>Completa estos para ganar puntos eco</Text>

                {inProgress.map(c => {
                    const pct = c.progress ? (c.progress.current / c.progress.total) : 0;
                    return (
                        <View key={c.id} style={styles.challengeItem}>
                            <View style={styles.challengeHeader}>
                                <Text style={styles.challengeTitle}>{c.title}</Text>
                                <Chip style={styles.pointsChip}>+{c.points} pts</Chip>
                            </View>
                            <Text style={styles.challengeDesc}>{c.description}</Text>
                            <View style={styles.progressContainer}>
                                <ProgressBar progress={pct} style={styles.progressBar} />
                                <Text style={styles.progressText}>{c.progress?.current}/{c.progress?.total}</Text>
                            </View>
                            <Button mode="contained" style={styles.actionButton}>Continuar</Button>
                        </View>
                    )
                })}
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
      backgroundColor: 'white',
      marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    subtitle: {
      color: '#666',
      marginBottom: 16,
    },
    challengeItem: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    challengeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    challengeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    pointsChip: {
        backgroundColor: '#D4EDDA',
    },
    challengeDesc: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    progressContainer: {
        marginTop: 12,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    progressText: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    actionButton: {
        marginTop: 12,
        borderRadius: 20,
    }
});
