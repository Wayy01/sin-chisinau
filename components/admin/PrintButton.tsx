"use client";

import { Printer } from "@phosphor-icons/react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn print:hidden">
      <Printer size={16} /> {label}
    </button>
  );
}
