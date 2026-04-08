/**
 * 主題配置定義
 */
import { ThemeConfig, ThemeType } from '../types/theme'

// 淺色主題
export const lightTheme: ThemeConfig = {
  name: '淺色主題',
  type: 'light',
  colors: {
    // 主色調
    primary: '#165DFF',
    primaryHover: '#4080FF',
    primaryActive: '#0E42D2',
    
    // 功能色
    success: '#00B42A',
    successHover: '#23C343',
    successActive: '#009A29',
    warning: '#FF7D00',
    warningHover: '#FF9A2E',
    warningActive: '#D25F00',
    error: '#F53F3F',
    errorHover: '#F76965',
    errorActive: '#CB2634',
    
    // 文字顏色
    textPrimary: '#1D2129',
    textRegular: '#4E5969',
    textSecondary: '#86909C',
    textDisabled: '#C9CDD4',
    
    // 背景色
    background: '#FFFFFF',
    backgroundContainer: '#F7F8FA',
    backgroundPage: '#F2F3F5',
    backgroundOverlay: 'rgba(29, 33, 41, 0.6)',
    
    // 邊框色
    borderLight: '#F2F3F5',
    borderBase: '#E5E6EB',
    borderDark: '#C9CDD4',
    
    // 漸變色
    gradient1: '#165DFF',
    gradient2: '#00B42A',
    gradient3: '#FF7D00',
    gradient4: '#F53F3F',
    gradient5: '#722ED1',
  },
  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px',
    circle: '50%',
  },
  shadows: {
    light: '0 1px 2px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.15)',
    heavy: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  spacing: {
    mini: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xl: '32px',
  },
  typography: {
    fontSize: {
      mini: '12px',
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px',
      xxl: '24px',
    },
    lineHeight: {
      base: 1.5,
      heading: 1.2,
    },
  },
}

// 深色主題
export const darkTheme: ThemeConfig = {
  name: '深色主題',
  type: 'dark',
  colors: {
    // 主色調
    primary: '#4080FF',
    primaryHover: '#165DFF',
    primaryActive: '#0E42D2',
    
    // 功能色
    success: '#23C343',
    successHover: '#00B42A',
    successActive: '#009A29',
    warning: '#FF9A2E',
    warningHover: '#FF7D00',
    warningActive: '#D25F00',
    error: '#F76965',
    errorHover: '#F53F3F',
    errorActive: '#CB2634',
    
    // 文字顏色
    textPrimary: '#F7F8FA',
    textRegular: '#C9CDD4',
    textSecondary: '#86909C',
    textDisabled: '#4E5969',
    
    // 背景色
    background: '#17171A',
    backgroundContainer: '#232324',
    backgroundPage: '#2E2E30',
    backgroundOverlay: 'rgba(0, 0, 0, 0.6)',
    
    // 邊框色
    borderLight: '#2E2E30',
    borderBase: '#3C3C3F',
    borderDark: '#4E5969',
    
    // 漸變色
    gradient1: '#4080FF',
    gradient2: '#23C343',
    gradient3: '#FF9A2E',
    gradient4: '#F76965',
    gradient5: '#9F7AEA',
  },
  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px',
    circle: '50%',
  },
  shadows: {
    light: '0 1px 2px rgba(0, 0, 0, 0.3)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.4)',
    heavy: '0 4px 16px rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    mini: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xl: '32px',
  },
  typography: {
    fontSize: {
      mini: '12px',
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px',
      xxl: '24px',
    },
    lineHeight: {
      base: 1.5,
      heading: 1.2,
    },
  },
}

// 藍色主題
export const blueTheme: ThemeConfig = {
  name: '藍色主題',
  type: 'blue',
  colors: {
    // 主色調
    primary: '#1890FF',
    primaryHover: '#40A9FF',
    primaryActive: '#096DD9',
    
    // 功能色
    success: '#52C41A',
    successHover: '#73D13D',
    successActive: '#389E0D',
    warning: '#FAAD14',
    warningHover: '#FFC53D',
    warningActive: '#D48806',
    error: '#FF4D4F',
    errorHover: '#FF7875',
    errorActive: '#D9363E',
    
    // 文字顏色
    textPrimary: '#262626',
    textRegular: '#595959',
    textSecondary: '#8C8C8C',
    textDisabled: '#BFBFBF',
    
    // 背景色
    background: '#FFFFFF',
    backgroundContainer: '#F0F2F5',
    backgroundPage: '#FAFAFA',
    backgroundOverlay: 'rgba(0, 0, 0, 0.45)',
    
    // 邊框色
    borderLight: '#F0F0F0',
    borderBase: '#D9D9D9',
    borderDark: '#BFBFBF',
    
    // 漸變色
    gradient1: '#1890FF',
    gradient2: '#52C41A',
    gradient3: '#FAAD14',
    gradient4: '#FF4D4F',
    gradient5: '#722ED1',
  },
  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px',
    circle: '50%',
  },
  shadows: {
    light: '0 1px 2px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.15)',
    heavy: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  spacing: {
    mini: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xl: '32px',
  },
  typography: {
    fontSize: {
      mini: '12px',
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px',
      xxl: '24px',
    },
    lineHeight: {
      base: 1.5,
      heading: 1.2,
    },
  },
}

