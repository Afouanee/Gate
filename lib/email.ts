/**
 * Email Templates & Sending (Resend)
 *
 * Tous les templates d'email de l'application.
 * Utilise Resend pour l'envoi (SMTP + templates HTML stylisées).
 *
 * Templates:
 * - sendVerificationEmail: Lien magique pour connexion
 * - sendVerificationCode: Code 6 chiffres pour inscription
 * - sendPaymentFailedEmail: Notification échec paiement
 * - sendContactEmail: Formulaire de contact + auto-reply
 * - sendReportNotification: Signalement d'erreur/contribution
 * - sendLinkRequestDecisionEmail: Résultat demande de rattachement
 */

import { Resend } from "resend";

/**
 * Client Resend instancié paresseusement : `new Resend()` lève si la clé est
 * absente, ce qui casserait le build (Next exécute ce module au « collect page
 * data »). On ne crée le client qu'au premier envoi réel, quand la clé existe.
 */
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY manquante : envoi d'email indisponible.");
    _resend = new Resend(key);
  }
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@gate.afouanee.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Email: Lien magique pour connexion
 * Utilisé par EmailProvider (NextAuth)
 * Template: Dark theme, bouton gold avec gradient
 */
export async function sendVerificationEmail({
  to,
  magicLink,
}: {
  to: string;
  magicLink: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Gate — Connexion par lien magique",
    html: `
      <div style="font-family: Poppins, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <h1 style="color: #c9930f; font-size: 32px; margin-bottom: 8px;">Gate</h1>
        <p style="color: #888888; margin-bottom: 32px;">La porte vers vos origines</p>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Votre lien de connexion</h2>
        <p style="color: #cccccc; margin-bottom: 24px;">Cliquez sur le bouton ci-dessous pour vous connecter à votre compte Gate.</p>
        <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #c9930f, #e4b325); color: #000000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
          Se connecter
        </a>
        <p style="color: #666666; font-size: 12px;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette connexion, ignorez cet email.</p>
        <hr style="border: 1px solid #2a2a2a; margin: 24px 0;" />
        <p style="color: #444444; font-size: 12px;">by Afouanee.dev</p>
      </div>
    `,
  });
}

/**
 * Email: Code de vérification 6 chiffres
 * Envoyé lors de l'inscription
 * Template: Code affiché en gros avec background sombre
 */
export async function sendVerificationCode({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Gate — Code de vérification",
    html: `
      <div style="font-family: Poppins, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <h1 style="color: #c9930f; font-size: 32px; margin-bottom: 8px;">Gate</h1>
        <p style="color: #888888; margin-bottom: 32px;">La porte vers vos origines</p>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Vérification de votre email</h2>
        <p style="color: #cccccc; margin-bottom: 24px;">Votre code de vérification est :</p>
        <div style="background: #111111; border: 2px solid #c9930f; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #c9930f;">${code}</span>
        </div>
        <p style="color: #666666; font-size: 12px;">Ce code expire dans 15 minutes. Si vous n'avez pas créé de compte Gate, ignorez cet email.</p>
        <hr style="border: 1px solid #2a2a2a; margin: 24px 0;" />
        <p style="color: #444444; font-size: 12px;">by Afouanee.dev</p>
      </div>
    `,
  });
}

/**
 * Email: Notification échec de paiement
 * Envoyé par webhook Stripe quand paiement échoue plusieurs fois
 * Downgrade automatique vers FREE
 */
export async function sendPaymentFailedEmail({ to }: { to: string }) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Gate — Échec du paiement de votre abonnement",
    html: `
      <div style="font-family: Poppins, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <h1 style="color: #c9930f; font-size: 32px; margin-bottom: 8px;">Gate</h1>
        <p style="color: #888888; margin-bottom: 32px;">La porte vers vos origines</p>
        <h2 style="font-size: 20px; margin-bottom: 16px; color: #ef4444;">Échec du paiement</h2>
        <p style="color: #cccccc; margin-bottom: 24px;">Le renouvellement de votre abonnement Gate Premium a échoué. Votre compte a été rétrogradé vers le plan gratuit.</p>
        <a href="${APP_URL}/pricing" style="display: inline-block; background: linear-gradient(135deg, #c9930f, #e4b325); color: #000000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
          Renouveler mon abonnement
        </a>
        <hr style="border: 1px solid #2a2a2a; margin: 24px 0;" />
        <p style="color: #444444; font-size: 12px;">by Afouanee.dev</p>
      </div>
    `,
  });
}

/**
 * Email: Formulaire de contact
 * Envoie 2 emails:
 * 1. Au FROM (admin) - message de contact
 * 2. À l'utilisateur - auto-reply
 */
