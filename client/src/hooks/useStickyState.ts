import { useEffect, useState, Dispatch, SetStateAction } from "react";

export default function useStickyState<T>(
  defaultValue: T,
  key: string
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = localStorage.getItem(key);
    if (stickyValue !== null) {
      try {
        return JSON.parse(stickyValue) as T;
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
