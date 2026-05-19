/** Firestore rejects `undefined` anywhere in document data. */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined) {
    return value;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => stripUndefinedDeep(entry)) as T;
  }
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (val === undefined) continue;
    out[key] = stripUndefinedDeep(val);
  }
  return out as T;
}
