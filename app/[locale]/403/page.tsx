import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ForbiddenPage() {
  const t = useTranslations("errors.403");

  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-paper px-6">
      <div className="max-w-sm text-center" style={{ animation: "fade-in-scale 0.5s both" }}>
        <span className="section-no">{t("sectionNo")}</span>
        <p className="my-2 select-none font-serif text-[6rem] font-semibold leading-none text-ink-line tabular sm:text-[8rem]">
          403
        </p>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("subtitle")}</p>
        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98]"
        >
          {t("cta")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
