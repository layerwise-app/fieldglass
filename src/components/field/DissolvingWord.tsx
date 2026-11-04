/**
 * A huge word that dissolves into particles around the pointer.
 *
 * Stub: the engine replaces this implementation; keep the export and props.
 */
export function DissolvingWord({
  word,
  className
}: {
  word: string;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden>
      {word}
    </div>
  );
}
