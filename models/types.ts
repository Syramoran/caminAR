export type ChallengeStatus = "available" | "in_progress" | "completed";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  points: number;
  status: ChallengeStatus;
  progress?: { current: number; total: number };
  type: "visit_points" | "photo_task" | "custom";
  mapPointIds?: string[];
  coverEmoji?: string;
};

export type Reward = {
  id: string;
  partner: string;
  title: string;
  pointsRequired: number;
  description?: string;
};

export type MapPoint = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
  challengeIds?: string[];
  kind: "recycle_bin" | "event" | "poi";
};
