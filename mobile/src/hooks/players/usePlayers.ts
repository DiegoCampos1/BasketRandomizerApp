import { useQuery } from "@tanstack/react-query";

import { getPlayers } from "@/api/players";
import { playerKeys } from "@/hooks/queryKeys";

export function usePlayers() {
  return useQuery({
    queryKey: playerKeys.list(),
    queryFn: getPlayers,
  });
}
