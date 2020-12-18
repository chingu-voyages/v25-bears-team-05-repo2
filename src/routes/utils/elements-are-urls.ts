/**
 * Returns if all elements of arrays are valid URLs
 * @param elements Array of strings
 */
export function areAllElementsUrls(elements: string[]): boolean {
  return elements.map((element) => {
    try {
      new URL(element);
      return true;
    } catch (err) {
      return false;
    }
  }).every(element => element === true);
}
