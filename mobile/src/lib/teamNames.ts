type TFunction = (key: string, options?: Record<string, unknown>) => string;

/**
 * Team names are persisted in Portuguese by the backend ("Time Vermelho",
 * "Preto 2", ...). Translate them for display based on the active locale;
 * unknown names pass through untouched.
 */
export function translateTeamName(name: string, t: TFunction): string {
  const match = name.match(/^(?:Time\s+)?(Vermelho|Preto)(?:\s+(\d+))?$/i);
  if (!match) return name;

  const color = match[1]!.toLowerCase() === "vermelho" ? "red" : "black";
  const number = match[2];

  if (number) {
    return t(`teamNames.${color}Numbered`, { number });
  }
  return t(`teamNames.${color}`);
}
