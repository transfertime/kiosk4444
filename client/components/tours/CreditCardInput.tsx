import React from "react";

export type CreditCardInputProps = {
  cardName: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  onChange: (fields: Partial<Record<string, string>>) => void;
};

function formatCardNumber(v: string) {
  const digits = v.replace(/[^0-9]/g, "");
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export default function CreditCardInput({
  cardName,
  cardNumber,
  expMonth,
  expYear,
  cvv,
  onChange,
}: CreditCardInputProps) {
  return (
    <div>
      <div className="rounded-lg border p-4 mb-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xs opacity-75">Kart Sahibi</div>
            <div className="font-medium">{cardName || "---"}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">Son Kullanma</div>
            <div className="font-medium">{(expMonth || "MM") + "/" + (expYear ? expYear.slice(-2) : "YY")}</div>
          </div>
        </div>
        <div className="text-lg tracking-widest font-mono">{formatCardNumber(cardNumber) || "•••• •••• •••• ••••"}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs text-slate-600 mb-1">Kart Üzerindeki İsim</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={cardName}
            onChange={(e) => onChange({ cardName: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-slate-600 mb-1">Kart Numarası</label>
          <input
            inputMode="numeric"
            maxLength={23}
            placeholder="1111 2222 3333 4444"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={cardNumber}
            onChange={(e) => onChange({ cardNumber: e.target.value.replace(/[^0-9 ]/g, "") })}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">Son Kullanma Ay</label>
          <input
            inputMode="numeric"
            placeholder="MM"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={expMonth}
            onChange={(e) => onChange({ expMonth: e.target.value.replace(/[^0-9]/g, "") })}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">Yıl</label>
          <input
            inputMode="numeric"
            placeholder="YYYY"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={expYear}
            onChange={(e) => onChange({ expYear: e.target.value.replace(/[^0-9]/g, "") })}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">CVV</label>
          <input
            inputMode="numeric"
            maxLength={4}
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={cvv}
            onChange={(e) => onChange({ cvv: e.target.value.replace(/[^0-9]/g, "") })}
          />
        </div>
      </div>
    </div>
  );
}
