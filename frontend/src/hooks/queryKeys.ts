export const playerKeys = {
  all: ["players"] as const,
  list: () => [...playerKeys.all, "list"] as const,
  detail: (id: string) => [...playerKeys.all, "detail", id] as const,
};

export const divisionKeys = {
  all: ["divisions"] as const,
  list: () => [...divisionKeys.all, "list"] as const,
  detail: (id: string) => [...divisionKeys.all, "detail", id] as const,
};
