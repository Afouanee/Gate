import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, getAge } from "@/lib/utils";
import Link from "next/link";
import {
  Calendar, MapPin, User, Heart, Users, Baby, ArrowLeft,
  EyeOff, Crown, Flag, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportModal } from "@/components/profile/report-modal";
import { LinkRequestButton } from "@/components/profile/link-request-button";

export default async function ProfilPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireSession();
  const isPremium = session.user.role === "PREMIUM" || session.user.role === "ADMIN";
  const isAdmin = session.user.role === "ADMIN";

  const person = await prisma.person.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true } },
      relationsAsSource: {
        include: {
          target: {
            select: {
              id: true, firstName: true, lastName: true,
              gender: true, photoUrl: true, showPhoto: true, isAlive: true,
            },
          },
        },
      },
      relationsAsTarget: {
        include: {
          source: {
            select: {
              id: true, firstName: true, lastName: true,
              gender: true, photoUrl: true, showPhoto: true, isAlive: true,
            },
          },
        },
      },
    },
  });

  if (!person) notFound();

  const showBirthDate = isPremium || person.showBirthDate;
  const showDeathDate = isPremium || person.showDeathDate;
  const showPhoto = isPremium || person.showPhoto;
  const showPersonalData = isPremium || person.showPersonalData;
  const showMarriage = isPremium || person.showMarriage;

  const age = showBirthDate ? getAge(person.birthDate, person.deathDate) : null;

  const parents = person.relationsAsTarget
    .filter((r) => r.type === "PARENT_CHILD")
    .map((r) => r.source);

  const children = person.relationsAsSource
    .filter((r) => r.type === "PARENT_CHILD")
    .map((r) => r.target);

  const spouses = [
    ...person.relationsAsSource.filter((r) => r.type === "SPOUSE").map((r) => r.target),
    ...person.relationsAsTarget.filter((r) => r.type === "SPOUSE").map((r) => r.source),
  ];

  const customRelations = [
    ...person.relationsAsSource.filter((r) => r.type === "CUSTOM"),
    ...person.relationsAsTarget.filter((r) => r.type === "CUSTOM"),
  ];

  function PersonCard({ p, relation }: { p: any; relation?: string }) {
    return (
      <Link href={`/profil/${p.id}`}>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gate-border hover:border-gold-800/50 hover:bg-gate-card transition-all group">
          <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs font-bold font-heading shrink-0 ${
            p.gender === "MALE" ? "border-blue-700/60 bg-blue-900/20 text-blue-300" :
            p.gender === "FEMALE" ? "border-pink-700/60 bg-pink-900/20 text-pink-300" :
            "border-gate-border bg-gate-card text-muted-foreground"
          }`}>
            {(p.firstName?.[0] || "") + (p.lastName?.[0] || "")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate group-hover:text-gold-400 transition-colors">
              {p.firstName} {p.lastName}
            </p>
            {relation && <p className="text-xs text-muted-foreground">{relation}</p>}
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back */}
        <Link href="/arbre" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'arbre
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — identity */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {/* Photo */}
                <div className="flex justify-center mb-4">
                  {showPhoto && person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt={`${person.firstName} ${person.lastName}`}
                      className="h-28 w-28 rounded-full object-cover border-2 border-gold-800/50 shadow-lg"
                    />
                  ) : (
                    <div className={`h-28 w-28 rounded-full border-2 flex items-center justify-center ${
                      person.gender === "MALE" ? "border-blue-700/60 bg-blue-900/20" :
                      person.gender === "FEMALE" ? "border-pink-700/60 bg-pink-900/20" :
                      "border-gate-border bg-gate-card"
                    }`}>
                      <span className={`text-3xl font-black font-heading ${
                        person.gender === "MALE" ? "text-blue-300" :
                        person.gender === "FEMALE" ? "text-pink-300" :
                        "text-muted-foreground"
                      }`}>
                        {person.firstName[0]}{person.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-black font-heading leading-tight">
                    {person.firstName}
                  </h1>
                  <h2 className="text-xl font-black font-heading text-gold-400 uppercase tracking-wide">
                    {person.lastName}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                    <Badge variant={person.isAlive ? "default" : "secondary"}>
                      {person.isAlive ? "En vie" : "Décédé(e)"}
                    </Badge>
                    {person.gender !== "UNKNOWN" && (
                      <Badge variant="outline">
                        {person.gender === "MALE" ? "Homme" : person.gender === "FEMALE" ? "Femme" : "Autre"}
                      </Badge>
                    )}
                    {!isPremium && (
                      <Badge variant="free" className="gap-1">
                        <EyeOff className="h-2.5 w-2.5" />
                        Partiel
                      </Badge>
                    )}
                  </div>
                </div>

                {/* User linked */}
                {person.user && (
                  <div className="text-center text-xs text-muted-foreground border-t border-gate-border pt-3">
                    <User className="h-3 w-3 inline mr-1" />
                    Rattaché à un utilisateur
                  </div>
                )}

                {/* Buttons */}
                <div className="mt-4 space-y-2">
                  {!person.userId && session?.user?.id && (
                    <LinkRequestButton personId={person.id} personName={`${person.firstName} ${person.lastName}`} />
                  )}
                  <ReportModal
                    personId={person.id}
                    personFirstName={person.firstName}
                    personLastName={person.lastName}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Premium upgrade */}
            {!isPremium && (
              <Card className="border-gold-800/30">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-gold-500" />
                    <span className="text-sm font-semibold">Données masquées</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Passez à Premium pour voir les dates, photos et descriptions.
                  </p>
                  <Link href="/pricing">
                    <Button size="sm" variant="premium" className="w-full gap-1.5">
                      <Crown className="h-3.5 w-3.5" />
                      Passer à Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Personal details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date de naissance
                    </dt>
                    <dd className="text-sm">
                      {showBirthDate && person.birthDate ? (
                        <span>
                          {formatDate(person.birthDate)}
                          {age !== null && <span className="text-muted-foreground ml-1">({age} ans)</span>}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <EyeOff className="h-3 w-3" />
                          Information masquée
                        </span>
                      )}
                    </dd>
                  </div>

                  {!person.isAlive && (
                    <div>
                      <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date de décès
                      </dt>
                      <dd className="text-sm">
                        {showDeathDate && person.deathDate ? (
                          formatDate(person.deathDate)
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <EyeOff className="h-3 w-3" />
                            Information masquée
                          </span>
                        )}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Lieu de naissance
                    </dt>
                    <dd className="text-sm">
                      {isPremium && person.birthPlace ? person.birthPlace : (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <EyeOff className="h-3 w-3" />
                          Information masquée
                        </span>
                      )}
                    </dd>
                  </div>

                  {!person.isAlive && (
                    <div>
                      <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Lieu de décès
                      </dt>
                      <dd className="text-sm">
                        {isPremium && person.deathPlace ? person.deathPlace : (
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <EyeOff className="h-3 w-3" />
                            Information masquée
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Description */}
            {isPremium && person.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Histoire</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {person.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Relations */}
            {parents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-gold-500" />
                    Parents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {parents.map((p) => <PersonCard key={p.id} p={p} />)}
                  </div>
                </CardContent>
              </Card>
            )}

            {spouses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-gold-500" />
                    Conjoint(e)s
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {spouses.map((p) => (
                      <PersonCard key={p.id} p={p} relation={showMarriage ? "Marié(e)" : undefined} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Baby className="h-4 w-4 text-gold-500" />
                    Enfants ({children.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {children.map((p) => <PersonCard key={p.id} p={p} />)}
                  </div>
                </CardContent>
              </Card>
            )}

            {customRelations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Relations personnalisées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {customRelations.map((r) => {
                      const related = r.sourceId === person.id ? r.target : r.source;
                      return <PersonCard key={r.id} p={related} relation={r.label || "Relation custom"} />;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
