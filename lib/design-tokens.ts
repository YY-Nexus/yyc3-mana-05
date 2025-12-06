// 设计令牌系统
export const designTokens = {
  colors: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    secondary: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f3e8ff",
      300: "#e9d5ff",
      400: "#d8b4fe",
      500: "#c084fc",
      600: "#a855f7",
      700: "#9333ea",
      800: "#7c3aed",
      900: "#581c87",
    },
    success: {
      50: "#ecfdf5",
      500: "#10b981",
      600: "#059669",
      900: "#064e3b",
    },
    warning: {
      50: "#fffbeb",
      500: "#f59e0b",
      600: "#d97706",
      900: "#78350f",
    },
    error: {
      50: "#fef2f2",
      500: "#ef4444",
      600: "#dc2626",
      900: "#7f1d1d",
    },
    info: {
      50: "#f0f9ff",
      500: "#06b6d4",
      600: "#0891b2",
      900: "#164e63",
    },
  },
  spacing: {
    xs: "0.5rem", // 8px
    sm: "1rem", // 16px
    md: "1.5rem", // 24px
    lg: "2rem", // 32px
    xl: "3rem", // 48px
    "2xl": "4rem", // 64px
    "3xl": "6rem", // 96px
  },
  typography: {
    h1: "text-4xl font-bold leading-tight",
    h2: "text-3xl font-semibold leading-tight",
    h3: "text-2xl font-semibold leading-snug",
    h4: "text-xl font-medium leading-snug",
    h5: "text-lg font-medium leading-normal",
    body: "text-base leading-relaxed",
    bodyLarge: "text-lg leading-relaxed",
    bodySmall: "text-sm leading-normal",
    caption: "text-sm text-white/70 leading-normal",
    overline: "text-xs uppercase tracking-wider font-medium",
  },
  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.5rem", // 24px
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  animation: {
    fast: "150ms ease-in-out",
    normal: "250ms ease-in-out",
    slow: "350ms ease-in-out",
  },
} as const

export type DesignTokens = typeof designTokens

// 工具函数
export const getColorValue = (color: keyof typeof designTokens.colors, shade = 500) => {
  return designTokens.colors[color][shade as keyof (typeof designTokens.colors)[typeof color]]
}

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[size]
}
