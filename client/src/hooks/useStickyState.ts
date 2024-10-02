import { useEffect, useState } from "react";

export default function useStickyState(defaultValue: any, key: string) {
  const [value, setValue] = useState(() => {
    const stickyValue = localStorage.getItem(key);
    if (stickyValue) {
      return JSON.parse(stickyValue);
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
