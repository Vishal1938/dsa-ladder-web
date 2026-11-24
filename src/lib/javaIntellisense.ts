// Lightweight Java completions for the editor (no language server) and compile-error markers.
import { monaco } from "./monaco";
import type { Diagnostic } from "../api/types";

const { CompletionItemKind: Kind, CompletionItemInsertTextRule: Rule } = monaco.languages;

interface Member { name: string; params: string | null; returns: string; doc: string }

/** Each line is `name(params): returns | description`; no parentheses means a field. */
function members(text: string): Member[] {
  return text.trim().split("\n").map(line => {
    const [sig, doc] = line.split(" | ");
    const m = /^\s*(\w+)(\(.*\))?: (.+)$/.exec(sig)!;
    return { name: m[1], params: m[2] ?? null, returns: m[3], doc };
  });
}

const COLLECTION = members(`
  size(): int | Number of elements
  isEmpty(): boolean | True if there are no elements
  contains(Object o): boolean | True if the element is present
  clear(): void | Removes every element
  iterator(): Iterator<E> | Iterator over the elements
  stream(): Stream<E> | Stream of the elements
`);
const MAP = members(`
  put(K key, V value): V | Stores a value, returning the previous one or null
  get(Object key): V | Value for the key, or null
  getOrDefault(Object key, V defaultValue): V | Value for the key, or the default
  containsKey(Object key): boolean | True if the key is present
  containsValue(Object value): boolean | True if some key has this value
  remove(Object key): V | Removes the key, returning its value
  merge(K key, V value, BiFunction remap): V | Combines with the existing value, e.g. Integer::sum
  putIfAbsent(K key, V value): V | Stores only if the key is missing
  computeIfAbsent(K key, Function mapping): V | Creates the value if the key is missing
  computeIfPresent(K key, BiFunction remap): V | Updates the value if the key is present
  keySet(): Set<K> | All keys
  values(): Collection<V> | All values
  entrySet(): Set<Map.Entry<K, V>> | All key-value pairs
  size(): int | Number of entries
  isEmpty(): boolean | True if there are no entries
  clear(): void | Removes every entry
`);
const TREE_MAP = [...members(`
  firstKey(): K | Smallest key
  lastKey(): K | Largest key
  floorKey(K key): K | Largest key <= the given key, or null
  ceilingKey(K key): K | Smallest key >= the given key, or null
  lowerKey(K key): K | Largest key < the given key, or null
  higherKey(K key): K | Smallest key > the given key, or null
  firstEntry(): Map.Entry<K, V> | Entry with the smallest key
  lastEntry(): Map.Entry<K, V> | Entry with the largest key
  floorEntry(K key): Map.Entry<K, V> | Entry with the largest key <= the given key
  ceilingEntry(K key): Map.Entry<K, V> | Entry with the smallest key >= the given key
  pollFirstEntry(): Map.Entry<K, V> | Removes and returns the smallest entry
  pollLastEntry(): Map.Entry<K, V> | Removes and returns the largest entry
  headMap(K toKey): SortedMap<K, V> | View of keys below toKey
  tailMap(K fromKey): SortedMap<K, V> | View of keys from fromKey up
`), ...MAP];
const SET = [...members(`
  add(E e): boolean | Adds the element; false if it was already present
  remove(Object o): boolean | Removes the element
  addAll(Collection c): boolean | Adds every element (union)
  retainAll(Collection c): boolean | Keeps only shared elements (intersection)
  removeAll(Collection c): boolean | Removes every given element (difference)
`), ...COLLECTION];
const TREE_SET = [...members(`
  first(): E | Smallest element
  last(): E | Largest element
  floor(E e): E | Largest element <= e, or null
  ceiling(E e): E | Smallest element >= e, or null
  lower(E e): E | Largest element < e, or null
  higher(E e): E | Smallest element > e, or null
  pollFirst(): E | Removes and returns the smallest element
  pollLast(): E | Removes and returns the largest element
`), ...SET];
const LIST = [...members(`
  add(E e): boolean | Appends an element
  get(int index): E | Element at the index
  set(int index, E e): E | Replaces the element, returning the old one
  remove(int index): E | Removes the element at the index
  indexOf(Object o): int | First index of the element, or -1
  lastIndexOf(Object o): int | Last index of the element, or -1
  addAll(Collection c): boolean | Appends every element
  subList(int from, int to): List<E> | View of [from, to)
  sort(Comparator c): void | Sorts in place; null means natural order
  toArray(T[] a): T[] | Copies into an array
`), ...COLLECTION];
const QUEUE = [...members(`
  offer(E e): boolean | Adds to the queue
  poll(): E | Removes and returns the head, or null
  peek(): E | Returns the head, or null
  add(E e): boolean | Adds to the queue
  remove(): E | Removes and returns the head; throws if empty
`), ...COLLECTION];
const DEQUE = [...members(`
  push(E e): void | Pushes onto the front (stack)
  pop(): E | Removes and returns the front; throws if empty
  addFirst(E e): void | Adds at the front
  addLast(E e): void | Adds at the back
  offerFirst(E e): boolean | Adds at the front
  offerLast(E e): boolean | Adds at the back
  pollFirst(): E | Removes and returns the front, or null
  pollLast(): E | Removes and returns the back, or null
  peekFirst(): E | Returns the front, or null
  peekLast(): E | Returns the back, or null
  removeFirst(): E | Removes the front; throws if empty
  removeLast(): E | Removes the back; throws if empty
`), ...QUEUE];
const STACK = [...members(`
  push(E e): E | Pushes onto the top
  pop(): E | Removes and returns the top; throws if empty
  peek(): E | Returns the top; throws if empty
  empty(): boolean | True if the stack is empty
  search(Object o): int | 1-based distance from the top, or -1
`), ...LIST];
const STRING = members(`
  length(): int | Number of characters
  charAt(int index): char | Character at the index
  substring(int begin, int end): String | Characters in [begin, end)
  indexOf(String s): int | First index, or -1
  lastIndexOf(String s): int | Last index, or -1
  equals(Object o): boolean | True if the text is the same
  equalsIgnoreCase(String s): boolean | Equality ignoring case
  toCharArray(): char[] | Copies into a char array
  chars(): IntStream | Stream of the characters
  split(String regex): String[] | Splits around matches
  contains(CharSequence s): boolean | True if it contains the text
  startsWith(String prefix): boolean | True if it starts with the prefix
  endsWith(String suffix): boolean | True if it ends with the suffix
  toLowerCase(): String | Lower-case copy
  toUpperCase(): String | Upper-case copy
  trim(): String | Copy without surrounding whitespace
  strip(): String | Copy without surrounding Unicode whitespace
  replace(CharSequence from, CharSequence to): String | Replaces every occurrence
  compareTo(String s): int | Lexicographic comparison
  repeat(int times): String | Repeats the text
  isEmpty(): boolean | True if the length is 0
  isBlank(): boolean | True if empty or only whitespace
  hashCode(): int | Hash code
`);
const STRING_BUILDER = members(`
  append(Object value): StringBuilder | Appends text
  toString(): String | The built text
  length(): int | Number of characters
  charAt(int index): char | Character at the index
  reverse(): StringBuilder | Reverses in place
  insert(int offset, Object value): StringBuilder | Inserts text
  deleteCharAt(int index): StringBuilder | Removes one character
  delete(int start, int end): StringBuilder | Removes [start, end)
  setCharAt(int index, char c): void | Replaces one character
  setLength(int length): void | Truncates or pads
  indexOf(String s): int | First index, or -1
`);
const ARRAY = members(`
  length: int | Number of elements
  clone(): T[] | Shallow copy
`);
const ENTRY = members(`
  getKey(): K | The key
  getValue(): V | The value
  setValue(V value): V | Replaces the value in the map
`);
const BOXED = members(`
  intValue(): int | Value as an int
  longValue(): long | Value as a long
  doubleValue(): double | Value as a double
  equals(Object o): boolean | Value equality (do not use == on boxed numbers)
  compareTo(T other): int | Numeric comparison
`);
const ITERATOR = members(`
  hasNext(): boolean | True if there is another element
  next(): E | The next element
  remove(): void | Removes the last returned element
`);

