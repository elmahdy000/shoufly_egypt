/**
 * Haptic Feedback Utility
 * Adds physical vibration for mobile users to make the app feel native.
 */

export const Haptics = {
  /**
   * Short, subtle vibration for a button click or tap
   */
  light: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  },

  /**
   * Success vibration pattern
   */
  success: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30]);
    }
  },

  /**
   * Error/Warning vibration pattern
   */
  error: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([100, 50, 100]);
    }
  },

  /**
   * Heavy vibration for critical notifications
   */
  heavy: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(200);
    }
  }
};
