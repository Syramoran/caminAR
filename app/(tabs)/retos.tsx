import { ScrollView } from "react-native";
import ChallengeSections from "../../components/challenges/ChallengeSections";
import { theme } from "../../constants/theme";
import { useChallenges } from "../../hooks/useChallenges";

export default function RetosScreen() {
  const { challenges } = useChallenges();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <ChallengeSections data={challenges} />
    </ScrollView>
  );
}
