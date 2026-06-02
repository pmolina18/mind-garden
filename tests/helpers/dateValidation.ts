/**
 * Date format validation logic.
 *
 * Validates that a date string conforms to ISO 8601 date format (YYYY-MM-DD).
 * The date must be a real calendar date — impossible dates like 2024-02-30
 * or 2024-13-01 are rejected.
 */

/**
 * Validates that the given string is a valid ISO 8601 date in YYYY-MM-DD format.
 *
 * Rules:
 * - Must match the pattern YYYY-MM-DD (4-digit year, 2-digit month, 2-digit day)
 * - Month must be 01–12
 * - Day must be valid for the given month and year (accounts for leap years)
 * - Non-date strings and other ISO 8601 variants (datetime, etc.) are rejected
 *
 * This mirrors the Jekyll front matter requirement: the `date` field must be YYYY-MM-DD.
 */
export function isValidDateFormat(value: string): boolean {
  // Must match exactly YYYY-MM-DD
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!regex.test(value)) {
    return false;
  }

  // Parse and verify the date is a real calendar date
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Use Date object to validate: create date and check components match
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
