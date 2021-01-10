export function stripStringOfAllNonAlphaCharacters(input: string) {
  if (input) {
    return input.replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ");
  }

  return "";
}
