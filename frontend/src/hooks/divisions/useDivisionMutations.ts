import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDivision,
  swapPlayers,
  deleteDivision,
} from "@/lib/api/divisions";
import { CreateDivisionInput, SwapPlayersInput } from "@/types/division";
import { divisionKeys } from "../queryKeys";

export function useDivisionMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: CreateDivisionInput) => createDivision(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: divisionKeys.all }),
  });

  const swap = useMutation({
    mutationFn: ({
      divisionId,
      data,
    }: {
      divisionId: string;
      data: SwapPlayersInput;
    }) => swapPlayers(divisionId, data),
    onSuccess: (_, { divisionId }) =>
      queryClient.invalidateQueries({
        queryKey: divisionKeys.detail(divisionId),
      }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteDivision(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: divisionKeys.all }),
  });

  return {
    createDivision: create,
    swapPlayers: swap,
    deleteDivision: remove,
  };
}
