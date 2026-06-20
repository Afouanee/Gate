import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, getAge } from "@/lib/utils";
import Link from "next/link";
import {
  Calendar, MapPin, User, Heart, Users, Baby, ArrowLeft,
  EyeOff, Crown, ExternalLink, Briefcase,
} from "lucide-react";
import { LinkRequestButton } from "@/components/profile/link-request-button";
import { ProfileFeedbackModal } from "@/components/profile/profile-feedback-modal";
import { ProfileEditDialog } from "@/components/profile/profile-edit-dialog";

export default async function ProfilPage({ params }: { params: { id: string } }) {
  const session   = await requireSession();
  const isPremium = session.user.role === "PREMIUM" || session.user.role === "ADMIN";

  const person = await prisma.person.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true } },
      relationsAsSource: {
        include: {
          target: {
            select: {
              id: true, firstName: true, lastName: true,
              gender: true, photoUrl: true, showPhoto: true,
            },
          },
        },
      },
      relationsAsTarget: {
        include: {
          source: {
            select: {
              id: true, firstName: true, lastName: true,
              gender: true, photoUrl: true, showPhoto: true,
            },
          },
        },
      },
    },
  });

  if (!person) notFound();

  const showBirthDate  = isPremium || person.showBirthDate;
  const showDeathDate  = isPremium || person.showDeathDate;
  const showPhoto      = isPremium || person.showPhoto;
  const showPersonalData = isPremium || person.showPersonalData;
  const showMarriage   = isPremium || person.showMarriage;
  const age            = showBirthDate ? getAge(person.birthDate, person.deathDate) : null;
  const canEdit        = session.user.role === "ADMIN" || person.userId === session.user.id;

  const parents  = person.relationsAsTarget.filter((r) => r.type === "PARENT_CHILD").map((r) => r.source);
  const children = person.relationsAsSource.filter((r) => r.type === "PARENT_CHILD").map((r) => r.target);
  const spouses  = [
    ...person.relationsAsSource.filter((r) => r.type === "SPOUSE").map((r) => r.target),
    ...person.relationsAsTarget.filter((r) => r.type === "SPOUSE").map((r) => r.source),
  ];
  const customRelations = [
    ...person.relationsAsSource.filter((r) => r.type === "CUSTOM"),
    ...person.relationsAsTarget.filter((r) => r.type === "CUSTOM"),
  ];

  const genderInk: Record<string, string> = {
    MALE:    "#3F5B72",
    FEMALE:  "#8A4A52",
    OTHER:   "#5E5070",
    UNKNOWN: "#8A8378",
  };

  function PersonCard({ p, relation }: { p: any; relation?: string }) {
    const ink = genderInk[p.gender] || genderInk.UNKNOWN;
    return (
      <Link href={`/profil/${p.id}`}>
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] border border-ink-line hover:border-ink-soft/40 hover:bg-paper-warm transition-all duration-200 group">
          <div
            className="h-9 w-9 rounded-full border bg-paper-warm flex items-center justify-center text-xs font-serif font-semibold shrink-0"
            style={{ borderColor: ink, color: ink }}
          >
            {(p.firstName?.[0] || "") + (p.lastName?.[0] || "")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-ink">{p.firstName} {p.lastName}</p>
            {relation && <p className="text-xs text-ink-faint">{relation}</p>}
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
        </div>
      </Link>
    );
  }

  function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
    return (
      <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ink-line bg-paper-warm flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
          <h2 className="meta-label">{title}</h2>
        </div>
        <div className="p-5">{children}</div>
      </div>
    );
  }

  const personInk = genderInk[person.gender] || genderInk.UNKNOWN;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-10 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">

        {/* Back */}
        <Link href="/arbre" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Retour à l'arbre
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — identity card */}
          <div className="space-y-4">
            <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
              <div className="p-6">

                {/* Avatar */}
                <div className="flex justify-center mb-5">
                  {showPhoto && person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt={`${person.firstName} ${person.lastName}`}
                      className="h-24 w-24 rounded-full object-cover border border-ink-line shadow-paper"
                    />
                  ) : (
                    <div
                      className="h-24 w-24 rounded-full border bg-paper-warm flex items-center justify-center"
                      style={{ borderColor: personInk, color: personInk }}
                    >
                      <span className="text-2xl font-serif font-semibold">
                        {person.firstName[0]}{person.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="text-center mb-5">
                  <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-ink">{person.firstName}</h1>
                  <h2 className="font-serif text-xl font-semibold uppercase tracking-wider text-ink-soft">{person.lastName}</h2>
                  {person.nickname && (
                    <p className="text-sm text-ink-faint italic mt-1">« {person.nickname} »</p>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                    {person.gender !== "UNKNOWN" && (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] border bg-paper-warm"
                        style={{ borderColor: personInk, color: personInk }}
                      >
                        {person.gender === "MALE" ? "Homme" : person.gender === "FEMALE" ? "Femme" : "Autre"}
                      </span>
                    )}
                    {!isPremium && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] bg-paper-deep text-ink-soft">
                        <EyeOff className="h-2.5 w-2.5" strokeWidth={1.75} />
                        Données partielles
                      </span>
                    )}
                  </div>
                </div>

                {/* Linked user */}
                {person.user && (
                  <div className="text-center text-xs text-ink-faint border-t border-ink-line pt-4 mb-4">
                    <User className="h-3 w-3 inline mr-1" strokeWidth={1.75} />
                    Rattaché à un utilisateur
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {canEdit && (
                    <ProfileEditDialog
                      person={person}
                      canEditVisibility={session.user.role === "ADMIN"}
                    />
                  )}
                  {!person.userId && session?.user?.id && (
                    <LinkRequestButton personId={person.id} personName={`${person.firstName} ${person.lastName}`} />
                  )}
                  <ProfileFeedbackModal
                    personId={person.id}
                    personFirstName={person.firstName}
                    personLastName={person.lastName}
                    mode="ERROR"
                  />
                  <ProfileFeedbackModal
                    personId={person.id}
                    personFirstName={person.firstName}
                    personLastName={person.lastName}
                    mode="ADDITION"
                  />
                </div>
              </div>
            </div>

            {/* Premium upgrade prompt */}
            {!isPremium && (
              <div className="bg-card border border-ink-line rounded-[var(--radius)] p-5 shadow-paper">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-seal" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-ink">Données masquées</span>
                </div>
                <p className="text-xs text-ink-soft mb-4">
                  Passez à Premium pour accéder aux dates, photos et descriptions.
                </p>
                <Link href="/pricing">
                  <button className="w-full h-9 bg-seal text-paper text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-seal-bright active:scale-[0.98] transition-all duration-200">
                    <Crown className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Passer à Premium
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-4">

            {/* Infos */}
            <SectionCard icon={Calendar} title="Informations">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <dt className="meta-label mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" strokeWidth={1.75} /> Naissance
                  </dt>
                  <dd className="text-sm text-ink">
                    {showBirthDate && person.birthDate ? (
                      <span className="tabular">
                        {formatDate(person.birthDate)}
                        {age !== null && <span className="text-ink-faint ml-1">({age} ans)</span>}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-ink-faint text-xs">
                        <EyeOff className="h-3 w-3" strokeWidth={1.75} /> Information masquée
                      </span>
                    )}
                  </dd>
                </div>

                {!person.isAlive && (
                  <div>
                    <dt className="meta-label mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" strokeWidth={1.75} /> Décès
                    </dt>
                    <dd className="text-sm text-ink">
                      {showDeathDate && person.deathDate ? <span className="tabular">{formatDate(person.deathDate)}</span> : (
                        <span className="flex items-center gap-1 text-ink-faint text-xs">
                          <EyeOff className="h-3 w-3" strokeWidth={1.75} /> Information masquée
                        </span>
                      )}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="meta-label mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" strokeWidth={1.75} /> Lieu de naissance
                  </dt>
                  <dd className="text-sm text-ink">
                    {isPremium && person.birthPlace ? person.birthPlace : (
                      <span className="flex items-center gap-1 text-ink-faint text-xs">
                        <EyeOff className="h-3 w-3" strokeWidth={1.75} /> Information masquée
                      </span>
                    )}
                  </dd>
                </div>

                {!person.isAlive && (
                  <div>
                    <dt className="meta-label mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" strokeWidth={1.75} /> Lieu de décès
                    </dt>
                    <dd className="text-sm text-ink">
                      {isPremium && person.deathPlace ? person.deathPlace : (
                        <span className="flex items-center gap-1 text-ink-faint text-xs">
                          <EyeOff className="h-3 w-3" strokeWidth={1.75} /> Information masquée
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </SectionCard>

            {/* Profession */}
            {isPremium && person.profession && (
              <SectionCard icon={Briefcase} title="Profession">
                <p className="text-sm text-ink-soft">{person.profession}</p>
              </SectionCard>
            )}

            {/* Ville de résidence */}
            {isPremium && person.currentCity && (
              <SectionCard icon={MapPin} title="Habite à">
                <p className="text-sm text-ink-soft">{person.currentCity}</p>
              </SectionCard>
            )}

            {/* History */}
            {isPremium && person.description && (
              <SectionCard icon={User} title="Histoire">
                <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{person.description}</p>
              </SectionCard>
            )}

            {/* Parents */}
            {parents.length > 0 && (
              <SectionCard icon={Users} title="Parents">
                <div className="space-y-2">
                  {parents.map((p) => <PersonCard key={p.id} p={p} />)}
                </div>
              </SectionCard>
            )}

            {/* Spouses */}
            {spouses.length > 0 && (
              <SectionCard icon={Heart} title="Conjoint(e)s">
                <div className="space-y-2">
                  {spouses.map((p) => (
                    <PersonCard key={p.id} p={p} relation={showMarriage ? "Marié(e)" : undefined} />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Children */}
            {children.length > 0 && (
              <SectionCard icon={Baby} title={`Enfants (${children.length})`}>
                <div className="space-y-2">
                  {children.map((p) => <PersonCard key={p.id} p={p} />)}
                </div>
              </SectionCard>
            )}

            {/* Custom */}
            {customRelations.length > 0 && (
              <SectionCard icon={User} title="Relations personnalisées">
                <div className="space-y-2">
                  {customRelations.map((r) => {
                    const related = r.sourceId === person.id
                      ? ("target" in r ? r.target : null)
                      : ("source" in r ? r.source : null);
                    if (!related) return null;
                    return <PersonCard key={r.id} p={related} relation={r.label || "Relation"} />;
                  })}
                </div>
              </SectionCard>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
