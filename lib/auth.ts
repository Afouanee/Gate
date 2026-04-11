/**
 * Authentication Configuration (NextAuth.js)
 *
 * Gère tous les aspects de l'authentification:
 * - Stratégies: Credentials (email/password) + Email (magic link)
 * - Sessions JWT
 * - Refresh des rôles depuis la BDD à chaque requête
 * - Logs d'audit des authentifications
 */

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendVerificationEmail } from "./email";

/**
 * Options NextAuth
 * - Adapter Prisma pour BD
 * - JWT strategy pour les sessions
 * - Deux providers d'authentification
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",     // Redirection vers page login
    error: "/login",      // Erreur d'auth
    verifyRequest: "/login?verify=true",  // Attente vérification email
  },
  providers: [
    /**
     * Provider Credentials (Email + Password)
     * Authentification locale avec email/password
     * - Hash des mots de passe avec bcrypt
     * - Vérification de l'email avant connexion
     */
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validation des champs
        if (!credentials?.email || !credentials?.password) {
          throw new Error("MISSING_FIELDS");
        }

        // Recherche utilisateur (case-insensitive sur email)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        // Vérifications: existence + mot de passe + email vérifié
        if (!user || !user.password) {
          throw new Error("INVALID_CREDENTIALS");
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Vérification du mot de passe avec bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("INVALID_CREDENTIALS");
        }

        // Retour de l'utilisateur authentifié (sans le mot de passe)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
    /**
     * Provider Email (Magic Link)
     * Authentification sans mot de passe via lien magique
     * Utilise Resend pour l'envoi d'emails
     */
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.RESEND_FROM_EMAIL,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        // Envoie le lien magique par email
        await sendVerificationEmail({ to: email, magicLink: url });
      },
    }),
  ],
  /**
   * Callbacks pour personnaliser le cycle d'auth
   * - jwt: Appelé à chaque création/mise à jour du JWT
   * - session: Appelé à chaque récupération de session
   */
  callbacks: {
    /**
     * Callback JWT
     * - Ajoute id et role au token JWT
     * - Rafraîchit le rôle depuis la BDD à chaque requête
     *   (important pour les changements Stripe en temps réel)
     */
    async jwt({ token, user, trigger, session }) {
      // Lors du login: ajoute user infos au token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }

      // Si session update: met à jour le rôle dans le token
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      // IMPORTANT: Rafraîchir le rôle depuis la BDD à chaque requête
      // Cela permet que les changements Stripe (webhook) sont appliqués immédiatement
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, name: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    /**
     * Callback Session
     * Transfère les infos du JWT vers la session accessible au client
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  /**
   * Events: Hooks pour actions spéciales après événements auth
   */
  events: {
    /**
     * SignIn event: Enregistre l'AuditLog à chaque connexion
     * NOTE: Il y a un bug ici - devrait être "USER_LOGGED_IN" pas "USER_CREATED"
     */
    async signIn({ user }) {
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_CREATED",  // À corriger: devrait être une action LOGIN
          entity: "users",
          entityId: user.id,
        },
      }).catch(() => {});  // Silencieux en cas d'erreur pour ne pas bloquer l'auth
    },
  },
};
