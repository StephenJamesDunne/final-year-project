export const isClient = typeof window !== 'undefined';

export function waitForHydration(): Promise<void> {
  return new Promise((resolve) => {
    if (isClient) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    } else {
      resolve();
    }
  });
}

export function safeLocalStorage() {
  if (!isClient) {
    return {
      getItem: () => null,
      setItem: () => { },
      removeItem: () => { },
    };
  }
  return window.localStorage;
}