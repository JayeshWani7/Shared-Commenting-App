// Toast utility to work with our custom toast context
let addToastFunction: ((message: string, type: 'success' | 'error' | 'info' | 'loading' | 'notification', duration?: number) => void) | null = null;

export const setToastFunction = (fn: (message: string, type: 'success' | 'error' | 'info' | 'loading' | 'notification', duration?: number) => void) => {
  addToastFunction = fn;
};

// Function to play notification sound
const playNotificationSound = () => {
  if (typeof window !== 'undefined' && 'Audio' in window) {
    try {
      // Create a simple beep sound programmatically
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }
};

// Re-export toast functions
export const toast = {
  success: (message: string, duration?: number) => {
    if (addToastFunction) {
      addToastFunction(message, 'success', duration);
    } else {
      console.log('✅', message);
    }
  },
  error: (message: string, duration?: number) => {
    if (addToastFunction) {
      addToastFunction(message, 'error', duration);
    } else {
      console.error('❌', message);
    }
  },
  loading: (message: string, duration?: number) => {
    if (addToastFunction) {
      addToastFunction(message, 'loading', duration);
    } else {
      console.log('⏳', message);
    }
  },
  info: (message: string, duration?: number) => {
    if (addToastFunction) {
      addToastFunction(message, 'info', duration);
    } else {
      console.log('ℹ️', message);
    }
  },
  notification: (message: string, duration?: number) => {
    playNotificationSound();
    if (addToastFunction) {
      addToastFunction(message, 'notification', duration);
    } else {
      console.log('🔔', message);
    }
  },
  dismiss: () => {
    // Optional: implement dismiss functionality if needed
  },
};

export default toast;
