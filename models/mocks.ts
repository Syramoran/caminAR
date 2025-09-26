import { Challenge, MapPoint, Reward } from "./types";

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "Encontrá 20 puntos de reciclaje",
    description: "Ubicá y fotografiá 20 tachos de reciclaje en la ciudad.",
    points: 200,
    status: "in_progress",
    progress: { current: 5, total: 20 },
    type: "visit_points",
    mapPointIds: ["m1", "m2", "m3"],
    coverEmoji: "♻️",
  },
  {
    id: "c2",
    title: "Foto: reutilizá una botella",
    description: "Sacá una foto mostrando cómo reutilizás una botella.",
    points: 80,
    status: "available",
    type: "photo_task",
    coverEmoji: "📸",
  },
  {
    id: "c3",
    title: "Caminata ecológica 5 km",
    description: "Completá una caminata de 5 km por una ruta verde.",
    points: 120,
    status: "completed",
    type: "custom",
    coverEmoji: "🥾",
  },
];

export const MOCK_REWARDS: Reward[] = [
  { id: "r1", partner: "EcoTienda", title: "10% OFF", pointsRequired: 150, description: "Descuento en productos eco." },
  { id: "r2", partner: "Green Café", title: "2x1 en latte", pointsRequired: 220 },
  { id: "r3", partner: "BiciFix", title: "Service básico gratis", pointsRequired: 400 },
];

export const MOCK_POINTS: MapPoint[] = [
  { id: "m1", title: "Tacho reciclaje Plaza", latitude: -31.394, longitude: -58.018, kind: "recycle_bin", challengeIds: ["c1"] },
  { id: "m2", title: "Punto verde Costanera", latitude: -31.405, longitude: -58.016, kind: "recycle_bin", challengeIds: ["c1"] },
  { id: "m3", title: "EcoPunto UNER", latitude: -31.389, longitude: -58.017, kind: "recycle_bin", challengeIds: ["c1"] },
];
