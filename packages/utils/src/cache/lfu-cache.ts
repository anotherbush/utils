import { ValidKey } from '../typings';
import { Cache } from './typings';

export class LFUCache<Key extends ValidKey = ValidKey, Val = any>
  implements Cache<Key, Val>
{
  private readonly _keyToVal = new Map<Key, Val>();
  private readonly _keyToFreq = new Map<Key, number>();
  private readonly _freqToKeys = new Map<number, LinkedHashSet<Key, Val>>();
  private _minFreq = 0;
  private _capacity: number;

  constructor(capacity: number) {
    this._capacity = Math.max(0, capacity);
  }

  public get size() {
    return this._keyToVal.size;
  }

  public get capacity() {
    return this._capacity;
  }

  public has(key: Key) {
    return this._keyToVal.has(key) && this._keyToFreq.has(key);
  }

  public get(key: Key) {
    if (!this.has(key)) return undefined;
    this._increaseFreq(key);
    return this._keyToVal.get(key) as Val;
  }

  public set(key: Key, val: Val): Key | undefined {
    if (this.capacity <= 0) return undefined;

    /** if key existed, then update val */
    if (this._keyToVal.has(key)) {
      this._keyToVal.set(key, val);
      this._increaseFreq(key);
      return undefined;
    }

    let removedKey: Key | undefined = undefined;
    /** if key not existed, then insert a new node */
    /** over capacity */
    if (this.capacity <= this._keyToVal.size) {
      removedKey = this._removeMinFreqKey();
    }

    this._keyToVal.set(key, val);
    this._keyToFreq.set(key, 1);
    const keyList = this._freqToKeys.get(1) || new LinkedHashSet<Key, Val>();
    keyList.add(new ListNode<Val>(key, val));
    this._freqToKeys.set(1, keyList);
    this._minFreq = 1;

    return removedKey;
  }

  public delete(key: Key): Key | undefined {
    if (!this._keyToFreq.has(key)) return undefined;

    const deleteNodeFreq = this._keyToFreq.get(key) as number;
    const deleteNodeKeyList = this._freqToKeys.get(deleteNodeFreq);
    if (deleteNodeKeyList instanceof LinkedHashSet === false) return undefined;

    deleteNodeKeyList.remove(deleteNodeKeyList.get(key));
    if (deleteNodeKeyList.isEmpty()) {
      this._freqToKeys.delete(deleteNodeFreq);
      /** !!! if the remove freq is the minFreq */
      if (deleteNodeFreq === this._minFreq) {
        this._minFreq++;
      }
    }

    this._keyToFreq.delete(key);
    this._keyToVal.delete(key);
    return key;
  }

  public setCapacity(capacity: number): Key[] {
    const nextCapacity = Math.max(0, capacity);

    const truncatedKeys: Key[] = [];

    while (this.size > nextCapacity) {
      const truncatedKey = this._removeMinFreqKey();
      if (truncatedKey !== undefined) {
        truncatedKeys.push(truncatedKey);
      }
    }

    this._capacity = nextCapacity;

    return truncatedKeys;
  }

  /** Private methods */

  private _increaseFreq(key: Key) {
    if (!this._keyToFreq.has(key) || !this._keyToVal.has(key)) return;
    const freq = this._keyToFreq.get(key) as number;
    const val = this._keyToVal.get(key) as Val;

    /** Update the KF table */
    this._keyToFreq.set(key, freq + 1);

    /** Remove old key node */
    const oldKeyList = this._freqToKeys.get(freq);
    if (oldKeyList instanceof LinkedHashSet === false) return;
    oldKeyList.remove(oldKeyList.get(key));

    /** Set new key node */
    const newKeyList =
      this._freqToKeys.get(freq + 1) || new LinkedHashSet<Key, Val>();
    newKeyList.add(new ListNode<Val>(key, val));
    this._freqToKeys.set(freq + 1, newKeyList);

    if (oldKeyList.isEmpty()) {
      this._freqToKeys.delete(freq);

      /** !!! if the remove freq is the minFreq */
      if (freq === this._minFreq) {
        this._minFreq++;
      }
    }
  }

  private _removeMinFreqKey(): Key | undefined {
    const keyList = this._freqToKeys.get(this._minFreq);
    if (keyList instanceof LinkedHashSet === false) return undefined;

    const deleteKeyNode = keyList.front();
    if (deleteKeyNode instanceof ListNode === false) return undefined;

    keyList.remove(deleteKeyNode);
    /** release sources if current keyList is empty. */
    if (keyList.isEmpty()) {
      this._freqToKeys.delete(this._minFreq);
    }

    this._keyToVal.delete(deleteKeyNode.key);
    this._keyToFreq.delete(deleteKeyNode.key);

    return deleteKeyNode.key;
  }
}

class LinkedHashSet<Key, Val> {
  private readonly head = new ListNode<Val>();
  private readonly tail = new ListNode<Val>();
  private readonly keyToNode = new Map<Key, ListNode<Val>>();
  private count = 0;

  constructor() {
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  public size() {
    return this.count;
  }

  public remove(node: ListNode<Val> | undefined): void {
    if (
      !node ||
      this.size() == 0 ||
      !this.keyToNode.has(node.key) ||
      !node.prev ||
      !node.next
    )
      return;
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.keyToNode.delete(node.key);
    this.count--;
  }

  public get(key: Key) {
    return this.keyToNode.get(key);
  }

  public add(move: ListNode<Val>) {
    if (!this.tail.prev) return;
    move.prev = this.tail.prev;
    move.next = this.tail;
    this.tail.prev.next = move;
    this.tail.prev = move;
    this.keyToNode.set(move.key, move);
    this.count++;
  }

  public isEmpty() {
    return this.count === 0;
  }

  public front() {
    if (this.head.next === this.tail) return null;
    return this.head.next;
  }

  public *iterator() {
    let cur = this.head;
    while (cur.next && cur.next !== this.tail) {
      cur = cur.next;
      yield cur;
    }
    return null;
  }
}

class ListNode<T> {
  readonly key: any;
  val?: T;
  prev?: ListNode<T>;
  next?: ListNode<T>;
  constructor(key?: any, val?: T) {
    this.key = key ?? null;
    this.val = val;
  }
}
