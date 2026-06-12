import { useLocalSearchParams } from "expo-router";

import AppText from "@/components/ui/AppText";
import Screen from "@/components/ui/Screen";
import { useDivision } from "@/hooks/divisions/useDivisions";

export default function DivisionResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: division } = useDivision(id);

  return (
    <Screen>
      <AppText variant="display">Resultado</AppText>
      <AppText variant="body" tone="secondary">
        {division ? `${division.teams.length} times — em construção (M4)` : "..."}
      </AppText>
    </Screen>
  );
}
