import type { SVGProps } from "react";

/**
 * Hand-drawn take on the SIN mark: a high-contrast "s ı n" with a halo floating over the stem.
 * Every stroke carries data-draw so GSAP can ink it in.
 */
export function Wordmark({ title = "SIN", ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 260 150" fill="none" role="img" aria-label={title} {...props}>
      <title>{title}</title>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* halo */}
        <ellipse data-draw data-halo cx="128" cy="22" rx="21" ry="7.5" strokeWidth="2" />
        {/* s — upper loop + heavy belly */}
        <path data-draw strokeWidth="2" d="M79 60 C74 47 49 44 47 60 C45 73 62 78 72 86" />
        <path data-draw strokeWidth="7.5" d="M72 86 C86 96 84 121 63 124 C49 126 40 118 41 107" />
        {/* s — long hairline crossbar, the mark's signature */}
        <path data-draw strokeWidth="1.6" d="M22 114 C46 98 74 80 104 62" />
        {/* ı — stem with hairline serifs */}
        <path data-draw strokeWidth="8" d="M128 50 L128 122" />
        <path data-draw strokeWidth="1.8" d="M117 49 L139 49" />
        <path data-draw strokeWidth="1.8" d="M114 123 L142 123" />
        {/* n — swelling diagonal into a triangular finish */}
        <path data-draw strokeWidth="1.8" d="M156 122 L156 52" />
        <path data-draw strokeWidth="7.5" d="M156 54 C176 58 186 78 194 100 C199 114 204 121 214 122" />
        <path data-draw strokeWidth="1.6" d="M200 50 L238 122 L208 122" />
      </g>
    </svg>
  );
}

/** Small halo-only glyph used as an ornament and in the cursor. */
export function HaloGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 20" fill="none" aria-hidden {...props}>
      <ellipse cx="24" cy="10" rx="21" ry="7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
