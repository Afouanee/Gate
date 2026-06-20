/**
 * POST /api/export/render-pdf
 *
 * Convertit un document HTML (l'arbre généré côté client) en vrai PDF via
 * Puppeteer. Permet à l'utilisateur de télécharger un PDF plutôt qu'un .html.
 *
 * Body : { html: string }
 * Auth : session requise (réutilise le quota déjà consommé à la génération).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const maxDuration = 60;

const schema = z.object({
  html: z.string().min(1).max(5_000_000),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
  }

  let browser: any = null;
  try {
    const puppeteer = (await import("puppeteer")).default;
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(parsed.data.html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A3",
      printBackground: true,
      margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" },
    });
    await browser.close();
    browser = null;

    return new NextResponse(pdf as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment",
      },
    });
  } catch (error) {
    console.error("render-pdf error:", error);
    if (browser) await browser.close().catch(() => {});
    return NextResponse.json({ error: "RENDER_FAILED" }, { status: 500 });
  }
}
