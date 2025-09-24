import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function for conditionally joining class names together.
 * It uses `clsx` to join the class names and `tailwind-merge` to merge
 * Tailwind CSS classes without conflicts.
 * @param {...ClassValue[]} inputs - The class names to join.
 * @returns {string} The merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
