"use client";

import { useEffect } from "react";

/**
 * The density comparison switch.
 *
 * Reads `?density=tight` once on mount and tags the document element, which is
 * all the stylesheet needs to swap the spacing treatment. It renders nothing
 * and has no interface — this is a way to compare two treatments against each
 * other, not a control that belongs to the product. Remove it once one is
 * chosen; the CSS block it drives is labelled the same way.
 */
export default function Density() {
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("density");
    const root = document.documentElement;
    if (value) root.dataset.density = value;
    else delete root.dataset.density;
  }, []);

  return null;
}
