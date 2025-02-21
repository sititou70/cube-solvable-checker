import { useEffect, useState } from "react";

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, _setValue] = useState<T | "initializing">("initializing");
  const setValue = (value: T) => {
    _setValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  useEffect(() => {
    const storageValue = localStorage.getItem(key);
    if (storageValue === null) {
      setValue(defaultValue);
      return;
    }

    setValue(JSON.parse(storageValue));
  }, [_setValue]);

  return [value, setValue] as const;
};
