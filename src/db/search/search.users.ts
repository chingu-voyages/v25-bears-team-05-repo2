import { UserModel } from "../../models/user/user.model";
import { IPublicUserDetails } from "./search.types";

export async function getUserSearchResults(data: { query: string}): Promise<IPublicUserDetails[]> {
  const query = { "$search": data.query };
  const users = await UserModel.find( { "$text": query });
  if (users && users.length > 0) {
    return users.map((user) => {
      return {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        jobTitle: user.jobTitle,
        avatar : Array.from(user.avatar)
      };
    });
  }
  return [];
}
