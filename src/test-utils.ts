/**
 * The item at `index`, failing the test with a clear message when there is none, so a test can
 * index an array under `noUncheckedIndexedAccess` without asserting the item away.
 */
export function at<T>(items: ArrayLike<T>, index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error(`no item at index ${index} (length ${items.length})`);
  return item;
}
