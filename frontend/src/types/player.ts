export type Position = "guard" | "forward" | "center";
export type HeightCategory = "small" | "medium" | "tall";
export type Quality = 1 | 2 | 3 | 4 | 5;

export interface Player {
  id: string;
  name: string;
  height_cm: number;
  height_category: HeightCategory;
  position: Position;
  quality: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlayerInput {
  name: string;
  height_cm: number;
  position: Position;
  quality: number;
}

export interface UpdatePlayerInput extends Partial<CreatePlayerInput> {
  active?: boolean;
}

export const POSITION_LABELS: Record<Position, string> = {
  guard: "Guard",
  forward: "Forward",
  center: "Center",
};

export const HEIGHT_CATEGORY_LABELS: Record<HeightCategory, string> = {
  small: "Pequeno",
  medium: "Médio",
  tall: "Alto",
};
