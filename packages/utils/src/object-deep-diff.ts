import { isEqual } from 'lodash';
import { ObjectType } from './typings';

export function objectDeepDiff<T extends ObjectType>(obj1: T, obj2: T) {
  return Object.keys(obj1)
    .reduce(
      (result, key: keyof T) => {
        if (key in obj2 === false) {
          result.push(key);
        } else if (isEqual(obj1[key], obj2[key])) {
          const resultKeyIndex = result.indexOf(key);
          result.splice(resultKeyIndex, 1);
        }
        return result;
      },
      Object.keys(obj2) as (keyof T)[],
    )
    .reduce((diff, diffKey) => {
      diff[diffKey] = obj2[diffKey];
      return diff;
    }, {} as Partial<T>);
}
