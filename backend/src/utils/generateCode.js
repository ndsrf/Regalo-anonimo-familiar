import { nanoid } from 'nanoid';

export function generateGroupCode() {
  // Generate a random 8-character alphanumeric code
  return nanoid(8);
}
