type IconProps = { name: string; className?: string };

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Monoline icon set — 1.7px stroke on currentColor, never emoji. */
export default function Icon({ name, className }: IconProps) {
  const common = { viewBox: "0 0 24 24", className, "aria-hidden": true } as const;

  switch (name) {
    case "webflow":
      return (
        <svg {...common} {...S}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 8.5h18" />
          <circle cx="6.4" cy="6.3" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "gsap":
      return (
        <svg {...common} {...S}>
          <path d="M3 17c4-10 14-10 18 0" />
          <circle cx="12" cy="15.4" r="2.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "cms":
      return (
        <svg {...common} {...S}>
          <ellipse cx="12" cy="6.5" rx="7" ry="3" />
          <path d="M5 6.5v11c0 1.7 3.1 3 7 3s7-1.3 7-3v-11" />
          <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
        </svg>
      );
    case "seo":
      return (
        <svg {...common} {...S}>
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="M15 15l5 5" />
        </svg>
      );
    case "api":
      return (
        <svg {...common} {...S}>
          <circle cx="5.5" cy="12" r="2.6" />
          <circle cx="18.5" cy="6" r="2.6" />
          <circle cx="18.5" cy="18" r="2.6" />
          <path d="M8 11l8-4M8 13l8 4" />
        </svg>
      );
    case "performance":
      return (
        <svg {...common} {...S}>
          <path d="M4 16a8 8 0 1 1 16 0" />
          <path d="M12 16l4-4" />
          <circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "support":
      return (
        <svg {...common} {...S}>
          <circle cx="12" cy="12" r="8.4" />
          <path d="M12 7.4V12l3.2 2" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common} {...S}>
          <path d="M4 12L12 4M12 4H5.2M12 4v6.8" />
        </svg>
      );
    case "ai":
    case "sparkles":
      return (
        <svg {...common} {...S}>
          <path d="M12 3l2.2 6.2L20.5 12l-6.3 2.8L12 21l-2.2-6.2L3.5 12l6.3-2.8L12 3z" />
          <path d="M18.5 2.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
        </svg>
      );
    case "workflow":
      return (
        <svg {...common} {...S}>
          <rect x="3" y="3" width="6" height="6" rx="1.5" />
          <rect x="15" y="3" width="6" height="6" rx="1.5" />
          <rect x="9" y="15" width="6" height="6" rx="1.5" />
          <path d="M6 9v3a2 2 0 0 0 2 2h4m6-5v3a2 2 0 0 1-2 2h-4m0 0v1" />
        </svg>
      );
    case "search":
      return (
        <svg {...common} {...S}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    default:
      return null;
  }
}