const INSTANCE = new Map<string, Member[]>(Object.entries({
  Map: MAP, HashMap: MAP, LinkedHashMap: MAP, TreeMap: TREE_MAP, SortedMap: TREE_MAP, NavigableMap: TREE_MAP,
  Set: SET, HashSet: SET, LinkedHashSet: SET, TreeSet: TREE_SET, SortedSet: TREE_SET, NavigableSet: TREE_SET,
  List: LIST, ArrayList: LIST, LinkedList: [...LIST, ...DEQUE], Collection: SET,
  Deque: DEQUE, ArrayDeque: DEQUE, Queue: QUEUE, PriorityQueue: QUEUE, Stack: STACK,
  String: STRING, StringBuilder: STRING_BUILDER, "Map.Entry": ENTRY, Entry: ENTRY,
  Integer: BOXED, Long: BOXED, Double: BOXED, Iterator: ITERATOR,
}));

const boxedStatics = (type: string, prim: string, parse: string) => members(`
  MAX_VALUE: ${prim} | ${type === "Double" ? "Largest" : "Maximum"} ${prim}
  MIN_VALUE: ${prim} | ${type === "Double" ? "Smallest positive" : "Minimum"} ${prim}
  ${parse}(String s): ${prim} | Parses text
  valueOf(${prim} value): ${type} | Boxes a value
  toString(${prim} value): String | Decimal text
  compare(${prim} a, ${prim} b): int | Overflow-safe comparison
  max(${prim} a, ${prim} b): ${prim} | Larger value
  min(${prim} a, ${prim} b): ${prim} | Smaller value
  sum(${prim} a, ${prim} b): ${prim} | Sum, handy for merge
`);
const bitStatics = (prim: string) => members(`
  bitCount(${prim} value): int | Number of 1 bits
  toBinaryString(${prim} value): String | Binary text
  highestOneBit(${prim} value): ${prim} | Highest 1 bit only
  lowestOneBit(${prim} value): ${prim} | Lowest 1 bit only
  numberOfLeadingZeros(${prim} value): int | Zeros before the highest 1 bit
  numberOfTrailingZeros(${prim} value): int | Zeros after the lowest 1 bit
`);
const collectionStatics = (type: string) => members(`
  of(E... elements): ${type}<E> | Immutable ${type} of the elements
  copyOf(Collection c): ${type}<E> | Immutable copy
`);

