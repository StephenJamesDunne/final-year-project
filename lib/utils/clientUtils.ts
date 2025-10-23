export const isClient = typeof window !== 'undefined';

export function waitForHydration(): Promise<void> {
  return new Promise((resolve) => {
    if (isClient) {
      resolve();
    } else {
      // Wait for next tick to ensure hydration
      setTimeout(resolve, 0);
    }
  });
}