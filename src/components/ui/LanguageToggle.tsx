import { Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

export const LanguageToggle = ({ className }: { className?: string }) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("common.language")}
          className={className ?? "w-8 h-8 text-muted-foreground hover:text-foreground"}
        >
          <Languages className="w-4 h-4" />
          <span className="sr-only">{language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] rounded-sm">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className="flex items-center justify-between gap-3 cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground w-6">EN</span>
            <span className={language === "en" ? "font-semibold" : ""}>{t("common.english")}</span>
          </span>
          {language === "en" && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("sw")}
          className="flex items-center justify-between gap-3 cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground w-6">SW</span>
            <span className={language === "sw" ? "font-semibold" : ""}>{t("common.swahili")}</span>
          </span>
          {language === "sw" && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};