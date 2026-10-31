// Page "Demander un service"
// Utilisation : demande.html?pro=<uid du prestataire>&nom=<nom>&cat=<catégorie>
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, requireAuth, renderNav, userName, toast, CATEGORIES } from "./m4-common.js";
import { DIRECTORY_PAGE } from "./firebase-config.js";

const user = await requireAuth();
renderNav("demande", user);

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const proId = params.get("pro");
const proNom = params.get("nom") || "";

// Liste des catégories
CATEGORIES.forEach((c) => $("categorie").add(new Option(c, c)));
if (CATEGORIES.includes(params.get("cat"))) $("categorie").value = params.get("cat");

// Date minimale = aujourd'hui (date locale, sans décalage UTC)
const aujourdHui = new Date();
aujourdHui.setMinutes(aujourdHui.getMinutes() - aujourdHui.getTimezoneOffset());
$("date").min = aujourdHui.toISOString().slice(0, 10);

// Il faut un professionnel ciblé (et pas soi-même)
$("pro").value = proNom || "Aucun professionnel sélectionné";
if (!proId || proId === user.uid) {
  $("alerte").hidden = false;
  $("alerte").innerHTML = proId === user.uid
    ? "Vous ne pouvez pas vous envoyer une demande à vous-même."
    : `Choisissez d'abord un professionnel depuis <a href="${DIRECTORY_PAGE}">la liste</a>.`;
  $("envoyer").disabled = true;
}

// Validation côté client
function valider() {
  const regles = {
    categorie: (v) => v ? "" : "Choisissez une catégorie.",
    titre: (v) => v.length >= 5 ? "" : "Au moins 5 caractères.",
    description: (v) => v.length >= 15 ? "" : "Décrivez un peu plus (15 caractères minimum).",
    adresse: (v) => v.length >= 3 ? "" : "Indiquez votre adresse ou quartier.",
    date: (v) => v ? "" : "Choisissez une date."
  };
  let ok = true;
  for (const [champ, test] of Object.entries(regles)) {
    const msg = test($(champ).value.trim());
    document.querySelector(`[data-for="${champ}"]`).textContent = msg;
    if (msg) ok = false;
  }
  const dateChoisie = $("date").value;
  if (dateChoisie && dateChoisie < $("date").min) {
    document.querySelector('[data-for="date"]').textContent = "Choisissez une date à partir d'aujourd'hui.";
    ok = false;
  }
  const budget = $("budget").value;
  if (budget && (!Number.isFinite(Number(budget)) || Number(budget) < 0)) {
    toast("Le budget doit être un montant positif.");
    ok = false;
  }
  return ok;
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!valider()) return;
  $("envoyer").disabled = true;
  try {
    const ref = await addDoc(collection(db, "demandes"), {
      clientId: user.uid,
      clientNom: userName(user),
      prestataireId: proId,
      prestataireNom: proNom,
      categorie: $("categorie").value,
      titre: $("titre").value.trim(),
      description: $("description").value.trim(),
      adresse: $("adresse").value.trim(),
      dateSouhaitee: $("date").value,
      urgence: $("urgence").value,
      budget: $("budget").value ? Number($("budget").value) : null,
      statut: "en_attente",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    toast("Demande envoyée ✔");
    setTimeout(() => (location.href = `suivi.html?new=${ref.id}`), 900);
  } catch (err) {
    console.error(err);
    toast("Erreur : la demande n'a pas pu être envoyée.");
    $("envoyer").disabled = false;
  }
});
