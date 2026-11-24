import type { SVGProps } from "react";

type InkProps = SVGProps<SVGSVGElement> & { weight?: number; rough?: boolean };

function Ink({ weight = 1.5, rough = true, children, ...props }: InkProps) {
  return (
    <svg fill="none" aria-hidden {...props}>
      <g
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={rough ? "url(#ink-rough)" : undefined}
      >
        {children}
      </g>
    </svg>
  );
}

const ns = { vectorEffect: "non-scaling-stroke" as const, "data-draw": true };

export function InkCroissant(props: InkProps) {
  return (
    <Ink viewBox="0 0 220 130" {...props}>
      <path {...ns} d="M18 92C16 70 40 46 70 36C88 26 132 26 150 36C180 46 204 70 202 92C196 100 182 100 176 92C168 108 140 118 110 118C80 118 52 108 44 92C38 100 24 100 18 92Z" />
      <path {...ns} d="M44 92C48 72 58 56 74 46" />
      <path {...ns} d="M74 46C74 70 80 98 88 116" />
      <path {...ns} d="M146 46C146 70 140 98 132 116" />
      <path {...ns} d="M176 92C172 72 162 56 146 46" />
      <path {...ns} d="M104 36C102 58 104 92 108 112" />
      <path {...ns} d="M158 66L166 74M162 58L170 66M152 78L160 86M60 64L54 72M56 72L50 80" />
      <path {...ns} d="M96 124h.5M120 125h.5M70 120h.5" />
    </Ink>
  );
}

export function InkCup(props: InkProps) {
  return (
    <Ink viewBox="0 0 200 200" {...props}>
      <path {...ns} d="M84 66C74 52 94 44 84 28M102 62C92 46 112 38 102 18M120 66C110 52 130 44 120 30" />
      <ellipse {...ns} cx="100" cy="84" rx="52" ry="9" />
      <path {...ns} d="M48 84C50 120 60 150 76 160H124C140 150 150 120 152 84" />
      <path {...ns} d="M151 98C178 94 180 132 146 134" />
      <path {...ns} d="M90 83C90 79 98 79 100 83C102 79 110 79 110 83C110 87 100 90 100 90C100 90 90 87 90 83Z" />
      <ellipse {...ns} cx="100" cy="120" rx="9" ry="3.4" />
      <ellipse {...ns} cx="100" cy="166" rx="74" ry="12" />
    </Ink>
  );
}

export function InkWings(props: InkProps) {
  const wing = (
    <>
      <path {...ns} d="M118 62C96 40 62 22 18 26C34 34 44 40 50 46C36 46 26 50 18 56C36 58 48 60 56 64C44 68 36 74 30 82C50 80 66 78 78 80C70 86 66 92 64 100C84 92 104 80 118 62Z" />
      <path {...ns} d="M50 46C70 48 92 54 112 62M56 64C76 64 96 64 114 64M78 80C92 74 104 70 116 66" />
    </>
  );
  return (
    <Ink viewBox="0 0 240 120" {...props}>
      {wing}
      <g transform="translate(240 0) scale(-1 1)">{wing}</g>
    </Ink>
  );
}

export function InkWheat(props: InkProps) {
  const grains = [40, 60, 80, 100, 120];
  return (
    <Ink viewBox="0 0 120 220" {...props}>
      <path {...ns} d="M58 210C60 160 62 100 66 20" />
      {grains.map((y, i) => {
        const x = 66 - i * 0.9;
        return (
          <g key={y}>
            <path {...ns} d={`M${x} ${y}C${x - 14} ${y - 6} ${x - 16} ${y - 18} ${x - 9} ${y - 25}C${x - 1} ${y - 18} ${x + 1} ${y - 8} ${x} ${y}Z`} />
            <path {...ns} d={`M${x} ${y}C${x + 14} ${y - 6} ${x + 16} ${y - 18} ${x + 9} ${y - 25}C${x + 1} ${y - 18} ${x - 1} ${y - 8} ${x} ${y}Z`} />
          </g>
        );
      })}
      <path {...ns} d="M66 20C64 12 66 6 70 2" />
    </Ink>
  );
}

