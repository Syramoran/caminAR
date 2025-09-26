import { ScrollView } from "react-native";
import RewardCard from "../../components/rewards/RewardCard";
import { theme } from "../../constants/theme";
import { MOCK_REWARDS } from "../../models/mocks";

export default function PremiosScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      {MOCK_REWARDS.map((r) => (
        <RewardCard key={r.id} r={r} />
      ))}
    </ScrollView>
  );
}
