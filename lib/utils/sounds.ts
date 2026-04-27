/**
 * Utility to play a notification sound
 */
export function playNotificationSound() {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => {
        // Browsers block autoplay sounds without user interaction
        console.warn('Autoplay sound blocked by browser:', err.message);
    });
  } catch (err) {
    console.error('Failed to play notification sound:', err);
  }
}