const STATIC = new Map<string, Member[]>(Object.entries({
  Math: members(`
    abs(int a): int | Absolute value
    max(int a, int b): int | Larger value
    min(int a, int b): int | Smaller value
    pow(double a, double b): double | a to the power b
    sqrt(double a): double | Square root
    cbrt(double a): double | Cube root
    floorMod(int a, int b): int | Remainder with the divisor's sign
    floorDiv(int a, int b): int | Division rounding down
    floor(double a): double | Rounds down
    ceil(double a): double | Rounds up
    round(double a): long | Rounds to nearest
    log(double a): double | Natural logarithm
    log10(double a): double | Base-10 logarithm
    addExact(int a, int b): int | Sum that throws on overflow
    multiplyExact(int a, int b): int | Product that throws on overflow
    random(): double | Random value in [0, 1)
    PI: double | The constant pi
  `),
  Arrays: members(`
    sort(T[] a): void | Sorts in place
    fill(T[] a, T value): void | Sets every element
    asList(T... a): List<T> | Fixed-size list view
    copyOf(T[] a, int length): T[] | Copy, truncated or padded
    copyOfRange(T[] a, int from, int to): T[] | Copy of [from, to)
    toString(T[] a): String | Printable text
    deepToString(Object[] a): String | Printable text of nested arrays
    binarySearch(T[] a, T key): int | Index in a sorted array, or -(insertion point) - 1
    equals(T[] a, T[] b): boolean | Element-wise equality
    hashCode(T[] a): int | Hash of the contents
    stream(T[] a): Stream<T> | Stream of the elements
  `),
  Collections: members(`
    sort(List list): void | Sorts in place
    reverse(List list): void | Reverses in place
    reverseOrder(): Comparator | Descending comparator
    max(Collection c): T | Largest element
    min(Collection c): T | Smallest element
    swap(List list, int i, int j): void | Swaps two elements
    frequency(Collection c, Object o): int | Number of occurrences
    addAll(Collection c, T... elements): boolean | Adds every element
    unmodifiableList(List list): List<T> | Read-only view
    emptyList(): List<T> | Immutable empty list
  `),
  Integer: [...boxedStatics("Integer", "int", "parseInt"), ...bitStatics("int")],
  Long: [...boxedStatics("Long", "long", "parseLong"), ...bitStatics("long")],
  Double: boxedStatics("Double", "double", "parseDouble"),
  Character: members(`
    isDigit(char c): boolean | True for a digit
    isLetter(char c): boolean | True for a letter
    isLetterOrDigit(char c): boolean | True for a letter or digit
    isUpperCase(char c): boolean | True for upper case
    isLowerCase(char c): boolean | True for lower case
    isWhitespace(char c): boolean | True for whitespace
    toLowerCase(char c): char | Lower-case character
    toUpperCase(char c): char | Upper-case character
    getNumericValue(char c): int | Digit value
    valueOf(char c): Character | Boxes a value
  `),
  String: members(`
    valueOf(Object value): String | Text of a value or char[]
    join(CharSequence delimiter, Iterable parts): String | Joins with a delimiter
    format(String format, Object... args): String | Formatted text
  `),
  System: members(`
    out: PrintStream | Standard output
    arraycopy(Object src, int srcPos, Object dest, int destPos, int length): void | Copies part of an array
    nanoTime(): long | High-resolution timer
    currentTimeMillis(): long | Wall-clock time
  `),
  Map: members(`
    Entry: interface | A key-value pair
    entry(K key, V value): Map.Entry<K, V> | Immutable entry
    of(K key, V value): Map<K, V> | Immutable map
    copyOf(Map map): Map<K, V> | Immutable copy
  `),
  List: collectionStatics("List"),
  Set: collectionStatics("Set"),
  out: members(`
    println(Object value): void | Prints a line
    print(Object value): void | Prints without a newline
    printf(String format, Object... args): void | Prints formatted text
  `),
}));

