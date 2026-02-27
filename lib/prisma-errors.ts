export function isMissingTableError(error: unknown, tableName: string): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();
  return (
    normalized.includes(`table main.${tableName.toLowerCase()} does not exist`) ||
    normalized.includes(`the table main.${tableName.toLowerCase()} does not exist`)
  );
}
