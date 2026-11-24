"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { redeemReward } from "@/lib/actions/member";

export function RedeemButton({ rewardId, affordable }: { rewardId: string; affordable: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={!affordable || pending}
      onClick={() =>
        start(async () => {
          const res = await redeemReward(rewardId);
          if (res.ok) {
            toast.success(t.account.redeemed);
            router.refresh();
            document.getElementById("vouchers")?.scrollIntoView({ behavior: "smooth", block: "center" });
          } else toast.error(t.account.notEnough);
        })
      }
      className="btn btn-sm w-full disabled:!opacity-40"
    >
      {pending ? <CircleNotch size={16} className="animate-spin" /> : affordable ? t.account.redeem : t.account.notEnough}
    </button>
  );
}
