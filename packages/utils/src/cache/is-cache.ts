import { ValidKey } from '../typings';
import { Cache } from './typings';

export function isCache<Key extends ValidKey = ValidKey, Val = any>(
  val: any
): val is Cache<Key, Val> {
  if (typeof val !== 'object' || Array.isArray(val)) return false;

  const valRef: Partial<Cache> = val;

  return (
    typeof valRef?.capacity === 'number' &&
    typeof valRef?.size === 'number' &&
    typeof valRef?.delete === 'function' &&
    typeof valRef?.get === 'function' &&
    typeof valRef?.has === 'function' &&
    typeof valRef?.set === 'function' &&
    typeof valRef?.setCapacity === 'function'
  );
}
