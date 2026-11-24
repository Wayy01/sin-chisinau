import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">{children}</span>;
}

export function Field({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <Label>{label}</Label>
      <input {...props} className="box-field" />
    </label>
  );
}

export function Area({ label, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <Label>{label}</Label>
      <textarea {...props} className="box-field min-h-24 resize-y leading-relaxed" />
    </label>
  );
}

export function Select({
  label,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <Label>{label}</Label>
      <select {...props} className="box-field appearance-none bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-9" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%235b4636' stroke-width='1.5'/%3E%3C/svg%3E\")" }}>
        {children}
      </select>
    </label>
  );
}

export function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 select-none">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-6 w-11 rounded-full bg-ink/15 transition-colors peer-checked:bg-sage-deep peer-focus-visible:ring-2 peer-focus-visible:ring-gilt after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-milk after:shadow after:transition-transform peer-checked:after:translate-x-5" />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function Card({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-ink/10 bg-milk p-5 md:p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-2xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, kicker, action }: { title: string; kicker?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <p className="kicker text-gilt">{kicker}</p>}
        <h1 className="mt-2 text-[clamp(2.2rem,4vw,3.4rem)] leading-none">{title}</h1>
      </div>
      {action}
    </div>
  );
}
