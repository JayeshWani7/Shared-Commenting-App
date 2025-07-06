// Toast utility to work with our custom toast context
let addToastFunction: ((message: string, type: 'success' | 'error' | 'info' | 'loading', duration?: number) => void) | null = null;

export const setToastFunction = (fn: (message: string, type: 'success' | 'error' | 'info' | 'loading', duration?: number) => void) => {
  addToastFunction = fn;
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
  dismiss: () => {
    // Optional: implement dismiss functionality if needed
  },
};

export default toast;
