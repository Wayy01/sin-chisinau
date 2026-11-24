"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

function Watch({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();
  useEffect(() => onChange(pathname), [pathname, onChange]);
  return null;
}

/**
 * Pathname is request data under Cache Components, so anything that reacts to it
 * lives behind its own Suspense boundary and the static shell stays prerenderable.
 */
export function OnPathname({ onChange }: { onChange: (pathname: string) => void }) {
  return (
    <Suspense fallback={null}>
      <Watch onChange={onChange} />
    </Suspense>
  );
}

function Render({ children }: { children: (pathname: string) => ReactNode }) {
  return children(usePathname());
}

/** Renders `children(pathname)`, falling back to `children(fallback)` in the static shell. */
export function WithPathname({ children, fallback = "" }: { children: (pathname: string) => ReactNode; fallback?: string }) {
  return (
    <Suspense fallback={children(fallback)}>
      <Render>{children}</Render>
    </Suspense>
  );
}
