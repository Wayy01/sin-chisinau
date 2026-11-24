/** Global SVG filters: wobbly ink lines, bleeding paint edges, watercolor washes. */
export function InkDefs() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter id="ink-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
        </filter>
        <filter id="ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="4" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.6" />
        </filter>
        <filter id="watercolor" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="4" seed="11" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="60" result="shape" />
          <feGaussianBlur in="shape" stdDeviation="6" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="grain" />
          <feColorMatrix in="grain" type="saturate" values="0" result="mono" />
          <feComposite in="soft" in2="mono" operator="arithmetic" k1="0.35" k2="0.9" k3="0" k4="0" />
        </filter>
      </defs>
    </svg>
  );
}
