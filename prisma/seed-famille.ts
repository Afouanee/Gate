/**
 * Seed complet « famille » — PURGE puis génère une base de démonstration réaliste.
 *
 * ⚠️ DESTRUCTIF : vide toutes les données (persons, relations, users, etc.)
 * puis recrée :
 *   1. un compte ADMIN propre
 *   2. une famille originaire de Pondichéry sur 4 générations
 *      (conjoints, fratries, dates, lieux, professions, descriptions, visibilité).
 *
 * Usage : npm run db:seed-famille
 *   (identifiants admin custom : ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed-famille)
 */
import { PrismaClient, Gender, RelationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gate.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin1234!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin Gate";

const d = (s: string) => new Date(s + "T00:00:00.000Z");

type PInput = {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birth?: string;
  death?: string;
  birthPlace?: string;
  deathPlace?: string;
  profession?: string;
  currentCity?: string;
  nickname?: string;
  description?: string;
  alive?: boolean;
};

/* ── Définition de la famille (4 générations, Pondichéry → France) ──────────── */

const PEOPLE: PInput[] = [
  // G1 — les aïeux (Pondichéry, début XXe)
  { id: "g1-abdul", firstName: "Abdul Rahman", lastName: "Maricar", gender: "MALE",
    birth: "1912-04-10", death: "1989-11-02", birthPlace: "Pondichéry, Inde", deathPlace: "Pondichéry, Inde",
    profession: "Négociant en textile", nickname: "Dada",
    description: "Patriarche de la famille. Tenait une échoppe de tissus dans le quartier musulman de Pondichéry.", alive: false },
  { id: "g1-fatima", firstName: "Fatima", lastName: "Bibi", gender: "FEMALE",
    birth: "1918-08-21", death: "1994-03-15", birthPlace: "Karaikal, Inde", deathPlace: "Pondichéry, Inde",
    profession: "Au foyer", description: "Épouse d'Abdul Rahman. Réputée pour ses biryanis lors des fêtes de l'Aïd.", alive: false },

  // G2 — les enfants d'Abdul & Fatima
  { id: "g2-mohamed", firstName: "Mohamed Yusuf", lastName: "Maricar", gender: "MALE",
    birth: "1942-01-30", death: "2018-06-12", birthPlace: "Pondichéry, Inde", deathPlace: "Marseille, France",
    profession: "Instituteur", currentCity: "Marseille",
    description: "Premier de la famille à émigrer en France, en 1968. A enseigné le français à Marseille.", alive: false },
  { id: "g2-zoubida", firstName: "Zoubida", lastName: "Sheikh", gender: "FEMALE",
    birth: "1948-05-17", birthPlace: "Pondichéry, Inde", profession: "Couturière", currentCity: "Marseille",
    description: "Épouse de Mohamed Yusuf. Arrivée en France en 1969.", alive: true },
  { id: "g2-ahmed", firstName: "Ahmed", lastName: "Maricar", gender: "MALE",
    birth: "1945-09-03", birthPlace: "Pondichéry, Inde", profession: "Commerçant", currentCity: "Pondichéry",
    description: "Frère cadet de Mohamed. Est resté à Pondichéry pour reprendre l'échoppe familiale.", alive: true },
  { id: "g2-aisha", firstName: "Aisha", lastName: "Maricar", gender: "FEMALE",
    birth: "1950-12-25", birthPlace: "Pondichéry, Inde", profession: "Sage-femme", currentCity: "Chennai",
    description: "Sœur de Mohamed et Ahmed. Installée à Chennai.", alive: true },

  // G3 — enfants de Mohamed Yusuf & Zoubida (en France)
  { id: "g3-karim", firstName: "Karim", lastName: "Maricar", gender: "MALE",
    birth: "1972-03-14", birthPlace: "Marseille, France", profession: "Ingénieur", currentCity: "Lyon",
    description: "Né en France. Ingénieur en informatique à Lyon.", alive: true },
  { id: "g3-leila", firstName: "Leïla", lastName: "Maricar", gender: "FEMALE",
    birth: "1975-07-09", birthPlace: "Marseille, France", profession: "Médecin", currentCity: "Paris",
    nickname: "Lily", description: "Médecin généraliste à Paris.", alive: true },
  { id: "g3-samir", firstName: "Samir", lastName: "Maricar", gender: "MALE",
    birth: "1979-11-28", birthPlace: "Marseille, France", profession: "Restaurateur", currentCity: "Marseille",
    description: "A ouvert un restaurant de cuisine indo-française à Marseille.", alive: true },

  // Conjoints G3
  { id: "g3-nadia", firstName: "Nadia", lastName: "Benali", gender: "FEMALE",
    birth: "1974-02-20", birthPlace: "Lyon, France", profession: "Architecte", currentCity: "Lyon",
    description: "Épouse de Karim.", alive: true },
  { id: "g3-thomas", firstName: "Thomas", lastName: "Lefèvre", gender: "MALE",
    birth: "1973-06-05", birthPlace: "Paris, France", profession: "Avocat", currentCity: "Paris",
    description: "Époux de Leïla.", alive: true },

  // G4 — petits-enfants
  { id: "g4-ines", firstName: "Inès", lastName: "Maricar", gender: "FEMALE",
    birth: "2001-09-12", birthPlace: "Lyon, France", profession: "Étudiante", currentCity: "Lyon",
    description: "Fille de Karim et Nadia. Étudiante en design.", alive: true },
  { id: "g4-adam", firstName: "Adam", lastName: "Maricar", gender: "MALE",
    birth: "2004-04-30", birthPlace: "Lyon, France", profession: "Lycéen", currentCity: "Lyon",
    description: "Fils de Karim et Nadia.", alive: true },
  { id: "g4-sofia", firstName: "Sofia", lastName: "Lefèvre", gender: "FEMALE",
    birth: "2003-01-18", birthPlace: "Paris, France", profession: "Étudiante", currentCity: "Paris",
    description: "Fille de Leïla et Thomas.", alive: true },
];

// Couples (SPOUSE)
const SPOUSES: { a: string; b: string; marriage?: string }[] = [
  { a: "g1-abdul", b: "g1-fatima", marriage: "1936-05-10" },
  { a: "g2-mohamed", b: "g2-zoubida", marriage: "1968-08-22" },
  { a: "g3-karim", b: "g3-nadia", marriage: "1998-06-13" },
  { a: "g3-leila", b: "g3-thomas", marriage: "2000-09-02" },
];

// Filiations (PARENT_CHILD : parent → enfant)
const CHILDREN: { parents: string[]; child: string }[] = [
  // G2 enfants d'Abdul & Fatima
  { parents: ["g1-abdul", "g1-fatima"], child: "g2-mohamed" },
  { parents: ["g1-abdul", "g1-fatima"], child: "g2-ahmed" },
  { parents: ["g1-abdul", "g1-fatima"], child: "g2-aisha" },
  // G3 enfants de Mohamed & Zoubida
  { parents: ["g2-mohamed", "g2-zoubida"], child: "g3-karim" },
  { parents: ["g2-mohamed", "g2-zoubida"], child: "g3-leila" },
  { parents: ["g2-mohamed", "g2-zoubida"], child: "g3-samir" },
  // G4
  { parents: ["g3-karim", "g3-nadia"], child: "g4-ines" },
  { parents: ["g3-karim", "g3-nadia"], child: "g4-adam" },
  { parents: ["g3-leila", "g3-thomas"], child: "g4-sofia" },
];

// Relations personnalisées (CUSTOM)
const CUSTOM: { source: string; target: string; label: string }[] = [
  { source: "g2-aisha", target: "g3-karim", label: "Tante / Neveu" },
];

async function purge() {
  // Ordre : enfants d'abord (FK). Les relations ont onDelete Cascade sur Person,
  // mais on nettoie explicitement tout pour repartir vierge.
  await prisma.$transaction([
    prisma.auditLog.deleteMany({}),
    prisma.consentLog.deleteMany({}),
    prisma.report.deleteMany({}),
    prisma.linkRequest.deleteMany({}),
    prisma.relation.deleteMany({}),
    prisma.emailVerificationCode.deleteMany({}),
    prisma.subscription.deleteMany({}),
    prisma.session.deleteMany({}),
    prisma.account.deleteMany({}),
    prisma.verificationToken.deleteMany({}),
    prisma.person.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
}

async function main() {
  console.log("🧹 Purge de la base…");
  await purge();

  console.log("👤 Création du compte admin…");
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hash,
      role: "ADMIN",
      emailVerified: new Date(),
      name: ADMIN_NAME,
    },
  });

  console.log("👪 Création des personnes…");
  for (const p of PEOPLE) {
    await prisma.person.create({
      data: {
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        birthDate: p.birth ? d(p.birth) : null,
        deathDate: p.death ? d(p.death) : null,
        birthPlace: p.birthPlace ?? null,
        deathPlace: p.deathPlace ?? null,
        profession: p.profession ?? null,
        currentCity: p.currentCity ?? null,
        nickname: p.nickname ?? null,
        description: p.description ?? null,
        isAlive: p.alive ?? true,
        // Visibilité ouverte pour la démo (tout est consultable).
        showBirthDate: true,
        showDeathDate: true,
        showMarriage: true,
        showPhoto: true,
        showPersonalData: true,
      },
    });
  }

  console.log("💍 Création des unions…");
  for (const s of SPOUSES) {
    await prisma.relation.create({
      data: {
        sourceId: s.a,
        targetId: s.b,
        type: RelationType.SPOUSE,
        marriageDate: s.marriage ? d(s.marriage) : null,
      },
    });
  }

  console.log("🌿 Création des filiations…");
  for (const c of CHILDREN) {
    for (const parent of c.parents) {
      await prisma.relation.create({
        data: {
          sourceId: parent,
          targetId: c.child,
          type: RelationType.PARENT_CHILD,
        },
      });
    }
  }

  console.log("🔗 Relations personnalisées…");
  for (const r of CUSTOM) {
    await prisma.relation.create({
      data: {
        sourceId: r.source,
        targetId: r.target,
        type: RelationType.CUSTOM,
        label: r.label,
      },
    });
  }

  const [pc, rc] = await Promise.all([prisma.person.count(), prisma.relation.count()]);
  console.log(`\n✅ Terminé : ${pc} personnes, ${rc} relations.`);
  console.log(`   Admin : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}\n`);
}

main()
  .catch((e) => {
    console.error("Erreur seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
