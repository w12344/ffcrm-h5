/**
 * 主題上下文和Provider
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ThemeContextType, ThemeType } from "../types/theme";
import { getThemeConfig, defaultTheme } from "../config/themes";

// 創建主題上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主題Provider組件
interface ThemeProviderProps {
  children: ReactNode;
  defaultThemeType?: ThemeType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultThemeType = defaultTheme,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(defaultThemeType);
  const [themeConfig, setThemeConfig] = useState(() =>
    getThemeConfig(defaultThemeType)
  );

  // 應用主題到CSS變量
  const applyTheme = (theme: ThemeType) => {
    const config = getThemeConfig(theme);
    const root = document.documentElement;

    // 應用顏色變量
    Object.entries(config.colors).forEach(([key, value]) => {
      const cssVarName = `--color-${key
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });

    // 應用其他主題屬性
    if (config.borderRadius) {
      Object.entries(config.borderRadius).forEach(([key, value]) => {
        const cssVarName = `--border-radius-${key}`;
        root.style.setProperty(cssVarName, value);
      });
    }

    if (config.shadows) {
      Object.entries(config.shadows).forEach(([key, value]) => {
        const cssVarName = `--shadow-${key}`;
        root.style.setProperty(cssVarName, value);
      });
    }

    if (config.spacing) {
      Object.entries(config.spacing).forEach(([key, value]) => {
        const cssVarName = `--spacing-${key}`;
        root.style.setProperty(cssVarName, value);
      });
    }

    if (config.typography) {
      Object.entries(config.typography.fontSize).forEach(([key, value]) => {
        const cssVarName = `--font-size-${key}`;
        root.style.setProperty(cssVarName, value);
      });

      Object.entries(config.typography.lineHeight).forEach(([key, value]) => {
        const cssVarName = `--line-height-${key}`;
        root.style.setProperty(cssVarName, value.toString());
      });
    }

    // 設置主題類名到 html
    document.documentElement.className = `${theme}-theme`;
  };

  // 設置主題
  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
    setThemeConfig(getThemeConfig(theme));
    applyTheme(theme);

    // 保存到localStorage
    localStorage.setItem("theme", theme);
  };

  // 切換主題 (在dark和light之间切换)
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // 初始化主題
  useEffect(() => {
    // 從localStorage讀取保存的主題
    const savedTheme = localStorage.getItem("theme") as ThemeType;
    if (savedTheme && getThemeConfig(savedTheme)) {
      setTheme(savedTheme);
    } else {
      // 檢查系統偏好
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const systemTheme = prefersDark ? "dark" : defaultTheme;
      setTheme(systemTheme);
    }
  }, []);

  // 監聽系統主題變化
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在沒有手動設置主題時才跟隨系統
      if (!localStorage.getItem("theme")) {
        const systemTheme = e.matches ? "dark" : defaultTheme;
        setTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    themeConfig,
    setTheme,
    toggleTheme,
    isDark: currentTheme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// 使用主題的Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// 導出上下文
export { ThemeContext };
