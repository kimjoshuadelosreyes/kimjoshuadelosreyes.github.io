"use client";

import { usePathname } from "next/navigation";

/**
 * Section links are bare hashes on the home page and `/#hash` everywhere else.
 *
 * The nav and the footer appear on the case study pages too, so without this a
 * link there resolves to `/work/1910#about` — an anchor that does not exist on
 * that page, and clicking it does nothing at all.
 */
export function useSectionHref() {
  const onHome = usePathname() === "/";
  return (id: string) => (onHome ? `#${id}` : `/#${id}`);
}
