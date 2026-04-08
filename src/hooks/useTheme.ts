/**
 * 主題相關的自定義Hook
 */
import { useTheme as useThemeContext } from '../contexts/ThemeContext'

// 基礎主題Hook
export const useTheme = useThemeContext

// 主題顏色Hook
export const useThemeColors = () => {
  const { themeConfig } = useTheme()
  return themeConfig.colors
}

// 主題樣式Hook
export const useThemeStyles = () => {
  const { themeConfig } = useTheme()
  return {
    colors: themeConfig.colors,
    borderRadius: themeConfig.borderRadius,
    shadows: themeConfig.shadows,
    spacing: themeConfig.spacing,
    typography: themeConfig.typography,
  }
}

// 主題切換Hook
export const useThemeToggle = () => {
  const { currentTheme, setTheme, toggleTheme } = useTheme()
  
  return {
    currentTheme,
    setTheme,
    toggleTheme,
    isLight: currentTheme === 'light',
    isDark: currentTheme === 'dark',
    isBlue: currentTheme === 'blue',
    isGreen: currentTheme === 'green',
    isPurple: currentTheme === 'purple',
  }
}

// 主題CSS變量Hook
export const useThemeCSSVars = () => {
  const { themeConfig } = useTheme()
  
  const cssVars = {
    // 顏色變量
    '--color-primary': themeConfig.colors.primary,
    '--color-primary-hover': themeConfig.colors.primaryHover,
    '--color-primary-active': themeConfig.colors.primaryActive,
    '--color-success': themeConfig.colors.success,
    '--color-success-hover': themeConfig.colors.successHover,
    '--color-success-active': themeConfig.colors.successActive,
    '--color-warning': themeConfig.colors.warning,
    '--color-warning-hover': themeConfig.colors.warningHover,
    '--color-warning-active': themeConfig.colors.warningActive,
    '--color-error': themeConfig.colors.error,
    '--color-error-hover': themeConfig.colors.errorHover,
    '--color-error-active': themeConfig.colors.errorActive,
    '--color-text-primary': themeConfig.colors.textPrimary,
    '--color-text-regular': themeConfig.colors.textRegular,
    '--color-text-secondary': themeConfig.colors.textSecondary,
    '--color-text-disabled': themeConfig.colors.textDisabled,
    '--color-background': themeConfig.colors.background,
    '--color-background-container': themeConfig.colors.backgroundContainer,
    '--color-background-page': themeConfig.colors.backgroundPage,
    '--color-background-overlay': themeConfig.colors.backgroundOverlay,
    '--color-border-light': themeConfig.colors.borderLight,
    '--color-border-base': themeConfig.colors.borderBase,
    '--color-border-dark': themeConfig.colors.borderDark,
    '--color-gradient-1': themeConfig.colors.gradient1,
    '--color-gradient-2': themeConfig.colors.gradient2,
    '--color-gradient-3': themeConfig.colors.gradient3,
    '--color-gradient-4': themeConfig.colors.gradient4,
    '--color-gradient-5': themeConfig.colors.gradient5,
    
    // 其他樣式變量
    ...(themeConfig.borderRadius && {
      '--border-radius-small': themeConfig.borderRadius.small,
      '--border-radius-medium': themeConfig.borderRadius.medium,
      '--border-radius-large': themeConfig.borderRadius.large,
      '--border-radius-circle': themeConfig.borderRadius.circle,
    }),
    
    ...(themeConfig.shadows && {
      '--shadow-light': themeConfig.shadows.light,
      '--shadow-medium': themeConfig.shadows.medium,
      '--shadow-heavy': themeConfig.shadows.heavy,
    }),
    
    ...(themeConfig.spacing && {
      '--spacing-mini': themeConfig.spacing.mini,
      '--spacing-small': themeConfig.spacing.small,
      '--spacing-medium': themeConfig.spacing.medium,
      '--spacing-large': themeConfig.spacing.large,
      '--spacing-xl': themeConfig.spacing.xl,
    }),
    
    ...(themeConfig.typography && {
      '--font-size-mini': themeConfig.typography.fontSize.mini,
      '--font-size-small': themeConfig.typography.fontSize.small,
      '--font-size-medium': themeConfig.typography.fontSize.medium,
      '--font-size-large': themeConfig.typography.fontSize.large,
      '--font-size-xl': themeConfig.typography.fontSize.xl,
      '--font-size-xxl': themeConfig.typography.fontSize.xxl,
      '--line-height-base': themeConfig.typography.lineHeight.base.toString(),
      '--line-height-heading': themeConfig.typography.lineHeight.heading.toString(),
    }),
  }
  
  return cssVars
}

// 主題類名Hook
export const useThemeClassName = () => {
  const { currentTheme } = useTheme()
  return `theme-${currentTheme}`
}

// 主題檢測Hook
export const useThemeDetection = () => {
  const { currentTheme } = useTheme()
  
  return {
    isLight: currentTheme === 'light',
    isDark: currentTheme === 'dark',
    isBlue: currentTheme === 'blue',
    isGreen: currentTheme === 'green',
    isPurple: currentTheme === 'purple',
    themeType: currentTheme,
  }
}
