/**
 * 主題配置類型定義
 */

// 主題類型枚舉
export type ThemeType = 'light' | 'dark' | 'blue' | 'green' | 'purple'

// 顏色配置接口
export interface ColorConfig {
  // 主色調
  primary: string
  primaryHover: string
  primaryActive: string
  
  // 功能色
  success: string
  successHover: string
  successActive: string
  warning: string
  warningHover: string
  warningActive: string
  error: string
  errorHover: string
  errorActive: string
  
  // 文字顏色
  textPrimary: string
  textRegular: string
  textSecondary: string
  textDisabled: string
  
  // 背景色
  background: string
  backgroundContainer: string
  backgroundPage: string
  backgroundOverlay: string
  
  // 邊框色
  borderLight: string
  borderBase: string
  borderDark: string
  
  // 漸變色（用於圖表等）
  gradient1: string
  gradient2: string
  gradient3: string
  gradient4: string
  gradient5: string
}

// 主題配置接口
export interface ThemeConfig {
  name: string
  type: ThemeType
  colors: ColorConfig
  // 其他主題屬性可以在此擴展
  borderRadius?: {
    small: string
    medium: string
    large: string
    circle: string
  }
  shadows?: {
    light: string
    medium: string
    heavy: string
  }
  spacing?: {
    mini: string
    small: string
    medium: string
    large: string
    xl: string
  }
  typography?: {
    fontSize: {
      mini: string
      small: string
      medium: string
      large: string
      xl: string
      xxl: string
    }
    lineHeight: {
      base: number
      heading: number
    }
  }
}

// 主題上下文類型
export interface ThemeContextType {
  currentTheme: ThemeType
  themeConfig: ThemeConfig
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
  isDark: boolean
}
