import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

type ThemeMode = "light" | "dark";

export const useThemeMode = (storageKey: string) => {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const savedTheme = storage.readString(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }
    const prefersDark = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
    setTheme(prefersDark ? "dark" : "light");
  }, [storageKey]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.writeString(storageKey, theme);
  }, [storageKey, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
};
