"use client";

import { useState } from "react";
import { CheckoutModal } from "./CheckoutModal";

// SENIOR (2026-08-01): botão + estado do modal isolados num client component
// próprio, pra FeatureList.tsx (que é server component) continuar simples -
// só importa <ReserveButton /> e pronto, sem precisar virar "use client"
// inteira só por causa de um botão.
export function ReserveButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Reservar e pagar sinal
      </button>
      <CheckoutModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
