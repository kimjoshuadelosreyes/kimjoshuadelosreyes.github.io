"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import type { Graph, PlatformMark, StoryStep } from "@/lib/automations";
import SkipPin from "./SkipPin";

/**
 * A workflow, drawn and walked through.
 *
 * The picture is the workflow's real node graph: the same nodes and wiring the
 * library builds into n8n, laid out by the library. A virtual camera follows the
 * workflow's own story step by step. At each step the wires into it draw, a
 * packet travels each wire, and the step's nodes light up. Then the camera pulls
 * back to show the whole thing.
 *
 * A node that is a platform's own n8n node wears that platform's mark. An AI
 * agent has its model, tools, memory and output shape hung beneath it on paler
 * wires, as n8n draws them. A large canvas keeps the library's titled sections,
 * which are named when the camera pulls back.
 *
 * ---------------------------------------------------------------------------
 * Same contract as the system flow: ONE timeline, every frame a pure function
 * of its time. `fromTo` with explicit from-states, transforms / opacity /
 * stroke only, nothing random, no repeats.
 *
 *   mode "scrub"  the frame is pinned and the scroll drives the timeline
 *   mode "auto"   the timeline plays once when the frame comes into view, and
 *                 the step dots move it to any step
 *
 * The camera is one transform on `.auto-world`, origin top-left, so a world
 * point `p` sits on screen at `x + scale * p`.
 *
 * Below lg and under reduced motion there is no camera: each step is a caption
 * over the nodes it involves, stacked, in their finished state. That branch is
 * chosen in JS, so nothing is duplicated in the DOM.
 * ---------------------------------------------------------------------------
 */

const NW = 216;
const NH = 60;
const XS = 1.34; // the library's columns are 240 apart; this gives the wires room
const PAD = 80;
const SEG = 1.6; // timeline seconds per step

const KIND: Record<string, string> = {
  trigger: "Trigger", http: "API call", code: "Code", branch: "Decision", set: "Set fields", respond: "Response", loop: "Loop",
  wait: "Wait", merge: "Merge", split: "Split", end: "End", fail: "Stop with error", call: "Sub-workflow", app: "App", agent: "AI agent", other: "Step",
};
/** What a part is to its agent, from the kind of wire that joins them. */
const PART: Record<string, string> = { languageModel: "Model", tool: "Tool", memory: "Memory", outputParser: "Answer shape", embedding: "Embeddings" };

type Named = { kind: string; platform?: string; role?: string };
const sublabel = (n: Named, names: Map<string, string>) => {
  const what = n.kind === "part" ? (n.role && PART[n.role]) || "Part" : KIND[n.kind] || "Step";
  const who = n.platform && names.get(n.platform);
  if (!who) return what;
  return n.kind === "app" || n.kind === "http" ? who : `${who} · ${what}`;
};

