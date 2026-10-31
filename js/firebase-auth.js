/* firebase-auth.js — Connexion / inscription avec Google (Membre 3 : Ghost)
 * Chargé avec : <script type="module" src="js/firebase-auth.js"></script>
 * Expose window.connexionGoogle() → { ok: true } ou { ok: false, erreur: "..." }
 * Nécessite que js/auth.js soit chargé avant (fonction connecterAvecFournisseur).
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const configure = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("COLLER");
const auth = configure ? getAuth(initializeApp(firebaseConfig)) : null;

const MESSAGES = {
  "auth/popup-closed-by-user": "La fenêtre Google a été fermée avant la fin de la connexion.",
  "auth/cancelled-popup-request": "",
  "auth/popup-blocked": "Le navigateur a bloqué la fenêtre Google. Autorisez les pop-ups pour ce site.",
  "auth/unauthorized-domain": "Ce site n'est pas encore autorisé dans Firebase (Authentication → Paramètres → Domaines autorisés).",
  "auth/network-request-failed": "Problème de connexion internet. Réessayez."
};

window.connexionGoogle = async function () {
  if (!auth) {
    return { ok: false, erreur: "Firebase n'est pas encore configuré : remplissez js/firebase-config.js." };
  }
  try {
    const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
    const complet = (user.displayName || "").trim();
    const [prenom, ...reste] = complet ? complet.split(/\s+/) : [(user.email || "").split("@")[0]];
    connecterAvecFournisseur({
      uid: user.uid,
      email: user.email,
      prenom,
      nom: reste.join(" "),
      fournisseur: "google"
    });
    return { ok: true };
  } catch (e) {
    const texte = e.code in MESSAGES ? MESSAGES[e.code] : "Connexion Google impossible (" + (e.code || e.message) + ").";
    return { ok: false, erreur: texte };
  }
};
