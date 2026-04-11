import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/403");
  }
  return session;
}

export async function requirePremiumOrAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role === "FREE") {
    redirect("/pricing");
  }
  return session;
}
