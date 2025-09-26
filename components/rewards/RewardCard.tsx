import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Reward } from "../../models/types";

export default function RewardCard({ r }: { r: Reward }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{r.title}</Text>
      <Text>{r.partner}</Text>
      <Text style={styles.points}>{r.pointsRequired} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 12, borderRadius: 12 },
  title: { fontWeight: "700", fontSize: 18, color: theme.colors.text },
  points: { color: theme.colors.tertiary, marginTop: 6, fontWeight: "700" },
});
