"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import jsQR from "jsqr";
import { Camera, CameraSlash, CheckCircle, Coffee, Minus, Plus, Ticket, User, Warning } from "@phosphor-icons/react";
import { toast } from "sonner";
import { gsap } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { plural } from "@/lib/i18n/config";
import { awardAtTill, lookupCode, redeemAtTill, type Lookup } from "@/lib/admin/actions";
import { HaloGlyph } from "@/components/art/Wordmark";
import { StampRow } from "@/components/site/StampRow";

export function Scanner() {
  const { locale, t } = useI18n();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [result, setResult] = useState<Lookup | null>(null);
  const [amount, setAmount] = useState("");
  const [coffees, setCoffees] = useState(0);
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  const stop = () => {
    stream.current?.getTracks().forEach((tr) => tr.stop());
    stream.current = null;
    setScanning(false);
  };

  const lookup = (code: string) =>
    start(async () => {
      setDone(null);
      const res = await lookupCode(code);
      setResult(res);
      setAmount("");
      setCoffees(0);
      if (res.kind === "none") toast.error(t.admin.scanner.notFound);
      else gsap.fromTo("[data-result]", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
    });

  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      stream.current = media;
      video.current!.srcObject = media;
      await video.current!.play();
      setScanning(true);
    } catch {
      toast.error(t.admin.scanner.cameraError);
    }
  };

  useEffect(() => {
    if (!scanning) return;
    const ctx = canvas.current!.getContext("2d", { willReadFrequently: true })!;
    const id = setInterval(() => {
      const v = video.current;
      if (!v || v.readyState < 2) return;
      const w = 480;
      const h = Math.round((v.videoHeight / v.videoWidth) * w) || 360;
      canvas.current!.width = w;
      canvas.current!.height = h;
      ctx.drawImage(v, 0, 0, w, h);
      const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
      if (found?.data) {
        navigator.vibrate?.(60);
        stop();
        lookup(found.data);
      }
    }, 125);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  useEffect(() => stop, []);

  const amountNum = Number(amount) || 0;
  const preview = result?.kind === "member" ? Math.floor((amountNum / result.leiPerHalo) * result.multiplier) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-ink/10 bg-milk p-5">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-night md:aspect-[4/3]">
          <video ref={video} playsInline muted className="h-full w-full object-cover" />
          <canvas ref={canvas} className="hidden" />
          {!scanning && (
            <div className="absolute inset-0 grid place-items-center text-paper/70">
              <Camera size={48} weight="thin" />
            </div>
          )}
          {scanning && (
            <div className="pointer-events-none absolute inset-[18%] rounded-3xl border-2 border-gilt/80 shadow-[0_0_0_9999px_rgba(19,12,8,.35)]">
              <span className="absolute inset-x-6 top-1/2 h-px animate-pulse bg-gilt" />
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          {scanning ? (
            <button type="button" onClick={stop} className="btn btn-line flex-1">
              <CameraSlash size={18} /> {t.admin.scanner.stop}
            </button>
          ) : (
            <button type="button" onClick={startCamera} className="btn flex-1">
              <Camera size={18} /> {t.admin.scanner.start}
            </button>
          )}
        </div>
        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (manual.trim()) lookup(manual);
          }}
        >
          <span className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">{t.admin.scanner.manual}</span>
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value.toUpperCase())}
              placeholder="ABCD-EFGH · X7K2PQ"
              className="box-field font-mono tracking-[0.15em]"
              autoCapitalize="characters"
            />
            <button type="submit" className="btn btn-line" disabled={pending}>
              {t.admin.scanner.lookup}
            </button>
          </div>
        </form>
      </div>

      <div data-result className="rounded-2xl border border-ink/10 bg-milk p-6">
        {!result || result.kind === "none" ? (
          <div className="grid h-full min-h-64 place-items-center text-center text-ink-soft">
            <div>
              <HaloGlyph className="mx-auto w-16 text-gilt" />
              <p className="mt-4 max-w-xs">{t.admin.scanner.lead}</p>
            </div>
          </div>
        ) : result.kind === "member" ? (
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">
              <User size={14} /> {t.admin.scanner.member} · {result.code}
            </p>
            <p className="mt-3 font-display text-5xl leading-none">{result.name}</p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-2 font-display text-3xl tabular">
                {result.halos} <HaloGlyph className="w-8 text-gilt" />
              </span>
              <span className="rounded-full bg-night px-3 py-1 font-mono text-[11px] tracking-[0.15em] text-gilt uppercase">
                {t.club.tiers[result.tier].name} ×{result.multiplier}
              </span>
            </div>
            <StampRow filled={result.stamps} className="mt-5" />

            <form
              className="mt-8 space-y-5 border-t border-ink/10 pt-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!amountNum && !coffees) return;
                start(async () => {
                  try {
                    const res = await awardAtTill(result.id, Math.max(1, Math.round(amountNum)), coffees);
                    const msg = `+${res.halos} ${plural(locale, res.halos, t.common.halos)}${res.freeCoffees ? ` · ☕ ×${res.freeCoffees}` : ""}`;
                    setDone(msg);
                    toast.success(`${t.admin.scanner.awarded}: ${msg}`);
                    setResult({ ...result, halos: result.halos + res.halos, lifetime: result.lifetime + res.halos, stamps: res.stamps });
                    setAmount("");
                    setCoffees(0);
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                });
              }}
            >
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">{t.admin.scanner.amount}</span>
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                  className="box-field font-display text-4xl tabular"
                  placeholder="0"
                  autoFocus
                />
              </label>
              <div>
                <span className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">{t.admin.scanner.coffees}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setCoffees((c) => Math.max(0, c - 1))} className="grid size-11 place-items-center rounded-full border border-ink/15">
                    <Minus size={16} />
                  </button>
                  <span className="flex w-16 items-center justify-center gap-1 font-display text-3xl tabular">
                    <Coffee size={20} weight="light" /> {coffees}
                  </span>
                  <button type="button" onClick={() => setCoffees((c) => c + 1)} className="grid size-11 place-items-center rounded-full border border-ink/15">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <button type="submit" disabled={pending || (!amountNum && !coffees)} className="btn btn-lg w-full">
                {t.admin.scanner.award} · +{preview} <HaloGlyph className="w-6" />
              </button>
              {done && (
                <p className="flex items-center gap-2 rounded-xl bg-sage-deep/10 px-4 py-3 text-sage-deep">
                  <CheckCircle size={18} weight="fill" /> {t.admin.scanner.awarded}: {done}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">
              <Ticket size={14} /> {t.admin.scanner.voucher} · {result.code}
            </p>
            <p className="mt-3 font-display text-4xl leading-tight">{result.label.split(" / ")[locale === "ro" ? 0 : 1] ?? result.label}</p>
            <p className="mt-2 text-ink-soft">{result.owner}</p>
            {result.status === "pending" ? (
              <button
                type="button"
                disabled={pending}
                className="btn btn-lg mt-8 w-full"
                onClick={() =>
                  start(async () => {
                    const res = await redeemAtTill(result.code);
                    if (res.ok) {
                      toast.success(t.admin.scanner.voucherUsed);
                      setResult({ ...result, status: "used", usedAt: new Date().toISOString() });
                    } else toast.error(t.admin.scanner.alreadyUsed);
                  })
                }
              >
                <CheckCircle size={18} /> {t.admin.scanner.useVoucher}
              </button>
            ) : (
              <p className="mt-8 flex items-center gap-2 rounded-xl bg-cherry/10 px-4 py-3 text-cherry">
                <Warning size={18} /> {t.admin.scanner.alreadyUsed}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