const SNIPPETS: [label: string, body: string, doc: string][] = [
  ["fori", "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}", "Index loop"],
  ["forr", "for (int ${1:i} = ${2:n} - 1; ${1:i} >= 0; ${1:i}--) {\n\t$0\n}", "Reverse index loop"],
  ["foreach", "for (${1:int} ${2:x} : ${3:nums}) {\n\t$0\n}", "For-each loop"],
  ["while", "while (${1:condition}) {\n\t$0\n}", "While loop"],
  ["if", "if (${1:condition}) {\n\t$0\n}", "If"],
  ["ifelse", "if (${1:condition}) {\n\t$2\n} else {\n\t$0\n}", "If / else"],
  ["sout", "System.out.println($1);", "Print a line"],
  ["map", "Map<${1:Integer}, ${2:Integer}> ${3:map} = new HashMap<>();", "New HashMap"],
  ["set", "Set<${1:Integer}> ${2:set} = new HashSet<>();", "New HashSet"],
  ["list", "List<${1:Integer}> ${2:list} = new ArrayList<>();", "New ArrayList"],
  ["deque", "Deque<${1:Integer}> ${2:deque} = new ArrayDeque<>();", "New ArrayDeque"],
  ["pq", "PriorityQueue<${1:Integer}> ${2:heap} = new PriorityQueue<>();", "Min-heap"],
  ["pqmax", "PriorityQueue<${1:Integer}> ${2:heap} = new PriorityQueue<>(Collections.reverseOrder());", "Max-heap"],
  ["sb", "StringBuilder ${1:sb} = new StringBuilder();", "New StringBuilder"],
  ["arr", "int[] ${1:arr} = new int[${2:n}];", "New array"],
  ["arr2", "int[][] ${1:grid} = new int[${2:rows}][${3:cols}];", "New 2D array"],
  ["entry", "for (Map.Entry<${1:Integer}, ${2:Integer}> ${3:e} : ${4:map}.entrySet()) {\n\t$0\n}", "Loop over map entries"],
];

const CLASSES = ("Map HashMap LinkedHashMap TreeMap Set HashSet LinkedHashSet TreeSet List ArrayList LinkedList Deque ArrayDeque Queue " +
  "PriorityQueue Stack Arrays Collections Collection Comparator Iterator Objects Optional Random StringJoiner BitSet Scanner").split(" ");
