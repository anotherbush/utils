export class LRUCache<T> {
  private readonly cache = new DoubleLinkedList<T>();
  private readonly keyToNode = new Map<string, ListNode<T>>();
  private _capacity: number;

  constructor(capacity: number) {
    this._capacity = Math.max(0, capacity);
  }

  get size() {
    return this.keyToNode.size;
  }

  get capacity() {
    return this._capacity;
  }

  public has(key: string) {
    return this.keyToNode.has(key);
  }

  public get(key: string) {
    if (!this.keyToNode.has(key)) return undefined;
    this._makeNodeRecentlyUse(key);
    return this.keyToNode.get(key)?.val;
  }

  public set(key: string, val: T) {
    if (this.keyToNode.has(key)) {
      this._deleteKey(key);
      this._addRecentlyUseNode(key, val);
      return;
    }

    if (this.cache.size() === this.capacity) {
      this._removeLeastRecentlyUseNode();
    }

    this._addRecentlyUseNode(key, val);
  }

  public delete(key: string) {
    if (!this.keyToNode.has(key)) return;
    this._deleteKey(key);
  }

  /**
   * @description
   * This method might truncate the lru nodes in the current cache.
   */
  public setCapacity(capacity: number) {
    const nextCapacity = Math.max(0, capacity);

    /**
     * If the next capacity is smaller thant before
     * Truncate the LRU nodes until the size == nextCapacity
     */
    while (this.size > nextCapacity) {
      this._removeLeastRecentlyUseNode();
    }

    this._capacity = nextCapacity;
  }

  /** Private methods */

  private _makeNodeRecentlyUse(key: string) {
    const recentlyNode = this.keyToNode.get(key);
    if (recentlyNode instanceof ListNode) {
      this.cache.remove(recentlyNode);
      this.cache.pushBack(recentlyNode);
    }
  }

  private _addRecentlyUseNode(key: string, value: T) {
    const newNode = new ListNode<T>(key, value);
    this.cache.pushBack(newNode);
    this.keyToNode.set(key, newNode);
  }

  private _deleteKey(key: string) {
    const del = this.keyToNode.get(key);
    if (del instanceof ListNode) {
      this.cache.remove(del);
      this.keyToNode.delete(del.key);
    }
  }

  private _removeLeastRecentlyUseNode() {
    const lruNode = this.cache.popFront();
    if (lruNode instanceof ListNode) {
      this.keyToNode.delete(lruNode.key);
    }
  }
}

class ListNode<T> {
  readonly key: string;
  val?: T;
  prev?: ListNode<T>;
  next?: ListNode<T>;
  constructor(key?: string, val?: T) {
    this.key = key || '';
    this.val = val;
  }
}

class DoubleLinkedList<T> {
  private readonly head = new ListNode<T>();
  private readonly tail = new ListNode<T>();
  private count = 0;

  constructor() {
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  public size() {
    return this.count;
  }

  public remove(del: ListNode<T>) {
    if (this.size() === 0) return;
    del.prev && (del.prev.next = del.next);
    del.next && (del.next.prev = del.prev);
    this.count--;
  }

  public popFront(): ListNode<T> | undefined {
    if (this.head.next === this.tail) return undefined;
    const firstNode = this.head.next;
    firstNode instanceof ListNode && this.remove(firstNode);
    return firstNode;
  }

  public pushBack(move: ListNode<T>) {
    move.prev = this.tail.prev;
    move.next = this.tail;
    this.tail.prev && (this.tail.prev.next = move);
    this.tail.prev = move;
    this.count++;
  }
}
