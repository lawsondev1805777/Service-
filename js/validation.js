/* validation.js — Règles de validation des formulaires (Membre 3 : Ghost) */
const Validation = {
  nom(v) {
    v = v.trim();
    if (v.length < 2) return "Au moins 2 caractères.";
    if (!/^[\p{L}][\p{L}\s'’-]*$/u.test(v)) return "Lettres, espaces, apostrophes et tirets uniquement.";
    return "";
  },
  email(v) {
    v = v.trim();
    if (!v) return "L'adresse e-mail est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Adresse e-mail invalide.";
    return "";
  },
  telephone(v) {
    v = v.trim();
    if (!v) return "Le numéro de téléphone est obligatoire.";
    const digits = v.replace(/[\s.-]/g, "");
    if (!/^\+?\d{8,15}$/.test(digits)) return "Numéro invalide (8 à 15 chiffres, « + » autorisé au début).";
    return "";
  },
  motDePasse(v) {
    if (v.length < 8) return "Au moins 8 caractères.";
    if (!/[a-z]/.test(v)) return "Ajoutez une lettre minuscule.";
    if (!/[A-Z]/.test(v)) return "Ajoutez une lettre majuscule.";
    if (!/\d/.test(v)) return "Ajoutez un chiffre.";
    return "";
  },
  confirmation(v, original) {
    return v === original ? "" : "Les mots de passe ne correspondent pas.";
  },
  obligatoire(v, label = "Ce champ") {
    return v.trim() ? "" : `${label} est obligatoire.`;
  }
};

/* Affiche / efface le message d'erreur sous un champ */
function afficherErreur(input, message) {
  const zone = input.closest(".champ").querySelector(".erreur");
  zone.textContent = message;
  input.classList.toggle("invalide", !!message);
  input.classList.toggle("valide", !message && input.value !== "");
  input.setAttribute("aria-invalid", message ? "true" : "false");
  return !message;
}

/* Lie un champ à sa règle : validation en direct (à la saisie et à la sortie du champ) */
function lierValidation(input, regle) {
  const verifier = () => afficherErreur(input, regle(input.value));
  input.addEventListener("blur", verifier);
  input.addEventListener("input", () => { if (input.classList.contains("invalide")) verifier(); });
  return verifier;
}

/* Indicateur de force du mot de passe (0 à 4) */
function forceMotDePasse(v) {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score++;
  return score;
}
