export const ZH_REGEX = /^[\u3400-\u9FBF]+$/;

export function isZH(val: any): val is string {
  if (typeof val !== 'string') return false;
  return ZH_REGEX.test(val);
}
