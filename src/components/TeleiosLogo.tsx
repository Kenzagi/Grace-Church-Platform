/**
 * Teleios mark — Trinity triangle, single color.
 * A solid, rounded triangle with a V-shaped notch rising from the bottom
 * edge to one center point: three equal corners joined as one being.
 * AdonisJS-style monoline geometry — generous corner rounding, polished
 * silhouette. One color only: it inherits `currentColor`, so contexts
 * decide the hue (white on dark surfaces, ink inside light chips).
 */
export function TeleiosLogo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.66 10.92 A5 5 0 0 1 26.34 10.92 L39.16 35.08 A5 5 0 0 1 36.5 39.5 L11.5 39.5 A5 5 0 0 1 8.84 35.08 Z M16.2 39.5 L22.8 25.4 Q24 23.0 25.2 25.4 L31.8 39.5 Z"
      />
    </svg>
  );
}
