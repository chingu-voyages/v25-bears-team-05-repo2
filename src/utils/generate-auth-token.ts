import { v4 as uuidv4 } from 'uuid';

/**
 * Quick easy method helper to return  unique id tokens
 * @returns string
 */
export function generateAuthToken () {
  return uuidv4();
}
