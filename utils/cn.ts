import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string.
 * 
 * This function takes any number of class name values, processes them using `clsx`,
 * and then merges them using `twMerge` to ensure Tailwind CSS classes are correctly combined.
 *
 * @param {...ClassValue[]} inputs An array of class name values which can be strings, objects, arrays, etc.
 * @returns {string} A single string containing the combined class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}