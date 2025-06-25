import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A simple CSV row parser that handles quoted fields.
 * It splits the row by commas, but ignores commas inside double quotes.
 * It also removes the surrounding quotes from fields and un-escapes double quotes ("").
 * @param row The CSV row string to parse.
 * @returns An array of strings representing the values in the row.
 */
export function parseCsvRow(row: string): string[] {
  if (!row) return [];
  // This regex splits by comma, but not if it's inside double quotes.
  // It works by ensuring that the comma is followed by an even number of quotes.
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  const values = row.split(regex);
  
  return values.map(value => {
    let finalValue = value.trim();
    // Un-quote if it is a quoted field
    if (finalValue.startsWith('"') && finalValue.endsWith('"')) {
      finalValue = finalValue.slice(1, -1);
    }
    // Un-escape double quotes ("") -> "
    finalValue = finalValue.replace(/""/g, '"');
    return finalValue;
  });
}
