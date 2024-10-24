/**
 * Delays the execution of the function by the specified number of milliseconds.
 * @param ms The number of milliseconds to delay the execution.
 * @returns A promise that resolves after the specified number of milliseconds.
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
