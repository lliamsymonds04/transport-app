export function metersToKilometers(meters: number): number {
  const km = meters / 1000;
  return Math.round(km * 100) / 100; // Round to 2 decimal places
}
