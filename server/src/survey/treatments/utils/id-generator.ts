const stringifyValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stringifyValue).join(',')}]`;
  }

  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const entries = keys.map((key) => `${key}:${stringifyValue(obj[key])}`);
    return `{${entries.join(',')}}`;
  }

  if (typeof value === 'string') {
    return `"${value}"`;
  }

  return String(value);
};

export function stringy(value: unknown): string {
  return stringifyValue(value);
}
