import { useQuery } from "@tanstack/react-query";
import { getDivisions, getDivision } from "@/lib/api/divisions";
import { divisionKeys } from "../queryKeys";

export function useDivisions() {
  return useQuery({
    queryKey: divisionKeys.list(),
    queryFn: getDivisions,
  });
}

export function useDivision(id: string) {
  return useQuery({
    queryKey: divisionKeys.detail(id),
    queryFn: () => getDivision(id),
    enabled: !!id,
  });
}