function Glyph({ kind }: { kind: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {kind === "trigger" && <path d="M11 2.5L4.5 11.5h4.5L8.5 17.5 15.5 8.5H11z" {...common} />}
      {kind === "http" && (
        <>
          <circle cx="10" cy="10" r="6.5" {...common} />
          <path d="M3.5 10h13M10 3.5c2.4 2 2.4 11 0 13M10 3.5c-2.4 2-2.4 11 0 13" {...common} />
        </>
      )}
      {kind === "code" && <path d="M7.5 5.5L3.5 10l4 4.5M12.5 5.5l4 4.5-4 4.5" {...common} />}
      {kind === "branch" && <path d="M10 2.8l7.2 7.2-7.2 7.2L2.8 10z" {...common} />}
      {kind === "call" && (
        <>
          <rect x="3.5" y="4.5" width="13" height="11" rx="2" {...common} />
          <path d="M7 4.5v11M13 4.5v11" {...common} />
        </>
      )}
      {kind === "respond" && <path d="M16 10H5.5M9.5 5.5L5 10l4.5 4.5" {...common} />}
      {kind === "loop" && <path d="M15.5 8a6 6 0 10.3 3.5M15.8 4v4h-4" {...common} />}
      {kind === "wait" && (
        <>
          <circle cx="10" cy="10" r="6.5" {...common} />
          <path d="M10 6.5V10l2.5 1.8" {...common} />
        </>
      )}
      {kind === "fail" && <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" {...common} />}
      {kind === "agent" && (
        <>
          <rect x="4" y="6.5" width="12" height="9" rx="2.5" {...common} />
          <path d="M10 6.5V3.5M7.8 10.5v1.2M12.2 10.5v1.2" {...common} />
        </>
      )}
      {kind === "part" && <circle cx="10" cy="10" r="4.5" {...common} />}
      {!["trigger", "http", "code", "branch", "call", "respond", "loop", "wait", "fail", "agent", "part"].includes(kind) && (
        <rect x="4.5" y="4.5" width="11" height="11" rx="2.5" {...common} />
      )}
    </svg>
  );
}

/** A platform's mark where the node is that platform's, the kind's glyph otherwise. */
function Mark({ node, icons }: { node: Named; icons: Map<string, string> }) {
  const icon = node.platform && icons.get(node.platform);
  return (
    <span className={`auto-node-glyph${icon ? " auto-node-glyph--mark" : ""}`}>
      {icon ? <img src={`/platforms/${icon}`} alt="" width={22} height={22} decoding="async" /> : <Glyph kind={node.kind} />}
    </span>
  );
}

type Placed = { id: string; kind: string; platform?: string; role?: string; left: number; top: number; step: number };
type Wire = { key: string; d: string; fail: boolean; part: boolean; label: string | null; lx: number; ly: number; step: number };
type Band = { title: string; left: number; top: number; width: number; height: number };

/** World coordinates for every node and wire, and which step first shows each. */
function useLayout(graph: Graph, story: StoryStep[]) {
  return useMemo(() => {
    const minX = Math.min(...graph.nodes.map((n) => n.x));
    const minY = Math.min(...graph.nodes.map((n) => n.y));
    const stepOf = (id: string) => {
      const i = story.findIndex((s) => s.nodes.includes(id));
      return i === -1 ? story.length : i;
    };
    const nodes: Placed[] = graph.nodes.map((n) => ({
      id: n.id,
      kind: n.kind,
      platform: n.platform,
      role: graph.edges.find((e) => e.part && e.from === n.id)?.part,
      left: (n.x - minX) * XS + PAD,
      top: n.y - minY + PAD,
      step: stepOf(n.id),
    }));
    const at = new Map(nodes.map((n) => [n.id, n]));
    const outs = new Map<string, number>();
    for (const e of graph.edges) outs.set(e.from, Math.max(outs.get(e.from) ?? 0, e.out + 1));

    /* Where each wire leaves its node. Ports are handed out top to bottom in
       the order of where the wires are going, so two wires out of one node
       never cross on their way out. */
    const port = new Map<number, number>();
    for (const id of new Set(graph.edges.filter((e) => !e.part).map((e) => e.from))) {
      const leaving = graph.edges.map((e, i) => ({ e, i })).filter((x) => x.e.from === id && !x.e.part);
      leaving.sort((p, q) => at.get(p.e.to)!.top - at.get(q.e.to)!.top || p.e.out - q.e.out);
      leaving.forEach((x, slot) => port.set(x.i, (slot - (leaving.length - 1) / 2) * 15));
    }
    /* An agent's parts hang beneath it. Their wires land along its bottom edge
       in the order the parts stand, so they fan out without crossing. */
    const socket = new Map<number, number>();
    for (const id of new Set(graph.edges.filter((e) => e.part).map((e) => e.to))) {
      const hung = graph.edges.map((e, i) => ({ e, i })).filter((x) => x.e.part && x.e.to === id);
      hung.sort((p, q) => at.get(p.e.from)!.left - at.get(q.e.from)!.left);
      hung.forEach((x, slot) => socket.set(x.i, (NW * (slot + 1)) / (hung.length + 1)));
    }

    const wires: Wire[] = graph.edges.map((e, i) => {
      const a = at.get(e.from)!;
      const b = at.get(e.to)!;
      const k = outs.get(e.from) ?? 1;
      if (e.part) {
        const px = a.left + NW / 2;
        const py = a.top;
        const ax = b.left + (socket.get(i) ?? NW / 2);
        const ay = b.top + NH;
        const mid = (py + ay) / 2;
        return { key: `${e.from}>${e.to}>part>${i}`, d: `M${px} ${py} C${px} ${mid} ${ax} ${mid} ${ax} ${ay}`, fail: false, part: true, label: null, lx: px, ly: py, step: Math.max(a.step, b.step) };
      }
      const sx = a.left + NW;
      const sy = a.top + NH / 2 + (port.get(i) ?? 0);
      const tx = b.left;
      const ty = b.top + NH / 2;
      // A wire that runs backwards is a loop returning: send it underneath.
      const back = tx <= sx;
      const drop = Math.max(a.top, b.top) + NH + 70;
      const d = back
        ? `M${sx} ${sy} C${sx + 90} ${sy} ${sx + 90} ${drop} ${sx - NW / 2} ${drop} L${tx + NW / 2} ${drop} C${tx - 90} ${drop} ${tx - 90} ${ty} ${tx} ${ty}`
        : `M${sx} ${sy} C${sx + (tx - sx) / 2} ${sy} ${sx + (tx - sx) / 2} ${ty} ${tx} ${ty}`;
      const fail = a.kind === "http" && e.out === 1;
      const label = fail
        ? "failed"
        : a.kind === "loop"
          ? e.out === 0 ? "done" : "each"
          : a.kind === "branch" && k === 2 && a.id.endsWith("?")
            ? e.out === 0 ? "yes" : "no"
            : null;
      return { key: `${e.from}>${e.to}>${e.out}>${i}`, d, fail, part: false, label, lx: sx + 12, ly: sy + ((port.get(i) ?? 0) <= 0 ? -7 : 15), step: Math.max(a.step, b.step) };
    });

    const width = Math.max(...nodes.map((n) => n.left)) + NW + PAD;
    const height = Math.max(...nodes.map((n) => n.top)) + NH + PAD + 70;
    const box = (list: Placed[]) => {
      const l = Math.min(...list.map((n) => n.left));
      const t = Math.min(...list.map((n) => n.top));
      const r = Math.max(...list.map((n) => n.left)) + NW;
      const b = Math.max(...list.map((n) => n.top)) + NH;
      return { cx: (l + r) / 2, cy: (t + b) / 2, w: r - l, h: b - t };
    };
    const boxes = story.map((_, i) => box(nodes.filter((n) => n.step === i)));
    const sections = graph.sections ?? [];
    const bands: Band[] =
      sections.length > 1
        ? sections.map((sec) => {
            const b = box(nodes.filter((n) => sec.nodes.includes(n.id)));
            return { title: sec.title, left: b.cx - b.w / 2 - 50, top: b.cy - b.h / 2 - 150, width: b.w + 100, height: b.h + 200 };
          })
        : [];
    return { nodes, wires, width, height, boxes, bands, whole: box(nodes) };
  }, [graph, story]);
}

export default function AutomationGraph({
  graph,
  story,
  platforms,
  mode,
  title,
  note,
  compactLimit,
  more,
}: {
  graph: Graph;
  story: StoryStep[];
  /** The marks of the platforms this graph has nodes for. */
  platforms: PlatformMark[];
  mode: "scrub" | "auto";
  /** Named in the frame's corner and to assistive tech. */
  title: string;
  note: string;
  /** In the stacked branch, show only this many steps (the home page does). */
  compactLimit?: number;
  /** Rendered after the steps in the stacked branch, e.g. a link to the full page. */
  more?: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [compact, setCompact] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);
  const [step, setStep] = useState(0);
  const layout = useLayout(graph, story);
  const icons = useMemo(() => new Map(platforms.map((p) => [p.id, p.icon])), [platforms]);
  const names = useMemo(() => new Map(platforms.map((p) => [p.id, p.name])), [platforms]);
  /* A long story gets a shorter stretch of scroll per step, so the pin never runs to a dozen screens. */
  const perStep = Math.min(55, Math.round(640 / (story.length + 1)));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px), (prefers-reduced-motion: reduce)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* The camera's stops are measured at build time, so a resize rebuilds. */
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLayoutKey((k) => k + 1), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      if (compact) {
        (q(".auto-step") as HTMLElement[]).forEach((s) => {
          gsap.from(s.children, {
            opacity: 0,
            y: 28,
            duration: 0.7,
            stagger: 0.1,
            scrollTrigger: { trigger: s, start: "top 84%", once: true },
          });
        });
        return;
      }

      const frame = q(".auto-frame")[0] as HTMLElement | undefined;
      const world = q(".auto-world")[0] as HTMLElement | undefined;
      if (!frame || !world) return;
      const fw = frame.clientWidth;
      const fh = frame.clientHeight;
      /* The lower part of the frame belongs to the caption. */
      const focusY = fh * 0.4;
      const cam = (b: { cx: number; cy: number; w: number; h: number }, roomW: number, roomH: number, min: number) => {
        const scale = Math.max(min, Math.min(1, (fw * roomW) / b.w, (fh * roomH) / b.h));
        return { x: fw / 2 - scale * b.cx, y: focusY - scale * b.cy, scale };
      };
      const stops = layout.boxes.map((b) => cam(b, 0.86, 0.46, 0.42));
      let wide = cam(layout.whole, 0.94, 0.56, 0.05);
      if (layout.bands.length) {
        /* A sectioned canvas is framed by its bands, between the frame's label
           above and the closing line below. */
        const l = Math.min(...layout.bands.map((b) => b.left));
        const t = Math.min(...layout.bands.map((b) => b.top));
        const r = Math.max(...layout.bands.map((b) => b.left + b.width));
        const btm = Math.max(...layout.bands.map((b) => b.top + b.height));
        const room = fh - 76 - 150;
        const scale = Math.min(1, (fw * 0.94) / (r - l), room / (btm - t));
        wide = { x: fw / 2 - (scale * (l + r)) / 2, y: 76 + (room - scale * (btm - t)) / 2 - scale * t, scale };
      }

      const captions = q(".auto-caption") as HTMLElement[];
      const nodeEls = q(".auto-node") as HTMLElement[];
      const wireEls = q(".auto-wire") as unknown as SVGPathElement[];
      const labelEls = q(".auto-wire-label") as unknown as SVGTextElement[];
      const packetEls = q(".auto-packet") as unknown as SVGCircleElement[];
      const n = story.length;
      const END = n * SEG + 1.6;

      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, paused: mode === "auto" });

      /* Everything starts dim; each thing is lit exactly once, at its step. */
      tl.fromTo(world, stops[0], { ...stops[0], duration: 0.01 }, 0).fromTo(
        q(".auto-progress i"),
        { scaleX: 0 },
        { scaleX: 1, duration: END - 0.6, ease: "none" },
        0,
      );

      const light = (s: number, at: number) => {
        const wires = layout.wires.map((w, i) => ({ w, i })).filter((x) => x.w.step === s);
        wires.forEach(({ i }, k) => {
          const t = at + k * 0.07;
          tl.fromTo(wireEls[i], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, ease: "power1.inOut" }, t)
            .fromTo(packetEls[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, t)
            .to(packetEls[i], { motionPath: { path: wireEls[i], align: wireEls[i], alignOrigin: [0.5, 0.5] }, duration: 0.5, ease: "power1.inOut" }, t)
            .fromTo(packetEls[i], { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.12, immediateRender: false }, t + 0.5)
            .fromTo(labelEls[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, t + 0.2);
        });
        const lit = layout.nodes.map((nd, i) => ({ nd, i })).filter((x) => x.nd.step === s).sort((a, b) => a.nd.left - b.nd.left || a.nd.top - b.nd.top);
        lit.forEach(({ i }, k) => {
          const t = at + 0.28 + k * 0.09;
          tl.fromTo(nodeEls[i], { opacity: 0.2, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, t).fromTo(
            nodeEls[i].querySelector(".auto-node-ring"),
            { opacity: 0, scale: 1 },
            { keyframes: [{ opacity: 0.9, duration: 0.06 }, { opacity: 0, scale: 1.18, duration: 0.54, ease: "power1.out" }] },
            t,
          );
        });
      };

      for (let s = 0; s < n; s++) {
        const at = s * SEG;
        tl.addLabel(`step-${s}`, at);
        if (s > 0) {
          tl.fromTo(world, stops[s - 1], { ...stops[s], duration: 0.8, ease: "power3.inOut", immediateRender: false }, at)
            .fromTo(captions[s - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -12, duration: 0.25, ease: "power1.in", immediateRender: false }, at)
            .fromTo(captions[s], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.45);
        }
        light(s, at + (s > 0 ? 0.5 : 0.15));
        tl.call(() => setStep(s), undefined, at + 0.02);
      }

      /* Pull back: the whole workflow in one frame, with anything the story did
         not name lit at the same moment. */
      const pull = n * SEG;
      tl.addLabel("whole", pull)
        .fromTo(world, stops[n - 1], { ...wide, duration: 1, ease: "power3.inOut", immediateRender: false }, pull)
        .fromTo(captions[n - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -12, duration: 0.25, ease: "power1.in", immediateRender: false }, pull)
        .fromTo(q(".auto-finale"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5 }, pull + 0.6);
      const bandEls = q(".auto-band");
      if (bandEls.length) tl.fromTo(bandEls, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.08 }, pull + 0.5);
      light(n, pull + 0.3);
      tl.call(() => setStep(n), undefined, pull + 0.02).to({}, { duration: 0.01 }, END);

      timeline.current = tl;
      if (mode === "scrub") {
        ScrollTrigger.create({ trigger: q(".auto-run")[0], start: "top top", end: "bottom bottom", scrub: 0.7, animation: tl });
      } else {
        tl.timeScale(0.62);
        ScrollTrigger.create({ trigger: frame, start: "top 72%", once: true, onEnter: () => tl.play() });
      }
      return () => {
        timeline.current = null;
      };
    },
    { scope: root, dependencies: [compact, layoutKey, layout, mode], revertOnUpdate: true },
  );

  /* Jump to a step: glide the playhead there and hold. */
  const goTo = (s: number) => {
    const tl = timeline.current;
    if (!tl) return;
    tl.pause();
    gsap.to(tl, { time: Math.min(s, story.length) * SEG + (s >= story.length ? 1.5 : SEG * 0.9), duration: 0.7, ease: "power2.inOut", overwrite: true });
  };

  const pad = (i: number) => String(i + 1).padStart(2, "0");

  if (compact) {
    const shown = compactLimit ? story.slice(0, compactLimit) : story;
    return (
      <div ref={root} className="auto auto--compact" data-od-id="automation-graph">
        {shown.map((s, i) => (
          <article key={s.title} className="auto-step">
            <div className="auto-caption">
              <p className="auto-caption-no">
                {pad(i)}
                <span> / {String(story.length).padStart(2, "0")}</span>
              </p>
              <h3 className="auto-caption-title">{s.title}</h3>
              <p className="auto-caption-copy">{s.copy}</p>
            </div>
            <ol className="auto-chips" aria-label={`Nodes in step ${i + 1}`}>
              {layout.nodes
                .filter((nd) => nd.step === i)
                .sort((a, b) => a.left - b.left || a.top - b.top)
                .map((nd) => (
                  <li key={nd.id} className={`auto-node auto-node--${nd.kind}`}>
                    <Mark node={nd} icons={icons} />
                    <span className="auto-node-text">
                      <b>{nd.id}</b>
                      <i>{sublabel(nd, names)}</i>
                    </span>
                  </li>
                ))}
            </ol>
          </article>
        ))}
        <p className="auto-note auto-note--flow">
          {note} · {graph.nodes.length} nodes in the workflow
        </p>
        {more}
      </div>
    );
  }

  const stage = (
    <div className="auto-stage">
      <div className="auto-frame" role="group" aria-label={`${title}: animated walkthrough`}>
        <div className="auto-grid" aria-hidden="true" />

        <div className="auto-world" style={{ width: layout.width, height: layout.height }} aria-hidden="true">
          {layout.bands.map((b) => (
            <div key={b.title} className="auto-band" style={{ left: b.left, top: b.top, width: b.width, height: b.height }}>
              <span>{b.title}</span>
            </div>
          ))}
          <svg className="auto-wires" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`}>
            {layout.wires.map((w) => (
              <path key={w.key} className={`auto-wire${w.fail ? " auto-wire--fail" : ""}${w.part ? " auto-wire--part" : ""}`} d={w.d} />
            ))}
            {layout.wires.map((w) => (
              <text key={w.key} className={`auto-wire-label${w.fail ? " auto-wire-label--fail" : ""}`} x={w.lx} y={w.ly}>
                {w.label}
              </text>
            ))}
            {layout.wires.map((w) => (
              <circle key={w.key} className={`auto-packet${w.fail ? " auto-packet--fail" : ""}${w.part ? " auto-packet--part" : ""}`} r={w.part ? 4 : 6} />
            ))}
          </svg>
          {layout.nodes.map((nd) => (
            <div key={nd.id} className={`auto-node auto-node--${nd.kind}`} style={{ left: nd.left, top: nd.top, width: NW, height: NH }}>
              <span className="auto-node-ring" />
              <Mark node={nd} icons={icons} />
              <span className="auto-node-text">
                <b>{nd.id}</b>
                <i>{sublabel(nd, names)}</i>
              </span>
            </div>
          ))}
        </div>

        <div className="auto-top">
          <p className="auto-note">
            <b />
            {note}
          </p>
          <span className="auto-progress" aria-hidden="true">
            <i />
          </span>
        </div>

        <div className="auto-captions">
          {story.map((s, i) => (
            <div key={s.title} className="auto-caption">
              <p className="auto-caption-no">
                {pad(i)}
                <span> / {String(story.length).padStart(2, "0")}</span>
                <em>{title}</em>
              </p>
              <h3 className="auto-caption-title">{s.title}</h3>
              <p className="auto-caption-copy">{s.copy}</p>
            </div>
          ))}
        </div>

        <div className="auto-finale">
          <p className="auto-finale-title">
            {graph.nodes.length} nodes. <span>Every path accounted for.</span>
          </p>
        </div>

        {mode === "scrub" ? (
          <SkipPin runway=".auto-run" className="pin-skip--onDark" />
        ) : (
          <div className={`auto-controls${story.length > 9 ? " auto-controls--many" : ""}`}>
            {story.map((s, i) => (
              <button key={s.title} type="button" className="auto-dot" aria-current={step === i ? "step" : undefined} aria-label={`Step ${i + 1}: ${s.title}`} onClick={() => goTo(i)} />
            ))}
            <button type="button" className="auto-dot auto-dot--whole" aria-current={step === story.length ? "step" : undefined} aria-label="The whole workflow" onClick={() => goTo(story.length)} />
            <button type="button" className="auto-replay" onClick={() => timeline.current?.restart()}>
              Replay
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div ref={root} className={`auto auto--${mode}${story.length > 9 ? " auto--long" : ""}`} data-od-id="automation-graph">
      {mode === "scrub" ? (
        <div className="auto-run" style={{ minHeight: `${100 + (story.length + 1) * perStep}svh` }}>
          {stage}
        </div>
      ) : (
        stage
      )}
    </div>
  );
}
