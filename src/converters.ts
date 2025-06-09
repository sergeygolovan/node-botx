export function optionalSequenceToList<TItem>(
  optionalSequence?: ReadonlyArray<TItem> | null
): TItem[] {
  return optionalSequence ? [...optionalSequence] : [];
}
