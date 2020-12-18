/**
 * Returns if all elements of arrays are valid URLs
 * @param elements Array of strings
 */
export function areAllElementsUrls(elements: string[]): boolean {
  const result = elements.map((element) => {
    try {
      new URL(element);
      return true;
    } catch (err) {
      return false;
    }
  });
  return result.every((element) => element === true);
}
