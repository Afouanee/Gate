import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper pour créer une personne
function p(
  id: string,
  firstName: string,
  lastName: string,
  gender: "MALE" | "FEMALE",
  birth: string,
  opts: {
    alive?: boolean;
    death?: string;
    birthPlace?: string;
    deathPlace?: string;
    profession?: string;
    nickname?: string;
    currentCity?: string;
    description?: string;
  } = {}
) {
  return prisma.person.upsert({
    where: { id },
    update: {},
    create: {
      id,
      firstName,
      lastName,
      gender,
      birthDate: new Date(birth),
      isAlive: opts.alive ?? true,
      deathDate: opts.death ? new Date(opts.death) : null,
      birthPlace: opts.birthPlace ?? null,
      deathPlace: opts.deathPlace ?? null,
      profession: opts.profession ?? null,
      nickname: opts.nickname ?? null,
      currentCity: opts.currentCity ?? null,
      description: opts.description ?? null,
      showBirthDate: true,
      showDeathDate: true,
      showPhoto: true,
      showPersonalData: true,
      showMarriage: true,
    },
  });
}

// Helper relation
function rel(
  sourceId: string,
  targetId: string,
  type: "PARENT_CHILD" | "SPOUSE" | "CUSTOM",
  opts: { marriageDate?: string; divorceDate?: string; label?: string } = {}
) {
  return prisma.relation.upsert({
    where: { sourceId_targetId_type: { sourceId, targetId, type } },
    update: {},
    create: {
      sourceId,
      targetId,
      type,
      marriageDate: opts.marriageDate ? new Date(opts.marriageDate) : null,
      divorceDate: opts.divorceDate ? new Date(opts.divorceDate) : null,
      label: opts.label ?? null,
    },
  });
}

