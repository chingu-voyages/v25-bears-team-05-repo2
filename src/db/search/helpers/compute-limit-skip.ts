import { ISearchOptions } from "../search.types";

export function computeLimitAndSkip(searchOption: ISearchOptions) {
  if (!searchOption) return { limit: 20, skip: 0 };

  const { limit = 20, skip = 0 } = searchOption;
  return { limit, skip };
}
