/**
 * emailService.js
 * Service d'envoi d'emails via EmailJS (sans backend).
 *
 * Configuration :
 *   1. Créez un compte sur https://www.emailjs.com (gratuit - 200 emails/mois)
 *   2. Créez un "Email Service" (Gmail, Outlook, etc.)
 *   3. Créez un "Email Template" avec les variables ci-dessous
 *   4. Renseignez vos clés dans .env :
 *      VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
 *      VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
 *      VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
 *
 * Variables de template EmailJS à créer :
 *   {{to_name}}     - Destinataire
 *   {{to_email}}    - Email destinataire
 *   {{subject}}     - Sujet
 *   {{message}}     - Corps du message
 *   {{from_name}}   - "OFPPT Gestion RH"
 *   {{date}}        - Date de l'envoi
 */
import emailjs from '@emailjs/browser';

// ── Config depuis .env ────────────────────────────────────────
const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'service_ofppt';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_ofppt';
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'your_public_key';

// ── Initialisation ────────────────────────────────────────────
emailjs.init(PUBLIC_KEY);

/**
 * Envoie un email de notification.
 *
 * @param {object} params
 * @param {string} params.to_name    - Prénom Nom du destinataire
 * @param {string} params.to_email   - Email du destinataire
 * @param {string} params.subject    - Sujet de l'email
 * @param {string} params.message    - Corps du message (peut contenir du HTML)
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to_name, to_email, subject, message }) => {
  const templateParams = {
    to_name,
    to_email,
    subject,
    message,
    from_name: 'OFPPT Gestion RH',
    date: new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }),
  };

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
};

// ── Templates prédéfinis ──────────────────────────────────────

/**
 * Notification : Nouvelle demande de congé soumise.
 */
export const notifyCongeSubmis = async ({ employe, typeConge, dateDebut, dateFin, adminEmail }) => {
  await sendEmail({
    to_name:  'Responsable RH',
    to_email: adminEmail || 'rh@ofppt.ma',
    subject:  `[OFPPT RH] Nouvelle demande de congé — ${employe}`,
    message:  `
Une nouvelle demande de congé a été soumise.

Employé    : ${employe}
Type       : ${typeConge}
Du         : ${dateDebut}
Au         : ${dateFin}

Veuillez vous connecter à l'application pour approuver ou refuser cette demande.
Lien : ${window.location.origin}/conges

Cordialement,
Système OFPPT Gestion RH
    `.trim(),
  });
};

/**
 * Notification : Statut de congé mis à jour.
 */
export const notifyCongeStatut = async ({ employe, employeEmail, typeConge, statut }) => {
  const statutLabel = statut === 'approuvé' ? 'APPROUVÉE ✅' : 'REFUSÉE ❌';
  await sendEmail({
    to_name:  employe,
    to_email: employeEmail,
    subject:  `[OFPPT RH] Votre demande de congé a été ${statut}`,
    message:  `
Bonjour ${employe},

Votre demande de congé (${typeConge}) a été ${statutLabel}.

Connectez-vous à votre espace RH pour plus de détails.
Lien : ${window.location.origin}/conges

Cordialement,
Service des Ressources Humaines — OFPPT
    `.trim(),
  });
};

/**
 * Notification : Emploi du temps modifié.
 */
export const notifyEmploiModifie = async ({ formateurEmail, formateur, details }) => {
  await sendEmail({
    to_name:  formateur,
    to_email: formateurEmail,
    subject:  '[OFPPT RH] Modification de votre emploi du temps',
    message:  `
Bonjour ${formateur},

Votre emploi du temps a été modifié par l'administration.

Détails : ${details}

Consultez votre planning mis à jour en vous connectant à l'application.
Lien : ${window.location.origin}/emploi-du-temps

Cordialement,
Service des Ressources Humaines — OFPPT
    `.trim(),
  });
};

/**
 * Notification générique.
 */
export const sendNotification = async ({ to_name, to_email, title, body }) => {
  await sendEmail({ to_name, to_email, subject: `[OFPPT RH] ${title}`, message: body });
};