const LANG_CLASSES = "String StringBuilder Math Integer Long Double Character Boolean Object System".split(" ");
const KEYWORDS = ("abstract boolean break byte case catch char class continue default do double else enum extends false final finally float for if " +
  "implements import instanceof int interface long new null private protected public record return short static super switch this throw throws " +
  "true try var void while").split(" ");

const TOKEN = /\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\r\n]*|"(?:\\.|[^"\\\r\n])*"?|'(?:\\.|[^'\\\r\n])*'?/g;

/** Blanks comments and literals, keeping offsets. */
const blank = (src: string) => src.replace(TOKEN, t => t.replace(/[^\r\n]/g, " "));

/** True if `before` (the text up to the cursor) ends inside a comment or an unclosed literal. */
function inCommentOrString(before: string): boolean {
  for (const m of before.matchAll(TOKEN)) {
    if (m.index + m[0].length < before.length) continue;
    const t = m[0];
    if (t.startsWith("//")) return true;
    if (t.startsWith("/*")) return t.length < 4 || !t.endsWith("*/");
    return !/^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')$/.test(t);
  }
  return false;
}

interface Decl { name: string; type: string; offset: number }

// Generics up to three levels deep, e.g. <Integer, List<int[]>>.
const G0 = "<[^<>;(){}]*>";
const G1 = `<(?:[^<>;(){}]|${G0})*>`;
const GENERIC = `<(?:[^<>;(){}]|${G1})*>`;
const TYPE = `(?:[A-Z]\\w*(?:\\.[A-Z]\\w*)*|int|long|double|float|char|boolean|byte|short|var)(?:\\s*${GENERIC})?(?:\\s*\\[\\s*\\])*`;

/** Variables, parameters and for-each variables. `src` must be blanked. */
function declarations(src: string): Decl[] {
  const out: Decl[] = [];
  for (const m of src.matchAll(new RegExp(`(?<![\\w.])(${TYPE})(?:\\s+|(?<=[>\\]])\\s*)([a-z_]\\w*)((?:\\s*\\[\\s*\\])*)\\s*(?=[=;,:)])`, "g"))) {
    const end = m.index + m[0].length;
    let type = (m[1] + m[3]).replace(/\s+/g, " ");
    if (type === "var") type = inferVar(src.slice(end));
    out.push({ name: m[2], type, offset: m.index });
    // Further declarators: int a = 0, b = f(x, y), c;
    let depth = 0;
    for (let i = end; i < src.length && depth >= 0 && src[i] !== ";"; i++) {
      if ("([{".includes(src[i])) depth++;
      else if (")]}".includes(src[i])) depth--;
      else if (src[i] === "," && depth === 0) {
        const next = /^,\s*([a-z_]\w*)\s*(?=[=,;])/.exec(src.slice(i, i + 80));
        if (next) out.push({ name: next[1], type, offset: i });
      }
    }
  }
  return out;
}

function inferVar(rest: string): string {
  const created = new RegExp(`^=\\s*new\\s+([\\w.]+(?:\\s*${GENERIC})?(?:\\s*\\[[^\\]]*\\])*)`).exec(rest);
  if (created) return created[1].replace(/\[[^\]]*\]/g, "[]");
  return /^:\s*\w+\.entrySet\(/.test(rest) ? "Map.Entry" : "var";
}

/** The declaration closest above the cursor, so shadowed names resolve sensibly. */
function lookup(decls: Decl[], name: string, offset: number): Decl | undefined {
  const same = decls.filter(d => d.name === name);
  return same.filter(d => d.offset < offset).pop() ?? same[0];
}

function instanceMembers(type: string, indexes: number): Member[] {
  const base = type.replace(new RegExp(GENERIC, "g"), "").replace(/\s+/g, "");
  const dims = (base.match(/\[\]/g)?.length ?? 0) - indexes;
  if (dims < 0) return [];
  return dims > 0 ? ARRAY : INSTANCE.get(base.replace(/\[\]/g, "")) ?? [];
}