async function main() {
  console.log("🌱 Seeding Gate database...");

  // ─── Admin ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@Gate2024!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gate.afouanee.dev" },
    update: {},
    create: {
      name: "Administrateur Gate",
      email: "admin@gate.afouanee.dev",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // GÉNÉRATION 1 — Arrière-grands-parents
  // ═══════════════════════════════════════════════════════════════════════════

  // Branche paternelle (origine Pondichéry)
  const [ramasamy, kamalam] = await Promise.all([
    p("g1-ramasamy", "Ramasamy", "Pillai", "MALE", "1920-03-12", {
      alive: false, death: "1991-07-04",
      birthPlace: "Pondichéry, Inde",
      deathPlace: "Pondichéry, Inde",
      profession: "Agriculteur",
      nickname: "Thatha",
      description: "Patriarche de la famille Pillai, cultivateur de riz à Pondichéry.",
    }),
    p("g1-kamalam", "Kamalam", "Pillai", "FEMALE", "1924-09-28", {
      alive: false, death: "1998-02-15",
      birthPlace: "Pondichéry, Inde",
      deathPlace: "Pondichéry, Inde",
      nickname: "Paati",
      description: "Femme au foyer, connue dans tout le quartier pour ses douceurs tamoules.",
    }),
  ]);

  // Branche maternelle (origine Île-de-France)
  const [marcel, gilberte] = await Promise.all([
    p("g1-marcel", "Marcel", "Fontaine", "MALE", "1918-11-05", {
      alive: false, death: "1985-03-22",
      birthPlace: "Versailles, France",
      deathPlace: "Créteil, France",
      profession: "Ouvrier métallurgiste",
      nickname: "Pépé Marcel",
    }),
    p("g1-gilberte", "Gilberte", "Fontaine", "FEMALE", "1922-06-14", {
      alive: false, death: "2001-12-01",
      birthPlace: "Ivry-sur-Seine, France",
      deathPlace: "Créteil, France",
      nickname: "Mémère",
      profession: "Couturière",
    }),
  ]);

  // Branche belle-famille (origine algérienne / musulmane)
  const [abdelkader, fatima] = await Promise.all([
    p("g1-abdelkader", "Abdelkader", "Benali", "MALE", "1922-04-17", {
      alive: false, death: "1994-08-30",
      birthPlace: "Tlemcen, Algérie",
      deathPlace: "Aubervilliers, France",
      profession: "Maçon",
      nickname: "Si Abdelkader",
      description: "Arrivé en France en 1952, a fondé sa famille à Aubervilliers.",
    }),
    p("g1-fatima", "Fatima", "Benali", "FEMALE", "1928-12-03", {
      alive: false, death: "2005-01-19",
      birthPlace: "Tlemcen, Algérie",
      deathPlace: "Aubervilliers, France",
      nickname: "Yemma",
    }),
  ]);

  console.log("✅ Génération 1 créée");

  // ═══════════════════════════════════════════════════════════════════════════
  // GÉNÉRATION 2 — Grands-parents
  // ═══════════════════════════════════════════════════════════════════════════

  const [suresh, claudette, mustapha, zorah, rajesh] = await Promise.all([
    p("g2-suresh", "Suresh", "Pillai", "MALE", "1948-06-20", {
      alive: false, death: "2015-09-11",
      birthPlace: "Pondichéry, Inde",
      deathPlace: "Paris 13e, France",
      profession: "Commerçant",
      nickname: "Papy Suresh",
      currentCity: "Paris",
      description: "Fils de Ramasamy, arrivé en France à 22 ans. A tenu une épicerie rue de la Glacière pendant 30 ans.",
    }),
    p("g2-claudette", "Claudette", "Pillai", "FEMALE", "1951-02-08", {
      alive: true,
      birthPlace: "Créteil, France",
      currentCity: "Paris 13e",
      profession: "Institutrice retraitée",
      nickname: "Mamie Claudette",
      description: "Fille de Marcel et Gilberte Fontaine. A enseigné 35 ans à l'école Kellermann.",
    }),
    p("g2-mustapha", "Mustapha", "Benali", "MALE", "1952-10-14", {
      alive: false, death: "2019-03-07",
      birthPlace: "Aubervilliers, France",
      deathPlace: "Bondy, France",
      profession: "Chauffeur de bus RATP",
      nickname: "Tonton Mustapha",
    }),
    p("g2-zorah", "Zorah", "Benali", "FEMALE", "1955-07-29", {
      alive: true,
      birthPlace: "Aubervilliers, France",
      currentCity: "Bondy",
      profession: "Aide-soignante retraitée",
      nickname: "Tata Zorah",
    }),
    // Frère de Suresh resté à Pondichéry
    p("g2-rajesh", "Rajesh", "Pillai", "MALE", "1950-11-30", {
      alive: true,
      birthPlace: "Pondichéry, Inde",
      currentCity: "Pondichéry",
      profession: "Médecin",
      nickname: "Oncle Rajesh",
    }),
  ]);

  console.log("✅ Génération 2 créée");

  // ═══════════════════════════════════════════════════════════════════════════
  // GÉNÉRATION 3 — Parents, oncles, tantes
  // ═══════════════════════════════════════════════════════════════════════════

  const [
    arjun,      // fils de Suresh + Claudette — personnage central
    priya,      // fille de Suresh + Claudette
    karine,     // 1ère femme d'Arjun (divorcée)
    yasmine,    // 2ème femme d'Arjun
    nadia,      // fille de Mustapha + Zorah, belle-sœur d'Arjun
    karim,      // fils de Mustapha + Zorah
    leila,      // fille de Mustapha + Zorah
    davidP,     // mari de Priya
    anousha,    // femme de Karim
  ] = await Promise.all([
    p("g3-arjun", "Arjun", "Pillai", "MALE", "1975-04-03", {
      alive: true,
      birthPlace: "Paris 13e, France",
      currentCity: "Montreuil",
      profession: "Ingénieur informatique",
      nickname: "Arju",
      description: "Fils aîné de Suresh et Claudette. Marié deux fois, père de quatre enfants.",
    }),
    p("g3-priya", "Priya", "Pillai", "FEMALE", "1978-09-17", {
      alive: true,
      birthPlace: "Paris 13e, France",
      currentCity: "Vincennes",
      profession: "Architecte",
      nickname: "Pri",
    }),
    p("g3-karine", "Karine", "Moreau", "FEMALE", "1976-01-25", {
      alive: true,
      birthPlace: "Nantes, France",
      currentCity: "Ivry-sur-Seine",
      profession: "Infirmière",
      description: "Première femme d'Arjun. Divorcée en 2008. Reste proche des enfants.",
    }),
    p("g3-yasmine", "Yasmine", "Benali", "FEMALE", "1982-05-11", {
      alive: true,
      birthPlace: "Bondy, France",
      currentCity: "Montreuil",
      profession: "Graphiste",
      nickname: "Yass",
      description: "Deuxième femme d'Arjun, cousine de Karim. Mariée depuis 2011.",
    }),
    p("g3-nadia", "Nadia", "Benali", "FEMALE", "1980-03-22", {
      alive: true,
      birthPlace: "Bondy, France",
      currentCity: "Noisy-le-Grand",
      profession: "Professeure de français",
      nickname: "Nadi",
    }),
    p("g3-karim", "Karim", "Benali", "MALE", "1977-08-06", {
      alive: true,
      birthPlace: "Bondy, France",
      currentCity: "Pantin",
      profession: "Auto-entrepreneur, plomberie",
      nickname: "Kak",
    }),
    p("g3-leila", "Leïla", "Benali", "FEMALE", "1983-12-19", {
      alive: true,
      birthPlace: "Bondy, France",
      currentCity: "Paris 20e",
      profession: "Avocate",
      nickname: "Lili",
    }),
    p("g3-david", "David", "Perrin", "MALE", "1975-07-04", {
      alive: true,
      birthPlace: "Lyon, France",
      currentCity: "Vincennes",
      profession: "Photographe",
    }),
    p("g3-anousha", "Anousha", "Krishnan", "FEMALE", "1979-02-28", {
      alive: true,
      birthPlace: "Pondichéry, Inde",
      currentCity: "Pantin",
      profession: "Sage-femme",
      nickname: "Anu",
      description: "Originaire de Pondichéry, venue en France pour ses études de médecine.",
    }),
  ]);

  console.log("✅ Génération 3 créée");

  // ═══════════════════════════════════════════════════════════════════════════
  // GÉNÉRATION 4 — Enfants (cousins, demi-frères, etc.)
  // ═══════════════════════════════════════════════════════════════════════════

  const [
    // Enfants d'Arjun + Karine (avant divorce)
    rayan,
    inaya,
    // Enfants d'Arjun + Yasmine (après remariage)
    samir,
    mila,
    // Enfant de Karine avec nouveau compagnon (demi-frère de Rayan)
    theo,
    // Enfants de Priya + David
    lilou,
    noe,
    // Enfants de Karim + Anousha
    amine,
    sofia,
    // Enfants de Nadia (mère célibataire)
    imrane,
    // Enfant de Leïla
    adam,
    // Enfants de Rajesh (Pondichéry)
    kavya,
    vikram,
  ] = await Promise.all([
    p("g4-rayan", "Rayan", "Pillai", "MALE", "2001-06-14", {
      alive: true,
      birthPlace: "Paris 13e, France",
      currentCity: "Montreuil",
      profession: "Étudiant en BTS informatique",
      nickname: "Ray",
    }),
    p("g4-inaya", "Inaya", "Pillai", "FEMALE", "2003-09-02", {
      alive: true,
      birthPlace: "Paris 13e, France",
      currentCity: "Ivry-sur-Seine",
      profession: "Lycéenne",
    }),
    p("g4-samir", "Samir", "Pillai", "MALE", "2012-03-18", {
      alive: true,
      birthPlace: "Montreuil, France",
      currentCity: "Montreuil",
    }),
    p("g4-mila", "Mila", "Pillai", "FEMALE", "2015-11-07", {
      alive: true,
      birthPlace: "Montreuil, France",
      currentCity: "Montreuil",
      nickname: "Miloune",
    }),
    p("g4-theo", "Théo", "Garnier", "MALE", "2010-04-25", {
      alive: true,
      birthPlace: "Ivry-sur-Seine, France",
      currentCity: "Ivry-sur-Seine",
      description: "Demi-frère de Rayan et Inaya côté maternel. Fils de Karine et Julien Garnier.",
    }),
    p("g4-lilou", "Lilou", "Perrin", "FEMALE", "2005-08-30", {
      alive: true,
      birthPlace: "Vincennes, France",
      currentCity: "Vincennes",
      nickname: "Liloupette",
    }),
    p("g4-noe", "Noé", "Perrin", "MALE", "2008-01-12", {
      alive: true,
      birthPlace: "Vincennes, France",
      currentCity: "Vincennes",
    }),
    p("g4-amine", "Amine", "Benali", "MALE", "2004-05-09", {
      alive: true,
      birthPlace: "Pantin, France",
      currentCity: "Pantin",
      profession: "Apprenti cuisinier",
    }),
    p("g4-sofia", "Sofia", "Benali", "FEMALE", "2007-10-21", {
      alive: true,
      birthPlace: "Pantin, France",
      currentCity: "Pantin",
    }),
    p("g4-imrane", "Imrane", "Benali", "MALE", "2006-07-17", {
      alive: true,
      birthPlace: "Noisy-le-Grand, France",
      currentCity: "Noisy-le-Grand",
      description: "Fils de Nadia Benali. Père absent.",
    }),
    p("g4-adam", "Adam", "Benali", "MALE", "2014-02-03", {
      alive: true,
      birthPlace: "Paris 20e, France",
      currentCity: "Paris 20e",
    }),
    p("g4-kavya", "Kavya", "Pillai", "FEMALE", "1998-08-15", {
      alive: true,
      birthPlace: "Pondichéry, Inde",
      currentCity: "Pondichéry",
      profession: "Étudiante en médecine",
    }),
    p("g4-vikram", "Vikram", "Pillai", "MALE", "2001-03-27", {
      alive: true,
      birthPlace: "Pondichéry, Inde",
      currentCity: "Chennai, Inde",
      profession: "Développeur web",
    }),
  ]);

  // Compagnon de Karine (beau-père de Rayan/Inaya)
  const julien = await p("g3-julien", "Julien", "Garnier", "MALE", "1974-11-08", {
    alive: true,
    birthPlace: "Bordeaux, France",
    currentCity: "Ivry-sur-Seine",
    profession: "Technicien de maintenance",
  });

  // Femme de Rajesh
  const meena = await p("g2-meena", "Meena", "Pillai", "FEMALE", "1952-04-06", {
    alive: true,
    birthPlace: "Chennai, Inde",
    currentCity: "Pondichéry",
    profession: "Professeure de danse Bharatanatyam",
    nickname: "Meena Amma",
  });

  // Mari de Leïla
  const mehdi = await p("g3-mehdi", "Mehdi", "Bouzid", "MALE", "1981-09-14", {
    alive: true,
    birthPlace: "Évry, France",
    currentCity: "Paris 20e",
    profession: "Comptable",
  });

  console.log("✅ Génération 4 créée");

  // ═══════════════════════════════════════════════════════════════════════════
  // RELATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  await Promise.all([
    // ── G1 : mariages ──────────────────────────────────────────────────────
    rel("g1-ramasamy",   "g1-kamalam",   "SPOUSE", { marriageDate: "1943-01-10" }),
    rel("g1-marcel",     "g1-gilberte",  "SPOUSE", { marriageDate: "1945-08-25" }),
    rel("g1-abdelkader", "g1-fatima",    "SPOUSE", { marriageDate: "1950-05-20" }),

    // ── G1 → G2 : filiation ────────────────────────────────────────────────
    rel("g1-ramasamy",   "g2-suresh",    "PARENT_CHILD"),
    rel("g1-kamalam",    "g2-suresh",    "PARENT_CHILD"),
    rel("g1-ramasamy",   "g2-rajesh",    "PARENT_CHILD"),
    rel("g1-kamalam",    "g2-rajesh",    "PARENT_CHILD"),
    rel("g1-marcel",     "g2-claudette", "PARENT_CHILD"),
    rel("g1-gilberte",   "g2-claudette", "PARENT_CHILD"),
    rel("g1-abdelkader", "g2-mustapha",  "PARENT_CHILD"),
    rel("g1-fatima",     "g2-mustapha",  "PARENT_CHILD"),
    rel("g1-abdelkader", "g2-zorah",     "PARENT_CHILD"),
    rel("g1-fatima",     "g2-zorah",     "PARENT_CHILD"),

    // ── G2 : mariages ──────────────────────────────────────────────────────
    rel("g2-suresh",   "g2-claudette", "SPOUSE", { marriageDate: "1973-07-14" }),
    rel("g2-mustapha", "g2-zorah",     "SPOUSE", { marriageDate: "1976-09-01" }),
    rel("g2-rajesh",   "g2-meena",     "SPOUSE", { marriageDate: "1975-03-12" }),

    // ── G2 → G3 : filiation ────────────────────────────────────────────────
    rel("g2-suresh",   "g3-arjun",  "PARENT_CHILD"),
    rel("g2-claudette","g3-arjun",  "PARENT_CHILD"),
    rel("g2-suresh",   "g3-priya",  "PARENT_CHILD"),
    rel("g2-claudette","g3-priya",  "PARENT_CHILD"),
    rel("g2-mustapha", "g3-nadia",  "PARENT_CHILD"),
    rel("g2-zorah",    "g3-nadia",  "PARENT_CHILD"),
    rel("g2-mustapha", "g3-karim",  "PARENT_CHILD"),
    rel("g2-zorah",    "g3-karim",  "PARENT_CHILD"),
    rel("g2-mustapha", "g3-leila",  "PARENT_CHILD"),
    rel("g2-zorah",    "g3-leila",  "PARENT_CHILD"),
    rel("g2-rajesh",   "g4-kavya",  "PARENT_CHILD"),
    rel("g2-meena",    "g4-kavya",  "PARENT_CHILD"),
    rel("g2-rajesh",   "g4-vikram", "PARENT_CHILD"),
    rel("g2-meena",    "g4-vikram", "PARENT_CHILD"),

    // ── G3 : mariage Arjun + Karine (divorcé) ──────────────────────────────
    rel("g3-arjun", "g3-karine", "SPOUSE", {
      marriageDate: "1999-06-05",
      divorceDate:  "2008-11-20",
    }),

    // ── G3 : mariage Arjun + Yasmine ───────────────────────────────────────
    rel("g3-arjun", "g3-yasmine", "SPOUSE", { marriageDate: "2011-04-30" }),

    // ── G3 : Karine + Julien (union libre) ─────────────────────────────────
    rel("g3-karine", "g3-julien", "SPOUSE"),

    // ── G3 : mariage Priya + David ─────────────────────────────────────────
    rel("g3-priya", "g3-david", "SPOUSE", { marriageDate: "2004-09-18" }),

    // ── G3 : mariage Karim + Anousha ───────────────────────────────────────
    rel("g3-karim", "g3-anousha", "SPOUSE", { marriageDate: "2003-07-22" }),

    // ── G3 : mariage Leïla + Mehdi ─────────────────────────────────────────
    rel("g3-leila", "g3-mehdi", "SPOUSE", { marriageDate: "2010-05-15" }),

    // ── G3 → G4 : enfants d'Arjun + Karine ────────────────────────────────
    rel("g3-arjun",  "g4-rayan", "PARENT_CHILD"),
    rel("g3-karine", "g4-rayan", "PARENT_CHILD"),
    rel("g3-arjun",  "g4-inaya", "PARENT_CHILD"),
    rel("g3-karine", "g4-inaya", "PARENT_CHILD"),

    // ── G3 → G4 : enfants d'Arjun + Yasmine ───────────────────────────────
    rel("g3-arjun",   "g4-samir", "PARENT_CHILD"),
    rel("g3-yasmine", "g4-samir", "PARENT_CHILD"),
    rel("g3-arjun",   "g4-mila",  "PARENT_CHILD"),
    rel("g3-yasmine", "g4-mila",  "PARENT_CHILD"),

    // ── Demi-frère : Théo, fils de Karine + Julien ─────────────────────────
    rel("g3-karine", "g4-theo", "PARENT_CHILD"),
    rel("g3-julien", "g4-theo", "PARENT_CHILD"),

    // ── G3 → G4 : enfants de Priya + David ────────────────────────────────
    rel("g3-priya", "g4-lilou", "PARENT_CHILD"),
    rel("g3-david", "g4-lilou", "PARENT_CHILD"),
    rel("g3-priya", "g4-noe",   "PARENT_CHILD"),
    rel("g3-david", "g4-noe",   "PARENT_CHILD"),

    // ── G3 → G4 : enfants de Karim + Anousha ──────────────────────────────
    rel("g3-karim",   "g4-amine", "PARENT_CHILD"),
    rel("g3-anousha", "g4-amine", "PARENT_CHILD"),
    rel("g3-karim",   "g4-sofia", "PARENT_CHILD"),
    rel("g3-anousha", "g4-sofia", "PARENT_CHILD"),

    // ── G3 → G4 : enfant de Nadia (père absent) ───────────────────────────
    rel("g3-nadia", "g4-imrane", "PARENT_CHILD"),

    // ── G3 → G4 : enfant de Leïla + Mehdi ─────────────────────────────────
    rel("g3-leila", "g4-adam", "PARENT_CHILD"),
    rel("g3-mehdi", "g4-adam", "PARENT_CHILD"),

    // ── Relations personnalisées ────────────────────────────────────────────
    // Rayan et Théo sont demi-frères (même mère Karine)
    rel("g4-rayan", "g4-theo", "CUSTOM", { label: "Demi-frère" }),
    rel("g4-inaya", "g4-theo", "CUSTOM", { label: "Demi-sœur" }),

    // Yasmine est belle-sœur de Nadia (frère Karim)
    rel("g3-yasmine", "g3-nadia", "CUSTOM", { label: "Belle-sœur" }),

    // Arjun et Karim : beau-frère (Yasmine est cousine de Karim)
    rel("g3-arjun", "g3-karim", "CUSTOM", { label: "Beau-frère (par alliance)" }),
  ]);

  console.log("✅ Relations créées");

  // Compter le total
  const totalPersons   = await prisma.person.count();
  const totalRelations = await prisma.relation.count();
  console.log(`🎉 Seeding terminé — ${totalPersons} personnes, ${totalRelations} relations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
