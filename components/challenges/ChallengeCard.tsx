import * as Sharing from "expo-sharing";
import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { theme } from "../../constants/theme";
import { Challenge } from "../../models/types";

export default function ChallengeCard({ c }: { c: Challenge }) {
  const shot = useRef<ViewShot>(null);

  const shareImage = async () => {
    const uri = await shot.current?.capture?.({ format: "png", quality: 1 });
    if (uri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };

  const pct = c.progress ? Math.round((c.progress.current / c.progress.total) * 100) : c.status === "completed" ? 100 : 0;

  return (
    <ViewShot ref={shot} style={{ borderRadius: 16 }}>
      <View style={styles.card}>
        <Text style={styles.title}>{c.coverEmoji} {c.title}</Text>
        <Text style={styles.desc}>{c.description}</Text>
        {c.progress && (
          <View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
            <Text>{c.progress.current}/{c.progress.total} · {pct}%</Text>
          </View>
        )}
        <Text onPress={shareImage} style={styles.share}>📤 Compartir</Text>
      </View>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 12, borderRadius: 12 },
  title: { fontWeight: "700", fontSize: 18, color: theme.text },
  desc: { color: theme.text, marginTop: 4 },
  barBg: { height: 8, backgroundColor: "#ddd", borderRadius: 4, marginTop: 8 },
  barFill: { height: 8, backgroundColor: theme.primary, borderRadius: 4 },
  share: { marginTop: 8, color: theme.accent, fontWeight: "700" },
});
