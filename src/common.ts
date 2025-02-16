import { useEffect, useState } from "react";

export const toUpperCaseFirstChar = (str: string): string =>
  str[0].toUpperCase() + str.slice(1);

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, _setValue] = useState(initialValue);

  useEffect(() => {
    const storageValue = localStorage.getItem(key);
    if (storageValue === null) return;

    setValue(JSON.parse(storageValue));
  }, [_setValue]);

  const setValue = (value: T) => {
    _setValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const initValue = () => {
    _setValue(initialValue);
    localStorage.removeItem(key);
  };

  return [value, setValue, initValue] as const;
};
