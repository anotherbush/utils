/**
 * Generate uuid based on the timestamp.
 *
 * @format  `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
 *
 * @example
 * ```ts
 * const uid = uuid(); // 71f8ad69-ea07-4f79-b9bf-1dba4a5de626
 * ```
 */
export function uuid() {
  let d = new Date().getTime(); // Timestamp
  let d2 = performance.now() * 1000;

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16; //random number between 0 and 16

    if (d > 0) {
      // Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      // Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }

    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
