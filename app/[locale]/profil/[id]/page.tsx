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

  const genderAvatar: Record<string, string> = {
    MALE:    "border-blue-200 bg-blue-50 text-blue-700",
    FEMALE:  "border-pink-200 bg-pink-50 text-pink-700",
    OTHER:   "border-purple-200 bg-purple-50 text-purple-700",
    UNKNOWN: "border-zinc-200 bg-zinc-50 text-zinc-500",
  };

  function PersonCard({ p, relation }: { p: any; relation?: string }) {
    return (
      <Link href={`/profil/${p.id}`}>
        <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all group">
          <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs font-bold font-heading shrink-0 ${genderAvatar[p.gender] || genderAvatar.UNKNOWN}`}>
            {(p.firstName?.[0] || "") + (p.lastName?.[0] || "")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-zinc-900">{p.firstName} {p.lastName}</p>
            {relation && <p className="text-xs text-zinc-400">{relation}</p>}
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
    return (
      <div className="border border-zinc-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-zinc-400" />
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">{title}</h2>
        </div>
        <div className="p-5">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-10 px-6">
      <div className="container mx-auto max-w-4xl">

        {/* Back */}
        <Link href="/arbre" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'arbre
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — identity card */}
          <div className="space-y-4">
            <div className="border border-zinc-100 rounded-2xl overflow-hidden">
              <div className="p-6">

                {/* Avatar */}
                <div className="flex justify-center mb-5">
                  {showPhoto && person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt={`${person.firstName} ${person.lastName}`}
                      className="h-24 w-24 rounded-full object-cover border-2 border-zinc-200 shadow-sm"
                    />
                  ) : (
                    <div className={`h-24 w-24 rounded-full border-2 flex items-center justify-center ${genderAvatar[person.gender] || genderAvatar.UNKNOWN}`}>
                      <span className="text-2xl font-black font-heading">
                        {person.firstName[0]}{person.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="text-center mb-5">
                  <h1 className="text-2xl font-black font-heading leading-tight tracking-tight">{person.firstName}</h1>
                  <h2 className="text-xl font-black font-heading uppercase tracking-wider text-zinc-500">{person.lastName}</h2>
                  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                    {person.gender !== "UNKNOWN" && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${genderAvatar[person.gender]}`}>
                        {person.gender === "MALE" ? "Homme" : person.gender === "FEMALE" ? "Femme" : "Autre"}
                      </span>
                    )}
                    {!isPremium && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-zinc-200 text-zinc-400">
                        <EyeOff className="h-2.5 w-2.5" />
                        Données partielles
                      </span>
                    )}
                  </div>
                </div>

                {/* Linked user */}
                {person.user && (
                  <div className="text-center text-xs text-zinc-400 border-t border-zinc-100 pt-4 mb-4">
                    <User className="h-3 w-3 inline mr-1" />
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
              <div className="border border-zinc-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-semibold text-zinc-900">Données masquées</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Passez à Premium pour accéder aux dates, photos et descriptions.
                </p>
                <Link href="/pricing">
                  <button className="w-full h-9 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors">
                    <Crown className="h-3.5 w-3.5" />
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
                  <dt className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Naissance
                  </dt>
                  <dd className="text-sm text-zinc-900">
                    {showBirthDate && person.birthDate ? (
                      <span>
                        {formatDate(person.birthDate)}
                        {age !== null && <span className="text-zinc-400 ml-1">({age} ans)</span>}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-zinc-300 text-xs">
                        <EyeOff className="h-3 w-3" /> Information masquée
                      </span>
                    )}
                  </dd>
                </div>

                {!person.isAlive && (
                  <div>
                    <dt className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Décès
                    </dt>
                    <dd className="text-sm text-zinc-900">
                      {showDeathDate && person.deathDate ? formatDate(person.deathDate) : (
                        <span className="flex items-center gap-1 text-zinc-300 text-xs">
                          <EyeOff className="h-3 w-3" /> Information masquée
                        </span>
                      )}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Lieu de naissance
                  </dt>
                  <dd className="text-sm text-zinc-900">
                    {isPremium && person.birthPlace ? person.birthPlace : (
                      <span className="flex items-center gap-1 text-zinc-300 text-xs">
                        <EyeOff className="h-3 w-3" /> Information masquée
                      </span>
                    )}
                  </dd>
                </div>

                {!person.isAlive && (
                  <div>
                    <dt className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Lieu de décès
                    </dt>
                    <dd className="text-sm text-zinc-900">
                      {isPremium && person.deathPlace ? person.deathPlace : (
                        <span className="flex items-center gap-1 text-zinc-300 text-xs">
                          <EyeOff className="h-3 w-3" /> Information masquée
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
                <p className="text-sm text-zinc-600">{person.profession}</p>
              </SectionCard>
            )}

            {/* History */}
            {isPremium && person.description && (
              <SectionCard icon={User} title="Histoire">
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{person.description}</p>
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
