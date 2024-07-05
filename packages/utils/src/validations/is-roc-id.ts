/**
 * ROC 身分證字號
 *
 * @see https://web.fg.tp.edu.tw/~anny/idtest.htm?fbclid=IwAR0pI0ymRmanb3sx2noxsfYO1UgzSBVyh3VIM-U3Sl_TaGg6ZrezNT5srwg
 *
 * @see https://www.immigration.gov.tw/5385/7445/238440/238446/247454/cp_news
 *
 * 舊式統一證號：一百十年一月一日(含)以前內政部移民署(以下簡稱移民署)核發之統一證號 (二碼英文加八碼數字，以下簡稱舊式統號)
 *
 * 新式統一證號：一百十年一月二日(含)以後移民署核發之統一證號(一碼英文加九碼數字，以下簡稱新式統號)。
 */
export function isROCId(id?: string): id is string {
  if (!id || !/[A-Z]{1}[1289ABCD]{1}\d{8}\b/.test(id)) return false;

  if (!id[1].match(/^\d{1}$/)) return isROCLegacyImmigrationId(id);

  return isROCNationId(id);
}

/**
 * ROC 國民身分證
 */
export function isROCNationId(id?: string): id is string {
  // 先用 regular expression 過濾不可能的格式
  if (!id || !/[A-Z]{1}\d{9}\b/.test(id)) return false;

  const idChToNum: Record<string, number> = {
    A: 10,
    B: 11,
    C: 12,
    D: 13,
    E: 14,
    F: 15,
    G: 16,
    H: 17,
    I: 34,
    J: 18,
    K: 19,
    L: 20,
    M: 21,
    N: 22,
    O: 35,
    P: 23,
    Q: 24,
    R: 25,
    S: 26,
    T: 27,
    U: 28,
    V: 29,
    W: 32,
    X: 30,
    Y: 31,
    Z: 33,
  };

  // (1) 英文轉成的數字, 個位數乘９再加上十位數
  const first = (() => {
    const idNum = idChToNum[id[0]];
    // 個位數 * 9
    const f = (idNum % 10) * 9;
    // 十位數
    const s = Math.floor(idNum / 10);
    return f + s;
  })();
  // (2) 各數字從左到右依次乘8、7、6、5．．．．1
  const second = id
    .slice(1)
    .split('')
    .reduce((total, numStr, index) => total + Number(numStr) * (8 - index), 0);
  // (3) 求出(1),(2)之和
  const firstSecondSum = first + second;
  // (4) 求出(3)除10後之餘數,用10減該餘數,結果就是檢查碼,若餘數為0,檢查碼就是0
  const remainder = firstSecondSum % 10;
  const code = remainder ? 10 - remainder : 0;
  // 身分證最後一個字元跟檢查碼相同才是正確的格式
  return code.toString() === id[9];
}

/**
 * @see https://www.immigration.gov.tw/5385/7445/238440/238446/247454/cp_news
 *
 * 舊式統一證號：一百十年一月一日(含)以前內政部移民署(以下簡稱移民署)核發之統一證號 (二碼英文加八碼數字，以下簡稱舊式統號)
 */
export function isROCLegacyImmigrationId(
  oldImmigrationId?: string
): oldImmigrationId is string {
  if (typeof oldImmigrationId !== 'string' || !oldImmigrationId) return false;

  let id = oldImmigrationId.trim();

  if (!id.match('^[A-Z][ABCD]\\d{8}$')) {
    return false;
  }

  const convert = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];

  id =
    String(convert.indexOf(id[0]) + 10) +
    String((convert.indexOf(id[1]) + 10) % 10) +
    id.slice(2);

  let checkSum = 0;
  for (let i = 0; i < id.length; i++) {
    const c = parseInt(id[i]);
    const w = weights[i];
    checkSum += c * w;
  }

  return checkSum % 10 == 0;
}
