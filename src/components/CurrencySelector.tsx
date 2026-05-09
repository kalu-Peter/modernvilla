import React from "react";
import { useCurrency, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, loading } = useCurrency();

  return (
    <div className="currency-selector">
      <select
        value={currency.code}
        onChange={(e) => {
          const found = SUPPORTED_CURRENCIES.find(
            (c) => c.code === e.target.value,
          );
          if (found) setCurrency(found);
        }}
        disabled={loading}
        aria-label="Select currency"
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
