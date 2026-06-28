import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";
import { Tilt3D } from "@/components/ui/tilt-3d";

/**
 * Bandeau « À l'honneur » : met en avant les projets des proches (resto, Insta,
 * asso, artiste…). Curé par les admins. Affiché sur la home s'il y a au moins
 * un encart actif.
 */
export async function SpotlightBanner() {
  let spotlights: any[] = [];
  try {
    spotlights = await prisma.spotlight.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 6,
    });
  } catch {
    return null; // DB indisponible : on n'affiche rien
  }

  if (!spotlights.length) return null;

  const t = await getTranslations("home.spotlight");

  return (
    <section className="border-t border-ink-line bg-paper py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <span className="section-no">{t("sectionNo")}</span>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              {t("lead")}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spotlights.map((s, i) => {
            const Wrapper: any = s.url ? "a" : "div";
            const wrapperProps = s.url
              ? { href: s.url, target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <Reveal key={s.id} delay={i * 80}>
                <Tilt3D className="h-full">
                <Wrapper
                  {...wrapperProps}
                  className="group block h-full overflow-hidden rounded-[var(--radius)] border border-ink-line bg-card transition-all hover:border-ink/40 hover:shadow-paper-md"
                >
                  {s.imageUrl && (
                    <div className="aspect-[16/9] overflow-hidden bg-paper-warm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-lg font-semibold leading-tight">{s.title}</h3>
                        {s.subtitle && (
                          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                            {s.subtitle}
                          </p>
                        )}
                      </div>
                      {s.url && (
                        <ArrowUpRight
                          className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-seal"
                          strokeWidth={1.75}
                        />
                      )}
                    </div>
                    {s.description && (
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft line-clamp-3">
                        {s.description}
                      </p>
                    )}
                  </div>
                </Wrapper>
                </Tilt3D>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
