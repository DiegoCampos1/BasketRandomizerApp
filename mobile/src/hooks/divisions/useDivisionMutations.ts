import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDivision, deleteDivision, movePlayer } from "@/api/divisions";
import { divisionKeys } from "@/hooks/queryKeys";
import { applyOptimisticMove } from "@/lib/division";
import type { CreateDivisionInput, Division, MovePlayerInput } from "@/types/division";

export function useDivisionMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: CreateDivisionInput) => createDivision(data),
    onSuccess: (division) => {
      // Seed the detail cache so the result screen renders without a fetch.
      queryClient.setQueryData(divisionKeys.detail(division.id), division);
      queryClient.invalidateQueries({ queryKey: divisionKeys.list() });
    },
  });

  const move = useMutation({
    mutationFn: ({ divisionId, data }: { divisionId: string; data: MovePlayerInput }) =>
      movePlayer(divisionId, data),
    onMutate: async ({ divisionId, data }) => {
      const key = divisionKeys.detail(divisionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Division>(key);
      if (previous) {
        queryClient.setQueryData(
          key,
          applyOptimisticMove(previous, data.team_player_id, data.target_team_id)
        );
      }
      return { previous };
    },
    onError: (_error, { divisionId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(divisionKeys.detail(divisionId), context.previous);
      }
    },
    onSuccess: (serverDivision, { divisionId }) => {
      queryClient.setQueryData(divisionKeys.detail(divisionId), serverDivision);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteDivision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: divisionKeys.all });
    },
  });

  return { createDivision: create, movePlayer: move, deleteDivision: remove };
}
