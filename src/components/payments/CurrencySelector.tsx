import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency, type CurrencyData } from "@/hooks/useCurrency";

interface CurrencySelectorProps {
  compact?: boolean;
}

export const CurrencySelector = ({ compact = false }: CurrencySelectorProps) => {
  const { currency, currencies, changeCurrency } = useCurrency();

  return (
    <Select value={currency.code} onValueChange={changeCurrency}>
      <SelectTrigger className={compact ? "w-[80px] h-8 text-xs" : "w-[140px]"}>
        <Globe className="w-3 h-3 mr-1" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr: CurrencyData) => (
          <SelectItem key={curr.code} value={curr.code}>
            {compact ? curr.code : `${curr.symbol} ${curr.code}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
