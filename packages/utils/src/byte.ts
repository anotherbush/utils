import { RoundFn } from './typings';

/**
 * @returns bytes
 */
export class Byte {
  /**
   * 1 byte = 8 bits.
   * @returns bytes
   */
  static bits(size: number, round?: RoundFn): number {
    const res = size / 8;
    return round ? round(res) : res;
  }
  /**
   * 1 byte = 8 bits.
   * @returns bits
   */
  static toBits(bytes: number, round?: RoundFn): number {
    const res = 8 * bytes;
    return round ? round(res) : res;
  }

  /**
   * 1 KB = kilobyte = 1024 bytes
   * @returns bytes
   */
  static KB(size: number, round?: RoundFn): number {
    const res = 1024 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 KB = kilobyte = 1024 bytes
   * @returns KB
   */
  static toKB(bytes: number, round?: RoundFn): number {
    const res = bytes / 1024;
    return round ? round(res) : res;
  }

  /**
   * 1 Kb = kilobits = 1024 bits / 8 bits = 128 bytes.
   * @returns bytes
   */
  static Kb(size: number, round?: RoundFn): number {
    const res = 128 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 Kb = kilobits = 1024 bits / 8 bits = 128 bytes.
   * @returns Kb
   */
  static toKb(bytes: number, round?: RoundFn): number {
    const res = bytes / 128;
    return round ? round(res) : res;
  }

  /**
   * 1 MB = megabyte = 1048576 (1024*1024) bytes.
   * @returns bytes
   */
  static MB(size: number, round?: RoundFn): number {
    const res = 1048576 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 MB = megabyte = 1048576 (1024*1024) bytes.
   * @returns MB
   */
  static toMB(bytes: number, round?: RoundFn): number {
    const res = bytes / 1048576;
    return round ? round(res) : res;
  }

  /**
   * 1 Mb = megabits = 1048576 bits / 8 bits = 131072 bytes.
   * @returns bytes
   */
  static Mb(size: number, round?: RoundFn): number {
    const res = 131072 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 Mb = megabits = 1048576 bits / 8 bits = 131072 bytes.
   * @returns Mb
   */
  static toMb(bytes: number, round?: RoundFn): number {
    const res = bytes / 131072;
    return round ? round(res) : res;
  }

  /**
   * 1 GB = gigabyte = 1073741824 (1024*1024*1024) bytes.
   * @returns bytes
   */
  static GB(size: number, round?: RoundFn): number {
    const res = 1073741824 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 GB = gigabyte = 1073741824 (1024*1024*1024) bytes.
   * @returns GB
   */
  static toGB(bytes: number, round?: RoundFn): number {
    const res = bytes / 1073741824;
    return round ? round(res) : res;
  }

  /**
   * 1 Gb = gigabits = 1073741824 bits / 8 bits = 134217728 bytes.
   * @returns bytes
   */
  static Gb(size: number, round?: RoundFn): number {
    const res = 134217728 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 Gb = gigabits = 1073741824 bits / 8 bits = 134217728 bytes.
   * @returns Gb
   */
  static toGb(bytes: number, round?: RoundFn): number {
    const res = bytes / 134217728;
    return round ? round(res) : res;
  }

  /**
   * 1 TB = terabyte = 1099511627776 (1024*1024*1024*1024) bytes.
   * @returns bytes
   */
  static TB(size: number, round?: RoundFn): number {
    const res = 1099511627776 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 TB = terabyte = 1099511627776 (1024*1024*1024*1024) bytes.
   * @returns TB
   */
  static toTB(bytes: number, round?: RoundFn): number {
    const res = bytes / 1099511627776;
    return round ? round(res) : res;
  }

  /**
   * 1 Tb = terabits = 1099511627776 bits / 8 bits = 137438953472 bytes.
   * @returns bytes
   */
  static Tb(size: number, round?: RoundFn): number {
    const res = 137438953472 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 Tb = terabits = 1099511627776 bits / 8 bits = 137438953472 bytes.
   * @returns Tb
   */
  static toTb(bytes: number, round?: RoundFn): number {
    const res = bytes / 137438953472;
    return round ? round(res) : res;
  }

  /**
   * 1 PB = petabyte = 1125899906842624 (1024*1024*1024*1024*1024) bytes.
   * @returns bytes
   */
  static PB(size: number, round?: RoundFn): number {
    const res = 1125899906842624 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 PB = petabyte = 1125899906842624 (1024*1024*1024*1024*1024) bytes.
   * @returns PB
   */
  static toPB(bytes: number, round?: RoundFn): number {
    const res = bytes / 1125899906842624;
    return round ? round(res) : res;
  }

  /**
   * 1 Pb = petabits = 1125899906842624 bits / 8 bits = 140737488355328 bytes.
   * @returns bytes
   */
  static Pb(size: number, round?: RoundFn): number {
    const res = 140737488355328 * size;
    return round ? round(res) : res;
  }
  /**
   * 1 Pb = petabits = 1125899906842624 bits / 8 bits = 140737488355328 bytes.
   * @returns Pb
   */
  static toPb(bytes: number, round?: RoundFn): number {
    const res = bytes / 140737488355328;
    return round ? round(res) : res;
  }
}
