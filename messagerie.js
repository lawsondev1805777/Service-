// Interface de discussion en temps réel
// Chaque demande = une conversation : demandes/{id}/messages
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, requireAuth, renderNav, watchMyRequests, STATUTS, esc, initiale, fmtHeure, toast } from "./m4-common.js";

const user = await requireAuth();
renderNav("messagerie", user);

const $ = (id) => document.getElementById(id);
let demandes = [];
let courante = null;        // demande ouverte
let stopMessages = null;    // désabonnement du flux de messages

const nomAutre = (d) => (d.role === "client" ? d.prestataireNom || "Professionnel" : d.clientNom || "Client");

function afficherListe() {
  $("convs").innerHTML = demandes.length
    ? demandes.map((d) => `
      <div class="conv ${courante?.id === d.id ? "actif" : ""}" data-id="${d.id}">
        <div class="avatar">${esc(initiale(nomAutre(d)))}</div>
        <div><b>${esc(nomAutre(d))}</b><small>${esc(d.titre)} · ${(STATUTS[d.statut] || {}).label || ""}</small></div>
      </div>`).join("")
    : `<div class="vide">Aucune conversation.<br>Envoyez une demande pour commencer à discuter.</div>`;
}

function ouvrir(id) {
  const d = demandes.find((x) => x.id === id);
  if (!d) return;
  courante = d;
  history.replaceState(null, "", `?id=${id}`);
  $("app").classList.add("ouvert");
  $("chat-vide").style.display = "none";
  $("chat-zone").style.display = "flex";
  $("ch-av").textContent = initiale(nomAutre(d));
  $("ch-nom").textContent = nomAutre(d);
  $("ch-sujet").textContent = d.titre;
  const ferme = d.statut === "refusee" || d.statut === "annulee";
  $("texte").disabled = ferme;
  $("texte").placeholder = ferme ? "Cette demande est clôturée." : "Écrire un message…";
  afficherListe();

  stopMessages?.();
  stopMessages = onSnapshot(
    query(collection(db, "demandes", id, "messages"), orderBy("createdAt")),
    (snap) => {
      const zone = $("messages");
      zone.innerHTML = snap.docs.map((m) => {
        const x = m.data();
        return `<div class="bulle ${x.senderId === user.uid ? "envoye" : "recu"}">${esc(x.texte)}<time>${fmtHeure(x.createdAt)}</time></div>`;
      }).join("") || `<div class="chat-vide">Dites bonjour 👋</div>`;
      zone.scrollTop = zone.scrollHeight;
    },
    (err) => { console.error(err); toast("Impossible de charger les messages."); }
  );
}

watchMyRequests(user.uid, (liste) => {
  demandes = liste;
  afficherListe();
  const voulu = new URLSearchParams(location.search).get("id");
  if (!courante && voulu) ouvrir(voulu);
  else if (courante) courante = demandes.find((x) => x.id === courante.id) || courante;
});

$("convs").addEventListener("click", (e) => {
  const c = e.target.closest(".conv");
  if (c) ouvrir(c.dataset.id);
});
$("retour").addEventListener("click", () => $("app").classList.remove("ouvert"));

$("saisie").addEventListener("submit", async (e) => {
  e.preventDefault();
  const texte = $("texte").value.trim();
  if (!texte || !courante) return;
  $("texte").value = "";
  try {
    await addDoc(collection(db, "demandes", courante.id, "messages"), {
      senderId: user.uid,
      texte,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error(err);
    $("texte").value = texte;
    toast("Message non envoyé.");
  }
});
