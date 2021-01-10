import { flatten } from "lodash";
import { stripStringOfAllNonAlphaCharacters } from "./strip-characters";

export function doesMatch(data: { input: string }, ...dataToQuery: string[]) {
  const flattenedData = flatten(dataToQuery.map((element) => {
    return stripStringOfAllNonAlphaCharacters(element).split(" ");
  }));

  const stringWithAllCharactersRemoved = stripStringOfAllNonAlphaCharacters(data.input);

  const query = stringWithAllCharactersRemoved.toLowerCase().trim().split(" ");
  for (let i = 0; i < flattenedData.length; i++) {
    if (query.indexOf(flattenedData[i].toLowerCase()) >= 0 ) {
      return true;
    }
  }
  return false;
}