export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: FROM,
    reply_to: email,
    subject: `[Contact Gate] ${subject}`,
    html: `
      <div style="font-family: Poppins, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <h1 style="color: #c9930f;">Nouveau message de contact</h1>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p><strong>Message :</strong></p>
        <p style="background: #111111; padding: 16px; border-radius: 8px; border-left: 4px solid #c9930f;">${message}</p>
      </div>
    `,
  });

  // Auto-reply à l'utilisateur
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Gate — Nous avons bien reçu votre message",
    html: `
      <div style="font-family: Poppins, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <h1 style="color: #c9930f;">Merci ${name} !</h1>
        <p style="color: #cccccc;">Nous avons bien reçu votre message et vous répondrons dans les <strong>48h ouvrées</strong>.</p>
        <hr style="border: 1px solid #2a2a2a; margin: 24px 0;" />
        <p style="color: #444444; font-size: 12px;">by Afouanee.dev</p>
      </div>
    `,
  });
}

/**
 * Email: Notification de signalement/contribution
 * Envoyé aux admins quand un utilisateur:
 * - Signale une erreur dans une fiche
 * - Propose un ajout
 * Permet aux admins d'examiner et corriger
 */
export async function sendReportNotification({
  personId,
  personName,
  type,
  errorType,
  reporterEmail,
  message,
}: {
  personId: string;
  personName: string;
  type: "ERROR" | "ADDITION";
  errorType?: string | null;
  reporterEmail: string;
  message: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: FROM,
    subject: `[${type === "ERROR" ? "Signalement" : "Contribution"} Gate] Profil ${personName}`,
    html: `
      <div style="font-family: Poppins, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <h1 style="color: #c9930f;">${type === "ERROR" ? "Nouveau signalement" : "Nouvelle contribution"}</h1>
        <p><strong>Profil :</strong> ${personName} (ID: ${personId})</p>
        <p><strong>Type :</strong> ${type === "ERROR" ? "Erreur" : "Information complémentaire"}</p>
        ${errorType ? `<p><strong>Catégorie :</strong> ${errorType}</p>` : ""}
        <p><strong>Signalé par :</strong> ${reporterEmail || "Anonyme"}</p>
        <p><strong>Message :</strong></p>
        <p style="background: #111111; padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444;">${message}</p>
        <a href="${APP_URL}/admin?tab=reports" style="display: inline-block; background: linear-gradient(135deg, #c9930f, #e4b325); color: #000000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Voir dans l'administration
        </a>
      </div>
    `,
  });
}

/**
 * Email: Décision sur demande de rattachement
 * Envoie au demandeur:
 * - "Approuvée" si admin a accepté le rattachement
 * - "Refusée" si admin a rejeté (avec motif optionnel)
 * Message customisable par admin
 */
export async function sendLinkRequestDecisionEmail({
  to,
  firstName,
  personName,
  action,
  adminMessage,
}: {
  to: string;
  firstName: string;
  personName: string;
  action: "APPROVED" | "REJECTED";
  adminMessage?: string | null;
}) {
  const subject = action === "APPROVED"
    ? "Gate — Votre demande de rattachement a été acceptée"
    : "Gate — Votre demande de rattachement a été refusée";

  const fallbackMessage = action === "APPROVED"
    ? `Bienvenue ${firstName},\n\nVotre demande de rattachement au profil ${personName} a ete acceptee.\n\nVous pouvez desormais completer votre profil et explorer votre arbre genealogique.\n\n- L'equipe Gate`
    : `Bonjour ${firstName},\n\nVotre demande de rattachement au profil ${personName} a ete refusee.\n\nVous pouvez soumettre une nouvelle demande si vous pensez qu'il s'agit d'une erreur.\n\n- L'equipe Gate`;

  // Utilise message custom si fourni, sinon message par défaut
  // Template variables remplaçables: {firstName}, {personName}
  const message = (adminMessage?.trim() || fallbackMessage)
    .replace(/\{firstName\}/g, firstName)
    .replace(/\{personName\}/g, personName);

  await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family: Poppins, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <h1 style="color: #c9930f; font-size: 32px; margin-bottom: 8px;">Gate</h1>
        <p style="color: #888888; margin-bottom: 32px;">La porte vers vos origines</p>
        <h2 style="font-size: 20px; margin-bottom: 16px;">${action === "APPROVED" ? "Demande acceptee" : "Demande refusee"}</h2>
        <div style="background: #111111; padding: 20px; border-radius: 12px; white-space: pre-line; color: #cccccc;">${message}</div>
      </div>
    `,
  });
}