/** Members for text ending in `receiver.partial`; null if this is not a member access. */
function memberAccess(before: string, decls: Decl[]): Member[] | null {
  if (!/\.\s*\w*$/.test(before)) return null;
  const m = /(?<![\w.])((?:this|System)\s*\.\s*)?([A-Za-z_]\w*)((?:\s*\[[^[\]]*\])*)\s*\.\s*\w*$/.exec(before);
  if (!m) return [];
  const [, qualifier = "", name, index] = m;
  if (!qualifier.startsWith("System")) {
    const d = lookup(decls, name, before.length);
    if (d) return instanceMembers(d.type, index.match(/\[/g)?.length ?? 0);
  }
  return !index && !qualifier.startsWith("this") ? STATIC.get(name) ?? [] : [];
}

function methodNames(src: string): string[] {
  return [...src.matchAll(/[\w>\]]\s+([a-z_]\w*)\s*\([^;{}()]*\)\s*(?:throws\s+[\w\s,.]+)?\{/g)]
    .map(m => m[1]).filter(n => !KEYWORDS.includes(n));
}

type Item = monaco.languages.CompletionItem;

const memberItem = (m: Member, i: number, range: monaco.IRange): Item => ({
  label: { label: m.name, detail: m.params ?? "", description: m.returns },
  kind: m.params === null ? Kind.Field : Kind.Method,
  detail: `${m.name}${m.params ?? ""}: ${m.returns}`,
  documentation: m.doc,
  insertText: m.params === null ? m.name : m.params === "()" ? `${m.name}()` : `${m.name}($1)`,
  insertTextRules: Rule.InsertAsSnippet,
  sortText: String(i).padStart(3, "0"),
  range,
});

function generalItems(src: string, decls: Decl[], range: monaco.IRange): Item[] {
  return [
    ...decls.map((d): Item => ({ label: { label: d.name, description: d.type }, kind: Kind.Variable, insertText: d.name, sortText: `0${d.name}`, range })),
    ...methodNames(src).map((n): Item => ({ label: n, kind: Kind.Method, insertText: `${n}($1)`, insertTextRules: Rule.InsertAsSnippet, sortText: `1${n}`, range })),
    ...SNIPPETS.map(([label, body, doc], i): Item => ({
      label: { label, description: doc }, kind: Kind.Snippet, documentation: body.replace(/\$\{\d+:([^}]*)\}|\$\d/g, (_, name?: string) => name ?? ""),
      insertText: body, insertTextRules: Rule.InsertAsSnippet, sortText: `2${String(i).padStart(2, "0")}`, range,
    })),
    ...[...CLASSES, ...LANG_CLASSES].map((n, i): Item => ({
      label: { label: n, description: i < CLASSES.length ? "java.util" : "java.lang" }, kind: Kind.Class, insertText: n, sortText: `3${n}`, range,
    })),
    ...KEYWORDS.map((n): Item => ({ label: n, kind: Kind.Keyword, insertText: n, sortText: `4${n}`, range })),
  ];
}

function uniqueByLabel(items: Item[]): Item[] {
  const seen = new Set<string>();
  return items.filter(it => {
    const label = typeof it.label === "string" ? it.label : it.label.label;
    return !seen.has(label) && seen.add(label);
  });
}

let registered = false;

export function registerJavaIntellisense() {
  if (registered) return;
  registered = true;
  monaco.languages.registerCompletionItemProvider("java", {
    triggerCharacters: ["."],
    provideCompletionItems(model, position) {
      const text = model.getValue();
      const offset = model.getOffsetAt(position);
      if (inCommentOrString(text.slice(0, offset))) return { suggestions: [] };
      const src = blank(text);
      const decls = declarations(src);
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
      const found = memberAccess(src.slice(0, offset), decls);
      const items = found ? found.map((m, i) => memberItem(m, i, range)) : generalItems(src, decls, range);
      return { suggestions: uniqueByLabel(items) };
    },
  });
}

export function setCompileMarkers(model: monaco.editor.ITextModel, issues: Diagnostic[]) {
  monaco.editor.setModelMarkers(model, "javac", issues.map(d => ({
    startLineNumber: d.startLine,
    startColumn: d.startColumn,
    endLineNumber: d.endLine,
    endColumn: d.endColumn,
    severity: d.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
    message: d.message,
    source: "javac",
  })));
}
