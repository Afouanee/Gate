/**
 * Crée (ou met à jour) un compte ADMIN prêt à se connecter.
 *
 * Usage :
 *   npm run db:admin
 *   # ou avec des identifiants custom :
 *   ADMIN_EMAIL=moi@exemple.com ADMIN_PASSWORD=monMotDePasse npm run db:admin
 *
 * Le compte est créé avec emailVerified renseigné (sinon le login credentials
 * est refusé) et role = ADMIN. Idempotent : ré-exécutable sans risque.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = process.env.ADMIN_EMAIL || "admin@gate.local";
const PASSWORD = process.env.ADMIN_PASSWORD || "Admin1234!";
const NAME = process.env.ADMIN_NAME || "Admin Gate";

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      password: hash,
      role: "ADMIN",
      emailVerified: new Date(),
      name: NAME,
    },
    create: {
      email: EMAIL,
      password: hash,
      role: "ADMIN",
      emailVerified: new Date(),
      name: NAME,
    },
  });

  console.log("\n✅ Compte ADMIN prêt :");
  console.log("   Email    :", user.email);
  console.log("   Password :", PASSWORD);
  console.log("   Rôle     :", user.role);
  console.log("\nConnecte-toi sur /login (onglet « Mot de passe »).\n");
}

main()
  .catch((e) => {
    console.error("Erreur création admin :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
