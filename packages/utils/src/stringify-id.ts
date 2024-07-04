import { cloneDeep } from 'lodash';
import { toSorted } from './to-sorted';

export function stringifyId(input: any): string {
  if (typeof input !== 'object') {
    return JSON.stringify(input);
  }
  const cloned = toSorted(cloneDeep(input));
  return JSON.stringify(cloned);
}
