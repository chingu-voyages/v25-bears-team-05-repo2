
/**
 * This handles limit and offset as determined by any query parameter on any array
 * @param arg an array of some type
 * @param max maximum to be returned
 * @param offset offset to start
 */
export function chunkList<T>(arg: T[], max: number, offset: number): T[] {
  // handle the default case
  if (max >= arg.length) {
    return arg;
  }

  if (offset + max > arg.length) {
    return arg.slice(offset, arg.length);
  }
  return arg.slice(offset, offset + max);
}
