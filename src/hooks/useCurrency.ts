import { useState, useEffect } from "react";

interface CurrencyData {
  code: string;
  symbol: string;
  rate: number; // Rate from KES to target currency
  name: string;
}

const currencies: Record<string, CurrencyData> = {
  KES: { code: "KES", symbol: "KSh", rate: 1, name: "Kenyan Shilling" },
  USD: { code: "USD", symbol: "$", rate: 0.0078, name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", rate: 0.0071, name: "Euro" },
  GBP: { code: "GBP", symbol: "£", rate: 0.0061, name: "British Pound" },
  NGN: { code: "NGN", symbol: "₦", rate: 5.76, name: "Nigerian Naira" },
  ZAR: { code: "ZAR", symbol: "R", rate: 0.14, name: "South African Rand" },
  TZS: { code: "TZS", symbol: "TSh", rate: 20.5, name: "Tanzanian Shilling" },
  UGX: { code: "UGX", symbol: "USh", rate: 28.5, name: "Ugandan Shilling" },
  GHS: { code: "GHS", symbol: "₵", rate: 0.089, name: "Ghanaian Cedi" },
};

// Map country codes to currency codes
const countryToCurrency: Record<string, string> = {
  KE: "KES",
  US: "USD",
  GB: "GBP",
  NG: "NGN",
  ZA: "ZAR",
  TZ: "TZS",
  UG: "UGX",
  GH: "GHS",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyData>(currencies.KES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Try to get user's country from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Simple timezone to country mapping
        let countryCode = "KE"; // Default to Kenya
        
        if (timezone.includes("America/New_York") || timezone.includes("America/Los_Angeles")) {
          countryCode = "US";
        } else if (timezone.includes("Europe/London")) {
          countryCode = "GB";
        } else if (timezone.includes("Africa/Lagos")) {
          countryCode = "NG";
        } else if (timezone.includes("Africa/Johannesburg")) {
          countryCode = "ZA";
        } else if (timezone.includes("Africa/Dar_es_Salaam")) {
          countryCode = "TZ";
        } else if (timezone.includes("Africa/Kampala")) {
          countryCode = "UG";
        } else if (timezone.includes("Africa/Accra")) {
          countryCode = "GH";
        } else if (timezone.includes("Europe/")) {
          countryCode = "DE"; // Default to EUR for Europe
        }

        const currencyCode = countryToCurrency[countryCode] || "KES";
        setCurrency(currencies[currencyCode] || currencies.KES);
      } catch {
        setCurrency(currencies.KES);
      } finally {
        setLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const convertFromKES = (amountInKES: number): number => {
    return Math.round(amountInKES * currency.rate * 100) / 100;
  };

  const formatPrice = (amountInKES: number, showOriginal = false): string => {
    const converted = convertFromKES(amountInKES);
    const formatted = `${currency.symbol}${converted.toLocaleString()}`;
    
    if (showOriginal && currency.code !== "KES") {
      return `${formatted} (KSh${amountInKES.toLocaleString()})`;
    }
    return formatted;
  };

  const changeCurrency = (code: string) => {
    if (currencies[code]) {
      setCurrency(currencies[code]);
    }
  };

  return {
    currency,
    currencies: Object.values(currencies),
    convertFromKES,
    formatPrice,
    changeCurrency,
    loading,
    isKES: currency.code === "KES",
  };
};

export type { CurrencyData };
