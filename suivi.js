// Page "Suivi des demandes" — temps réel
import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, requireAuth, renderNav, watchMyRequests, STATUTS, esc, fmtDate, toast } from "./m4-common.js";

const user = await requireAuth();
renderNav("suivi", user);

const $ = (id) => document.getElementById(id);
let demandes = [];
let vue = "client";   // client = mes demandes envoyées, pro = demandes reçues
let filtre = "tous";

// Actions possibles selon le rôle et le statut actuel
const ACTIONS_PRO = {
  en_attente: [["acceptee", "Accepter", ""], ["refusee", "Refuser", "danger"]],
  acceptee:   [["en_cours", "Démarrer", ""]],
  en_cours:   [["terminee", "Marquer terminée", ""]]
};
const ACTIONS_CLIENT = { en_attente: [["annulee", "Annuler", "danger"]] };

function carte(d) {
  const st = STATUTS[d.statut] || STATUTS.en_attente;
  const autre = vue === "client" ? d.prestataireNom || "Professionnel" : d.clientNom || "Client";
  const frise = st.etape >= 0
    ? `<div class="frise">${["Envoyée", "Acceptée", "En cours", "Terminée"]
        .map((t, i) => `<div class="${i <= st.etape ? "fait" : ""}">${t}</div>`).join("")}</div>`
    : "";
  const actions = ((vue === "pro" ? ACTIONS_PRO : ACTIONS_CLIENT)[d.statut] || [])
    .map(([s, txt, cls]) => `<button class="bouton small ${cls}" data-id="${d.id}" data-statut="${s}">${txt}</button>`)
    .join("");
  return `
  <article class="carte" id="d-${d.id}">
    <div class="dem-head">
      <div>
        <div class="dem-titre">${esc(d.titre)}</div>
        <div class="dem-meta">${esc(d.categorie)} · ${vue === "client" ? "Pour" : "De"} ${esc(autre)} · ${fmtDate(d.createdAt)}</div>
      </div>
      <span class="badge ${st.cls}">${st.label}</span>
    </div>
    <div class="dem-desc">${esc(d.description)}</div>
    <div class="dem-meta">📍 ${esc(d.adresse)} · 📅 ${esc(d.dateSouhaitee)}${d.urgence === "urgente" ? " · 🔥 Urgent" : ""}${d.budget ? " · " + Number(d.budget).toLocaleString("fr-FR") + " FCFA" : ""}</div>
    ${frise}
    <div class="actions">
      ${actions}
      <a class="bouton sec small" href="messagerie.html?id=${d.id}">💬 Discuter</a>
    </div>
  </article>`;
}

function afficher() {
  const liste = demandes.filter((d) => d.role === vue && (filtre === "tous" || d.statut === filtre));
  $("liste").innerHTML = liste.length
    ? liste.map(carte).join("")
    : `<div class="vide">${vue === "client" ? "Aucune demande envoyée pour le moment." : "Aucune demande reçue pour le moment."}</div>`;
  const nouveau = new URLSearchParams(location.search).get("new");
  if (nouveau) document.getElementById("d-" + nouveau)?.scrollIntoView({ block: "center" });
}

watchMyRequests(user.uid, (liste) => { demandes = liste; afficher(); });

// Changement de statut
$("liste").addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-statut]");
  if (!b) return;
  b.disabled = true;
  try {
    await updateDoc(doc(db, "demandes", b.dataset.id), { statut: b.dataset.statut, updatedAt: serverTimestamp() });
    toast("Statut mis à jour ✔");
  } catch (err) {
    console.error(err);
    toast("Action impossible.");
    b.disabled = false;
  }
});

// Onglets
function bascule(conteneur, attr, set) {
  $(conteneur).addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $(conteneur).querySelectorAll("button").forEach((x) => x.classList.toggle("actif", x === b));
    set(b.dataset[attr]);
    afficher();
  });
}
bascule("vue", "vue", (v) => (vue = v));
bascule("filtre", "f", (v) => (filtre = v));
