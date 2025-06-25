/**
 * Check if a trip date has expired
 * @param dateString - Date string in ISO format (e.g., "2025-06-14T00:00:00.000Z")
 * @returns boolean - true if the date has expired, false otherwise
 */
export const isTripDateExpired = (dateString: string): boolean => {
  if (!dateString) return false;

  try {
    const tripDate = new Date(dateString);
    const currentDate = new Date();

    // Set current date to start of day for fair comparison
    currentDate.setHours(0, 0, 0, 0);
    tripDate.setHours(0, 0, 0, 0);

    return tripDate < currentDate;
  } catch (error) {
    console.error("Error parsing trip date:", error);
    return false;
  }
};

/**
 * Format date for display
 * @param dateString - Date string in ISO format
 * @returns string - Formatted date string
 */
export const formatTripDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
