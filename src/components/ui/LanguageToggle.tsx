import { Languages } from "lucide-react";
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
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={language === "en" ? "font-semibold" : ""}
        >
          🇬🇧 {t("common.english")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("sw")}
          className={language === "sw" ? "font-semibold" : ""}
        >
          🇰🇪 {t("common.swahili")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};