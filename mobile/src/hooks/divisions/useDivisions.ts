import { useQuery } from "@tanstack/react-query";

import { getDivision, getDivisions } from "@/api/divisions";
import { divisionKeys } from "@/hooks/queryKeys";

export function useDivisions() {
  return useQuery({
    queryKey: divisionKeys.list(),
    queryFn: getDivisions,
  });
}

export function useDivision(id: string | undefined) {
  return useQuery({
    queryKey: divisionKeys.detail(id ?? ""),
    queryFn: () => getDivision(id!),
    enabled: !!id,
  });
}
