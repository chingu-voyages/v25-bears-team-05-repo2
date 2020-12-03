import { isAssertionExpression } from "typescript";
import assert from "assert";

/**
 * This handles limit and offset as determined by any query parameter on any array
 * @param arg an array of some type
 * @param max maximum to be returned
 * @param offset offset to start
 */
export function chunkList<T>(arg: T[], limit: number, offset: number): T[] {
  assert(limit >= 0, "limit must be 0 or greater");
  assert(offset >= 0, "offset must be 0 or greater");

  if (offset >= arg.length) {
    if (limit <= arg.length) {
      return arg.slice(arg.length - limit, arg.length);
    }
    return arg;
  }

  if (offset + limit > arg.length) {
    return arg.slice(offset, arg.length);
  }
  return arg.slice(offset, offset + limit);
}
