import { ObjectType } from './typings';

export function toSorted<T = any>(val: T): T {
  if (typeof val !== 'object' || val === null) {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((sub) => toSorted(sub)).sort() as T;
  }
  const valRef: ObjectType = val as ObjectType;
  return Object.keys(valRef)
    .sort((a, b) => (a < b ? -1 : 1))
    .reduce((sorted, key) => {
      sorted[key] = toSorted(valRef[key]);
      return sorted;
    }, {} as ObjectType) as T;
}
