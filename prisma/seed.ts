import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Gate database...");

  // Create admin user
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

  console.log(`✅ Admin created: ${admin.email}`);

  // Create sample persons
  const persons = await Promise.all([
    prisma.person.upsert({
      where: { id: "sample-person-1" },
      update: {},
      create: {
        id: "sample-person-1",
        firstName: "Jean",
        lastName: "Dupont",
        gender: "MALE",
        birthDate: new Date("1940-05-15"),
        isAlive: false,
        deathDate: new Date("2010-11-03"),
        birthPlace: "Paris, France",
        description: "Fondateur de la famille Dupont, homme de caractère et de valeurs.",
        showBirthDate: true,
        showDeathDate: true,
        showPhoto: true,
      },
    }),
    prisma.person.upsert({
      where: { id: "sample-person-2" },
      update: {},
      create: {
        id: "sample-person-2",
        firstName: "Marie",
        lastName: "Dupont",
        gender: "FEMALE",
        birthDate: new Date("1943-08-22"),
        isAlive: false,
        deathDate: new Date("2018-03-14"),
        birthPlace: "Lyon, France",
        description: "Épouse de Jean, pilier de la famille.",
        showBirthDate: true,
        showDeathDate: true,
        showPhoto: true,
      },
    }),
    prisma.person.upsert({
      where: { id: "sample-person-3" },
      update: {},
      create: {
        id: "sample-person-3",
        firstName: "Pierre",
        lastName: "Dupont",
        gender: "MALE",
        birthDate: new Date("1968-03-10"),
        isAlive: true,
        birthPlace: "Paris, France",
        showBirthDate: true,
        showPhoto: false,
      },
    }),
    prisma.person.upsert({
      where: { id: "sample-person-4" },
      update: {},
      create: {
        id: "sample-person-4",
        firstName: "Sophie",
        lastName: "Martin",
        gender: "FEMALE",
        birthDate: new Date("1970-07-18"),
        isAlive: true,
        birthPlace: "Marseille, France",
        showBirthDate: true,
      },
    }),
    prisma.person.upsert({
      where: { id: "sample-person-5" },
      update: {},
      create: {
        id: "sample-person-5",
        firstName: "Lucas",
        lastName: "Dupont",
        gender: "MALE",
        birthDate: new Date("1995-12-25"),
        isAlive: true,
        birthPlace: "Paris, France",
        showBirthDate: false,
      },
    }),
  ]);

  console.log(`✅ ${persons.length} sample persons created`);

  // Create relations
  const relations = await Promise.all([
    // Jean + Marie = married
    prisma.relation.upsert({
      where: { sourceId_targetId_type: { sourceId: "sample-person-1", targetId: "sample-person-2", type: "SPOUSE" } },
      update: {},
      create: {
        sourceId: "sample-person-1",
        targetId: "sample-person-2",
        type: "SPOUSE",
        marriageDate: new Date("1965-06-10"),
      },
    }),
    // Jean → Pierre (parent → enfant)
    prisma.relation.upsert({
      where: { sourceId_targetId_type: { sourceId: "sample-person-1", targetId: "sample-person-3", type: "PARENT_CHILD" } },
      update: {},
      create: {
        sourceId: "sample-person-1",
        targetId: "sample-person-3",
        type: "PARENT_CHILD",
      },
    }),
    // Marie → Pierre
    prisma.relation.upsert({
      where: { sourceId_targetId_type: { sourceId: "sample-person-2", targetId: "sample-person-3", type: "PARENT_CHILD" } },
      update: {},
      create: {
        sourceId: "sample-person-2",
        targetId: "sample-person-3",
        type: "PARENT_CHILD",
      },
    }),
    // Pierre + Sophie = married
    prisma.relation.upsert({
      where: { sourceId_targetId_type: { sourceId: "sample-person-3", targetId: "sample-person-4", type: "SPOUSE" } },
      update: {},
      create: {
        sourceId: "sample-person-3",
        targetId: "sample-person-4",
        type: "SPOUSE",
        marriageDate: new Date("1993-09-04"),
      },
    }),
    // Pierre → Lucas
    prisma.relation.upsert({
      where: { sourceId_targetId_type: { sourceId: "sample-person-3", targetId: "sample-person-5", type: "PARENT_CHILD" } },
      update: {},
      create: {
        sourceId: "sample-person-3",
        targetId: "sample-person-5",
        type: "PARENT_CHILD",
      },
    }),
  ]);

  console.log(`✅ ${relations.length} sample relations created`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
