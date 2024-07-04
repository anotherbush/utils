type CreateTreeSelectOptionsInput = { id: string; name: string };

export function createTreeSelectOptions<
  Tree extends CreateTreeSelectOptionsInput = CreateTreeSelectOptionsInput,
>(trees: Tree[]): TreeSelectOption<string>[] {
  if (!Array.isArray(trees) || trees.length === 0) return [];
  const trie = new Trie();
  trees.forEach((tree) => {
    const nodes: string[] = tree?.name?.split('/').filter((node) => node) || [];
    trie.add(tree.id, nodes);
  });
  return trie.toJSON();
}

type TreeSelectOption<T> = {
  id: T;
  name: string;
  siblings?: TreeSelectOption<T>[];
};

class TrieNode {
  private readonly _key: string;
  private readonly _val: string;
  readonly children = new Map<string, TrieNode>();
  constructor(key?: string, val?: string) {
    this._key = key || '';
    this._val = val || '';
  }
  public toJSON(): TreeSelectOption<string> {
    return {
      id: this._val,
      name: this._key,
      siblings:
        this.children.size === 0
          ? undefined
          : Array.from(this.children.values()).map((child) => child.toJSON()),
    };
  }
}

class Trie {
  private readonly _root = new TrieNode();
  public add(val: string, nodes: string[]) {
    const n = nodes.length;
    let cur = this._root;
    for (const [i, node] of nodes.entries()) {
      const next =
        cur.children.get(node) || new TrieNode(node, i === n - 1 ? val : node);
      !cur.children.has(node) && cur.children.set(node, next);
      cur = next;
    }
  }
  public toJSON(): TreeSelectOption<string>[] {
    return Array.from(this._root.children.values()).map((child) =>
      child.toJSON(),
    );
  }
}
