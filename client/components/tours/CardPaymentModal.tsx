import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreditCardInput from "./CreditCardInput";
import type { Tour } from "./data";

export type CardPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour;
  amount: number;
  orderId: string;
};

export default function CardPaymentModal({ open, onOpenChange, tour, amount, orderId }: CardPaymentModalProps) {
  const [cardName, setCardName] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [expMonth, setExpMonth] = React.useState("");
  const [expYear, setExpYear] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onPay() {
    try {
      setLoading(true);
      const res = await fetch("/api/payments/vakif/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, orderId: orderId, currency: "EUR" }),
      });
      if (!res.ok) {
        alert("Ödeme başlatılamadı. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      // Submit form to gateway
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.gatewayUrl;
      Object.entries(data.fields || {}).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      alert("Ödeme başlatılırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kredi Kartı ile Ödeme</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="text-sm text-slate-600 mb-2">Tur: {tour.title}</div>
          <div className="text-sm text-slate-600 mb-4">Tutar: {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)}</div>

          <CreditCardInput
            cardName={cardName}
            cardNumber={cardNumber}
            expMonth={expMonth}
            expYear={expYear}
            cvv={cvv}
            onChange={(fields) => {
              if (fields.cardName !== undefined) setCardName(fields.cardName);
              if (fields.cardNumber !== undefined) setCardNumber(fields.cardNumber);
              if (fields.expMonth !== undefined) setExpMonth(fields.expMonth);
              if (fields.expYear !== undefined) setExpYear(fields.expYear);
              if (fields.cvv !== undefined) setCvv(fields.cvv);
            }}
          />

          <div className="flex justify-end mt-4">
            <button
              onClick={onPay}
              disabled={loading}
              className="rounded-md bg-brand text-white px-4 py-2 font-semibold disabled:opacity-50"
            >
              {loading ? "İşleniyor..." : "Ödemeyi Başlat"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
