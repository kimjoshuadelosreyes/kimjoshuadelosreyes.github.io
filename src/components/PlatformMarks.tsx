import type { PlatformMark } from "@/lib/automations";

/**
 * The platforms a workflow connects to, each as its own mark and name.
 *
 * The marks are the ones n8n shows on the node itself, copied from the library
 * by `scripts/sync-automations.cjs`. `names={false}` keeps only the marks, with
 * the names left for assistive tech.
 */
export default function PlatformMarks({ marks, names = true, label = "Platforms" }: { marks: PlatformMark[]; names?: boolean; label?: string }) {
  if (!marks.length) return null;
  return (
    <ul className={`marks${names ? "" : " marks--bare"}`} aria-label={label}>
      {marks.map((m) => (
        <li key={m.id} className="mark" title={names ? undefined : m.name}>
          <img src={`/platforms/${m.icon}`} alt="" width={16} height={16} loading="lazy" decoding="async" />
          <span className={names ? undefined : "sr-only"}>{m.name}</span>
        </li>
      ))}
    </ul>
  );
}