export function InkCherries(props: InkProps) {
  return (
    <Ink viewBox="0 0 140 150" {...props}>
      <path {...ns} d="M64 20C68 50 54 80 42 106M64 20C74 50 90 74 100 96" />
      <path {...ns} d="M64 20C84 6 108 10 116 22C98 30 78 30 64 20Z" />
      <path {...ns} d="M72 18C86 18 100 20 112 22" />
      <circle {...ns} cx="40" cy="122" r="19" />
      <circle {...ns} cx="102" cy="112" r="19" />
      <path {...ns} d="M30 114C32 109 36 106 41 105M92 104C94 99 98 96 103 95" />
    </Ink>
  );
}

export function InkPaw(props: InkProps) {
  return (
    <Ink viewBox="0 0 100 100" {...props}>
      <path {...ns} d="M50 52C36 52 24 66 26 78C28 90 40 88 50 86C60 88 72 90 74 78C76 66 64 52 50 52Z" />
      <ellipse {...ns} cx="22" cy="44" rx="8" ry="11" transform="rotate(-20 22 44)" />
      <ellipse {...ns} cx="38" cy="28" rx="8" ry="11" transform="rotate(-6 38 28)" />
      <ellipse {...ns} cx="62" cy="28" rx="8" ry="11" transform="rotate(6 62 28)" />
      <ellipse {...ns} cx="78" cy="44" rx="8" ry="11" transform="rotate(20 78 44)" />
    </Ink>
  );
}

export function InkScribble(props: InkProps) {
  return (
    <Ink viewBox="0 0 200 100" preserveAspectRatio="none" {...props}>
      <path data-draw d="M24 52C22 22 162 12 182 40C198 64 150 90 90 88C40 86 8 72 16 46C22 30 60 18 108 20" />
    </Ink>
  );
}

export function InkArrow(props: InkProps) {
  return (
    <Ink viewBox="0 0 120 60" {...props}>
      <path {...ns} d="M8 46C34 14 78 8 108 28" />
      <path {...ns} d="M94 16L109 29L91 36" />
    </Ink>
  );
}

export function InkSparkle(props: InkProps) {
  return (
    <Ink viewBox="0 0 24 24" rough={false} {...props}>
      <path {...ns} d="M12 1C13 8 16 11 23 12C16 13 13 16 12 23C11 16 8 13 1 12C8 11 11 8 12 1Z" />
    </Ink>
  );
}

export function InkSteam(props: InkProps) {
  return (
    <Ink viewBox="0 0 80 120" {...props}>
      <path {...ns} d="M20 116C8 96 32 84 20 62C10 44 30 30 22 6" />
      <path {...ns} d="M44 112C34 94 56 82 46 62C38 46 56 34 50 14" />
      <path {...ns} d="M66 116C56 100 74 90 66 72" />
    </Ink>
  );
}

/** Filled brush swash for underlines and price tags; edges roughened by #ink-bleed. */
export function BrushStroke({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden className={className} {...props}>
      <path
        filter="url(#ink-bleed)"
        fill="currentColor"
        d="M4 7C42 2 120 0 195 4C200 6 199 26 196 29C132 33 62 34 7 31C1 30 0 10 4 7Z"
      />
    </svg>
  );
}

export function InkBlot({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 110" aria-hidden className={className} {...props}>
      <g fill="currentColor" filter="url(#ink-bleed)">
        <path d="M54 20C66 10 84 18 86 32C100 30 108 44 98 54C108 66 96 82 82 76C76 92 56 92 52 78C36 84 24 70 32 58C18 50 24 32 40 34C40 26 46 22 54 20Z" />
        <circle cx="106" cy="22" r="4" />
        <circle cx="16" cy="88" r="3" />
        <circle cx="98" cy="96" r="2.5" />
        <circle cx="22" cy="20" r="2" />
      </g>
    </svg>
  );
}

/** Soft paint wash used behind photography. */
export function PaintWash({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 400 400" aria-hidden className={className}>
      <g filter="url(#watercolor)" fill={color}>
        <ellipse cx="200" cy="200" rx="150" ry="125" opacity="0.55" />
        <ellipse cx="240" cy="170" rx="90" ry="80" opacity="0.4" />
      </g>
    </svg>
  );
}

export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 20" fill="none" aria-hidden className={className}>
      <g stroke="currentColor" strokeWidth="1">
        <path vectorEffect="non-scaling-stroke" d="M0 10H92M148 10H240" />
        <ellipse vectorEffect="non-scaling-stroke" cx="120" cy="10" rx="18" ry="6" />
        <path vectorEffect="non-scaling-stroke" d="M120 1V4M120 16V19" />
      </g>
    </svg>
  );
}
