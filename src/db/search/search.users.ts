import { UserModel } from "../../models/user/user.model";
import { computeLimitAndSkip } from "./helpers/compute-limit-skip";
import { IPublicUserDetails, ISearchOptions } from "./search.types";
export async function getUserSearchResults(
  data: { query: string },
  options: ISearchOptions
): Promise<IPublicUserDetails[]> {
  options = computeLimitAndSkip(options);
  const query = { "$search": data.query };
  const users = await UserModel.find({ "$text": query })
    .limit(options.limit)
    .skip(options.skip);
  if (users && users.length > 0) {
    return users.map((user) => {
      return {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        jobTitle: user.jobTitle,
        avatar: Array.from(user.avatar),
      };
    });
  }
  return [];
}
