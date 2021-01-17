import { getUserSearchResults } from "./search.users";
import { queryPrivateThreads } from "./search.threads";
import { queryPublicThreads } from "./search.threads";
import { ISearchResults } from "./search.types";
import {
  queryPrivateThreadComments,
  queryPublicThreadComments,
} from "./search.thread-comments";

/**
 *
 * @param query Will search resources to match query parameters
 */
export async function search(data: {
  queryString: string;
  requestorId: string;
}): Promise<ISearchResults> {
  data.queryString = data.queryString.trim();

  const userResults = await getUserSearchResults({
    query: data.queryString.toLowerCase().trim(),
  });
  const publicThreadResults = await queryPublicThreads({
    queryString: data.queryString,
  });
  const privateThreadResults = await queryPrivateThreads({
    requestorUserId: data.requestorId,
    queryString: data.queryString,
  });

  const publicThreadCommentResults = await queryPublicThreadComments({
    queryString: data.queryString,
  });
  const privateThreadCommentResults = await queryPrivateThreadComments({
    queryString: data.queryString,
    requestorUserId: data.requestorId,
  });

  return {
    query_string: data.queryString,
    users: userResults,
    public_threads: publicThreadResults,
    private_threads: privateThreadResults,
    public_thread_comments: publicThreadCommentResults,
    private_thread_comments: privateThreadCommentResults,
  };
}
