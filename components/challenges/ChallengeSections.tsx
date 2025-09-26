import { View } from "react-native";
import { Challenge } from "../../models/types";
import ChallengeCard from "../challenges/ChallengeCard"

export default function ChallengeSections({ data }: { data: Challenge[] }) {
  const completed = data.filter((c) => c.status === "completed");
  const inProgress = data.filter((c) => c.status === "in_progress");
  const available = data.filter((c) => c.status === "available");

  return (
    <View>
      {completed.map((c) => <ChallengeCard key={c.id} c={c} />)}
      {inProgress.map((c) => <ChallengeCard key={c.id} c={c} />)}
      {available.map((c) => <ChallengeCard key={c.id} c={c} />)}
    </View>
  );
}
