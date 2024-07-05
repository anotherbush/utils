/**
 * @description
 * 統一編號邏輯檢查
 *
 * @see https://www.fia.gov.tw/singlehtml/3?cntId=c4d9cff38c8642ef8872774ee9987283
 */
export const isTWBusinessId = (value?: string): value is string => {
  if (typeof value !== 'string') return false;
  if (!/^[0-9]{8}$/.test(value)) return false;

  function calcDigit(a: number, b: number) {
    function calcD(c: number) {
      if (c > 9) {
        const stringC = String(c);

        return calcD(Number(stringC[0]) + Number(stringC[1]));
      }
      return c;
    }
    return calcD(a * b);
  }

  const sumString = Array.from('12121241').reduce((result, digit, index) => {
    return result + calcDigit(Number(digit), Number(value[index]));
  }, '');

  const total = (input: string) =>
    Array.from(input).reduce((t, d) => t + Number(d), 0);

  const egeCase = value[6] === '7';

  if (!egeCase) return total(sumString) % 5 === 0;

  return ['0', '1']
    .map((f) => `${sumString.slice(0, 6)}${f}${sumString.slice(7)}`)
    .some((s) => total(s) % 5 === 0);
};
