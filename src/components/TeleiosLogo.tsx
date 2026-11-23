/**
 * Teleios mark — Trinity triangle.
 * Three equal nodes (Father / Son / Holy Spirit) joined by one continuous
 * outline; the medians meet at a single center point — three in one.
 * variant "mono": currentColor throughout (for colorful surfaces / chips).
 * variant "accent": the three palette accents as nodes; medians and the
 * center point follow currentColor. On dark surfaces pass dark so the
 * deep-purple node stays visible (#391463 is near-invisible on #1a1a1a).
 */
export function TeleiosLogo({
  size = 32,
  variant = "accent",
  dark = false,
  className,
}: {
  size?: number;
  variant?: "accent" | "mono";
  dark?: boolean;
  className?: string;
}) {
  const nodes =
    variant === "mono"
      ? ["currentColor", "currentColor", "currentColor"]
      : dark
        ? ["#FF5714", "#16DB65", "#9D7BFF"]
        : ["#FF5714", "#16DB65", "#391463"];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* medians — three points meeting at one center */}
      <g stroke="currentColor" strokeOpacity={0.32} strokeWidth={1.7} strokeLinecap="round">
        <line x1="24" y1="11.4" x2="24" y2="24.9" />
        <line x1="10.6" y1="36.6" x2="20" y2="30.9" />
        <line x1="37.4" y1="36.6" x2="28" y2="30.9" />
      </g>
      {/* one continuous outline */}
      <path
        d="M24 7 L41.5 39 L6.5 39 Z"
        stroke="currentColor"
        strokeWidth={2.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* the three hypostases — equal points */}
      <circle cx="24" cy="7" r="4.4" fill={nodes[0]} />
      <circle cx="6.5" cy="39" r="4.4" fill={nodes[1]} />
      <circle cx="41.5" cy="39" r="4.4" fill={nodes[2]} />
      {/* one being */}
      <circle cx="24" cy="28.3" r="2.5" fill="currentColor" />
    </svg>
  );
}
