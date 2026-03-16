import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/api/players";
import { playerKeys } from "../queryKeys";

export function usePlayers() {
  return useQuery({
    queryKey: playerKeys.list(),
    queryFn: getPlayers,
  });
}
