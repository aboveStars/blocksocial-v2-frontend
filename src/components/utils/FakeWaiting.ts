/**
 * Creates fake waiting event for seconds.
 * @param delay as seconds
 */
export const fakeWaiting = (delay: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay * 1000);
  });
};