// 綠色主題
export const greenTheme: ThemeConfig = {
  name: '綠色主題',
  type: 'green',
  colors: {
    // 主色調
    primary: '#52C41A',
    primaryHover: '#73D13D',
    primaryActive: '#389E0D',
    
    // 功能色
    success: '#52C41A',
    successHover: '#73D13D',
    successActive: '#389E0D',
    warning: '#FAAD14',
    warningHover: '#FFC53D',
    warningActive: '#D48806',
    error: '#FF4D4F',
    errorHover: '#FF7875',
    errorActive: '#D9363E',
    
    // 文字顏色
    textPrimary: '#262626',
    textRegular: '#595959',
    textSecondary: '#8C8C8C',
    textDisabled: '#BFBFBF',
    
    // 背景色
    background: '#FFFFFF',
    backgroundContainer: '#F6FFED',
    backgroundPage: '#FAFAFA',
    backgroundOverlay: 'rgba(0, 0, 0, 0.45)',
    
    // 邊框色
    borderLight: '#F0F0F0',
    borderBase: '#D9D9D9',
    borderDark: '#BFBFBF',
    
    // 漸變色
    gradient1: '#52C41A',
    gradient2: '#73D13D',
    gradient3: '#FAAD14',
    gradient4: '#FF4D4F',
    gradient5: '#722ED1',
  },
  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px',
    circle: '50%',
  },
  shadows: {
    light: '0 1px 2px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.15)',
    heavy: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  spacing: {
    mini: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xl: '32px',
  },
  typography: {
    fontSize: {
      mini: '12px',
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px',
      xxl: '24px',
    },
    lineHeight: {
      base: 1.5,
      heading: 1.2,
    },
  },
}

// 紫色主題
export const purpleTheme: ThemeConfig = {
  name: '紫色主題',
  type: 'purple',
  colors: {
    // 主色調
    primary: '#722ED1',
    primaryHover: '#9254DE',
    primaryActive: '#531DAB',
    
    // 功能色
    success: '#52C41A',
    successHover: '#73D13D',
    successActive: '#389E0D',
    warning: '#FAAD14',
    warningHover: '#FFC53D',
    warningActive: '#D48806',
    error: '#FF4D4F',
    errorHover: '#FF7875',
    errorActive: '#D9363E',
    
    // 文字顏色
    textPrimary: '#262626',
    textRegular: '#595959',
    textSecondary: '#8C8C8C',
    textDisabled: '#BFBFBF',
    
    // 背景色
    background: '#FFFFFF',
    backgroundContainer: '#F9F0FF',
    backgroundPage: '#FAFAFA',
    backgroundOverlay: 'rgba(0, 0, 0, 0.45)',
    
    // 邊框色
    borderLight: '#F0F0F0',
    borderBase: '#D9D9D9',
    borderDark: '#BFBFBF',
    
    // 漸變色
    gradient1: '#722ED1',
    gradient2: '#9254DE',
    gradient3: '#FAAD14',
    gradient4: '#FF4D4F',
    gradient5: '#52C41A',
  },
  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px',
    circle: '50%',
  },
  shadows: {
    light: '0 1px 2px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.15)',
    heavy: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  spacing: {
    mini: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xl: '32px',
  },
  typography: {
    fontSize: {
      mini: '12px',
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px',
      xxl: '24px',
    },
    lineHeight: {
      base: 1.5,
      heading: 1.2,
    },
  },
}

// 主題映射
export const themeMap: Record<ThemeType, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
}

// 默認主題
export const defaultTheme: ThemeType = 'light'

// 獲取主題配置
export const getThemeConfig = (theme: ThemeType): ThemeConfig => {
  return themeMap[theme] || lightTheme
}

// 獲取所有可用主題
export const getAvailableThemes = (): ThemeConfig[] => {
  return Object.values(themeMap)
}
