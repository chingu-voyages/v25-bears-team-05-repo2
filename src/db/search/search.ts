import { getUserSearchResults } from "./search.users";
import { queryPrivateThreads } from "./search.threads";
import { queryPublicThreads } from "./search.threads";
import { ISearchRequestParams, ISearchResults } from "./search.types";
import {
  queryPrivateThreadComments,
  queryPublicThreadComments,
} from "./search.thread-comments";
import { computeLimitAndSkip } from "./helpers/compute-limit-skip";

/**
 *
 * @param query Will search resources to match query parameters
 */
export async function search(
  data: ISearchRequestParams
): Promise<ISearchResults> {
  data.queryString = data.queryString.trim();
  const options = computeLimitAndSkip(data.options);
  const userResults = await getUserSearchResults(
    {
      query: data.queryString.toLowerCase().trim(),
    },
    options
  );

  const publicThreadResults = await queryPublicThreads(
    {
      queryString: data.queryString,
    },
    options
  );

  const privateThreadResults = await queryPrivateThreads(
    {
      requestorUserId: data.requestorId,
      queryString: data.queryString,
    },
    options
  );

  const publicThreadCommentResults = await queryPublicThreadComments(
    {
      queryString: data.queryString,
    },
    options
  );

  const privateThreadCommentResults = await queryPrivateThreadComments(
    {
      queryString: data.queryString,
      requestorUserId: data.requestorId,
    },
    options
  );

  return {
    query_string: data.queryString,
    users: userResults,
    public_threads: publicThreadResults,
    private_threads: privateThreadResults,
    public_thread_comments: publicThreadCommentResults,
    private_thread_comments: privateThreadCommentResults,
  };
}
