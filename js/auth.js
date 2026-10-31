/* auth.js — Inscription, connexion, session (Membre 3 : Ghost)
 *
 * ATTENTION : stockage dans localStorage = version de démonstration (front seul).
 * Quand le backend sera prêt, remplacer le contenu de chaque fonction du bloc
 * "COUCHE DONNÉES" par un appel fetch() vers l'API ; le reste des pages ne change pas.
 */

const CLE_UTILISATEURS = "service_utilisateurs";
const CLE_SESSION = "service_session";

/* ---------- COUCHE DONNÉES ---------- */
function lireUtilisateurs() {
  try { return JSON.parse(localStorage.getItem(CLE_UTILISATEURS)) || []; }
  catch { return []; }
}
function sauverUtilisateurs(liste) {
  localStorage.setItem(CLE_UTILISATEURS, JSON.stringify(liste));
}

async function hasher(texte) {
  const octets = new TextEncoder().encode(texte);
  const hash = await crypto.subtle.digest("SHA-256", octets);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- API publique ---------- */
async function inscrire({
  nom,
  prenom,
  email,
  telephone,
  motDePasse,
  role = "client",
  metier = "",
  bio = "",
  tarifHoraire = "",
  ville = ""
}) {
  const liste = lireUtilisateurs();
  const mail = email.trim().toLowerCase();
  if (liste.some(u => u.email === mail)) {
    return { ok: false, erreur: "Un compte existe déjà avec cet e-mail." };
  }
  const isPro = role === "professionnel";
  const utilisateur = {
    id: Date.now().toString(36),
    role: isPro ? "professionnel" : "client",
    nom: nom.trim(),
    prenom: prenom.trim(),
    email: mail,
    telephone: telephone.trim(),
    ville: ville.trim(),
    adresse: "",
    metier: isPro ? metier : "",
    bio: isPro ? bio.trim() : "",
    tarifHoraire: isPro ? (parseFloat(tarifHoraire) || 0) : null,
    disponible: true,
    noteMoyenne: isPro ? 5.0 : null,
    nombreAvis: isPro ? 0 : null,
    motDePasse: await hasher(motDePasse),
    creeLe: new Date().toISOString()
  };
  liste.push(utilisateur);
  sauverUtilisateurs(liste);
  ouvrirSession(utilisateur.id);
  return { ok: true, utilisateur };
}

async function connecter(email, motDePasse) {
  const mail = email.trim().toLowerCase();
  const hash = await hasher(motDePasse);
  const u = lireUtilisateurs().find(x => x.email === mail && x.motDePasse === hash);
  if (!u) return { ok: false, erreur: "E-mail ou mot de passe incorrect." };
  ouvrirSession(u.id);
  return { ok: true };
}

function ouvrirSession(id) { localStorage.setItem(CLE_SESSION, id); }

function deconnecter() {
  localStorage.removeItem(CLE_SESSION);
  window.location.href = "connexion.html";
}

function utilisateurConnecte() {
  const id = localStorage.getItem(CLE_SESSION);
  return lireUtilisateurs().find(u => u.id === id) || null;
}

/* À appeler en haut d'une page réservée aux connectés */
function exigerConnexion() {
  const u = utilisateurConnecte();
  if (!u) window.location.href = "connexion.html";
  return u;
}

function mettreAJourProfil(champs) {
  const liste = lireUtilisateurs();
  const i = liste.findIndex(u => u.id === localStorage.getItem(CLE_SESSION));
  if (i === -1) return { ok: false, erreur: "Session expirée." };
  if (champs.email) {
    const mail = champs.email.trim().toLowerCase();
    if (liste.some((u, j) => j !== i && u.email === mail)) {
      return { ok: false, erreur: "Cet e-mail est déjà utilisé." };
    }
    champs.email = mail;
  }
  liste[i] = { ...liste[i], ...champs };
  sauverUtilisateurs(liste);
  return { ok: true };
}

async function changerMotDePasse(ancien, nouveau) {
  const liste = lireUtilisateurs();
  const i = liste.findIndex(u => u.id === localStorage.getItem(CLE_SESSION));
  if (i === -1) return { ok: false, erreur: "Session expirée." };
  if (liste[i].motDePasse !== await hasher(ancien)) {
    return { ok: false, erreur: "Ancien mot de passe incorrect." };
  }
  liste[i].motDePasse = await hasher(nouveau);
  sauverUtilisateurs(liste);
  return { ok: true };
}

/* Connexion via un fournisseur externe (Google…) : crée ou retrouve le compte local */
function connecterAvecFournisseur({ uid, email, prenom, nom, fournisseur, role = "client" }) {
  const liste = lireUtilisateurs();
  const mail = (email || "").trim().toLowerCase();
  let u = liste.find(x => x.email === mail);
  if (!u) {
    u = {
      id: uid,
      role: role || "client",
      nom: nom || "",
      prenom: prenom || "",
      email: mail,
      telephone: "",
      ville: "",
      adresse: "",
      metier: "",
      bio: "",
      tarifHoraire: null,
      disponible: true,
      noteMoyenne: null,
      nombreAvis: null,
      motDePasse: "",
      fournisseur,
      creeLe: new Date().toISOString()
    };
    liste.push(u);
    sauverUtilisateurs(liste);
  }
  ouvrirSession(u.id);
  return u;
}
