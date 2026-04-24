export function encodeCursor(index: number): string {
  return Buffer.from(String(index), "utf8").toString("base64url");
}

export function decodeCursor(cursor?: string): number {
  if (!cursor) return 0;
  const value = Number(Buffer.from(cursor, "base64url").toString("utf8"));
  if (Number.isNaN(value) || value < 0) return 0;
  return value;
}
