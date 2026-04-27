/**
 * 🎨 Design Tokens - Shoofly Design System
 * Centralized styling system for consistency
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════

export const colors = {
  // Primary Brand Colors - Cyan/Turquoise (Shoofly Brand)
  primary: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Base - Primary Brand
    600: '#0891B2', // Primary hover/active
    700: '#0E7490', // Primary dark
    800: '#155E76',
    900: '#164E63',
  },

  // Secondary/Accent - Indigo
  secondary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Base - Accent
    600: '#4F46E5', // Secondary hover/active
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Base
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#145231',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Base
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Base
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Neutral/Grayscale - Slate-based for modern feel
  neutral: {
    50: '#F8FAFC',    // Page BG
    100: '#F1F5F9',    // Soft Section BG
    200: '#E2E8F0',    // Border
    300: '#CBD5E1',
    400: '#94A3B8',    // Text Muted
    500: '#64748B',    // Base
    600: '#475569',    // Text Secondary
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',    // Text Primary / Deep Navy
  },

  // Backgrounds
  background: {
    page: '#F8FAFC',
    card: '#FFFFFF',
    section: '#F1F5F9',
    subtle: '#F8FAFC',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
  },
  border: '#E2E8F0',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════════

export const typography = {
  fontFamily: {
    sans: "'Inter', 'Segoe UI', system-ui, sans-serif",
    mono: "'Fira Code', monospace",
    arabic: "'Cairo', 'Almarai', sans-serif",
  },

  fontSize: {
    // Heading scale
    h1: { size: '48px', weight: 700, lineHeight: 1.2 }, // 3rem
    h2: { size: '36px', weight: 700, lineHeight: 1.3 }, // 2.25rem
    h3: { size: '28px', weight: 600, lineHeight: 1.4 }, // 1.75rem
    h4: { size: '24px', weight: 600, lineHeight: 1.4 }, // 1.5rem
    h5: { size: '20px', weight: 600, lineHeight: 1.5 }, // 1.25rem
    h6: { size: '18px', weight: 600, lineHeight: 1.5 }, // 1.125rem

    // Body text
    body: { size: '16px', weight: 400, lineHeight: 1.5 }, // 1rem
    bodySmall: { size: '14px', weight: 400, lineHeight: 1.5 }, // 0.875rem
    bodyTiny: { size: '12px', weight: 400, lineHeight: 1.5 }, // 0.75rem

    // Special text
    label: { size: '14px', weight: 500, lineHeight: 1.4 },
    caption: { size: '12px', weight: 500, lineHeight: 1.4 },
    button: { size: '14px', weight: 600, lineHeight: 1.2 },
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.02em',
    wider: '0.05em',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📏 SPACING & SIZING
// ═══════════════════════════════════════════════════════════════════════════════

export const spacing = {
  // 8px base unit system
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 💫 SHADOWS
// ═══════════════════════════════════════════════════════════════════════════════

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ ANIMATIONS & TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const animations = {
  // Duration
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common transitions
  transitions: {
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 Z-INDEX SCALE
// ═══════════════════════════════════════════════════════════════════════════════

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📱 BREAKPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const breakpoints = {
  mobile: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 COMPONENT PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const components = {
  // Button variants
  buttons: {
    primary: {
      bg: colors.primary[500],
      text: colors.white,
      hover: colors.primary[600],
      active: colors.primary[700],
    },
    secondary: {
      bg: colors.secondary[500],
      text: colors.white,
      hover: colors.secondary[600],
      active: colors.secondary[700],
    },
    outline: {
      bg: colors.white,
      text: colors.primary[600],
      border: colors.primary[500],
      hover: colors.primary[50],
    },
    ghost: {
      bg: 'transparent',
      text: colors.neutral[600],
      hover: colors.neutral[100],
    },
    danger: {
      bg: colors.danger[500],
      text: colors.white,
      hover: colors.danger[600],
      active: colors.danger[700],
    },
  },

  // Input styles
  input: {
    bg: colors.white,
    border: colors.neutral[200],
    text: colors.neutral[900],
    placeholder: colors.neutral[400],
    focus: colors.primary[500],
  },

  // Card styles
  card: {
    bg: colors.white,
    border: colors.neutral[200],
    shadow: shadows.base,
    radius: borderRadius['2xl'],
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  zIndex,
  breakpoints,
  components,
};
