export function isBase64(val: any): val is string {
  if (typeof val !== 'string') return false;
  const splitted = val.split(';base64,');
  if (splitted.length === 1) return _isBase64(splitted[0]);
  if (splitted.length === 2) return _isBase64(splitted[1]);
  return false;
}

function _isBase64(str: string) {
  try {
    atob(str);
    return true;
  } catch (e) {
    return false;
  }
}
