import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@gate.afouanee.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail({
  to,
  magicLink,
}: {
  to: string;
  magicLink: string;
}) {
  await resend.emails.send({
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

export async function sendVerificationCode({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  await resend.emails.send({
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

export async function sendPaymentFailedEmail({ to }: { to: string }) {
  await resend.emails.send({
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
  await resend.emails.send({
    from: FROM,
    to: FROM,
    replyTo: email,
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

  // Auto-reply
  await resend.emails.send({
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

export async function sendReportNotification({
  personId,
  personName,
  reporterEmail,
  message,
}: {
  personId: string;
  personName: string;
  reporterEmail: string;
  message: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: FROM,
    subject: `[Signalement Gate] Profil ${personName}`,
    html: `
      <div style="font-family: Poppins, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <h1 style="color: #c9930f;">Nouveau signalement</h1>
        <p><strong>Profil :</strong> ${personName} (ID: ${personId})</p>
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
