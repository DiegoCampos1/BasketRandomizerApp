import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "@/lib/api/players";
import { CreatePlayerInput, UpdatePlayerInput } from "@/types/player";
import { playerKeys } from "../queryKeys";

export function usePlayerMutations() {
  const queryClient = useQueryClient();

  const invalidatePlayers = () =>
    queryClient.invalidateQueries({ queryKey: playerKeys.all });

  const create = useMutation({
    mutationFn: (data: CreatePlayerInput) => createPlayer(data),
    onSuccess: invalidatePlayers,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlayerInput }) =>
      updatePlayer(id, data),
    onSuccess: invalidatePlayers,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: invalidatePlayers,
  });

  return { createPlayer: create, updatePlayer: update, deletePlayer: remove };
}
