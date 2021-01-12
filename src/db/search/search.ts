import { getUserSearchResults } from "./search.users";
import { queryPrivateThreads } from "./search.threads";
import { queryPublicThreads } from "./search.threads";
import { ISearchResults } from "./search.types";

/**
 *
 * @param query Will search resources to match query parameters
 */
export async function search(data: { queryString: string, requestorId: string }): Promise<ISearchResults> {

  const userResults =  await getUserSearchResults({ query: data.queryString.toLowerCase().trim()});
  const publicThreadResults = await queryPublicThreads({
    queryString: data.queryString });
  const privateThreadResults = await queryPrivateThreads({ requestorUserId: data.requestorId, queryString: data.queryString });

  return {
    users: userResults,
    public_threads: publicThreadResults,
    private_threads: privateThreadResults
  };
}
